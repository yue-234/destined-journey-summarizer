/**
 * storage.js
 * 设置的加载、保存、迁移、重置
 * 依赖: config.js, utils.js, errorHandler.js
 */

let _cachedSettings = null;

const cloneSettings = (settings) => ({
  ...settings,
  includeTags: Array.isArray(settings?.includeTags)
    ? [...settings.includeTags]
    : [...DEFAULT_SETTINGS.includeTags],
  excludeTags: Array.isArray(settings?.excludeTags)
    ? [...settings.excludeTags]
    : [...DEFAULT_SETTINGS.excludeTags],
  promptBlocks: Array.isArray(settings?.promptBlocks)
    ? settings.promptBlocks.map((b) => ({ ...b }))
    : DEFAULT_PROMPT_BLOCKS.map((b) => ({ ...b })),
});

const migrateOldSettings = (raw) => {
  if (Array.isArray(raw.promptBlocks) && raw.promptBlocks.length > 0) return raw;
  const blocks = DEFAULT_PROMPT_BLOCKS.map((b) => ({ ...b }));
  for (const block of blocks) {
    if (block.id === 'jailbreak' && raw.jailbreakPrompt !== undefined) {
      block.content = raw.jailbreakPrompt;
      if (raw.jailbreakRole) block.role = raw.jailbreakRole;
    }
    if (block.id === 'summary_rules' && raw.summaryRulesPrompt !== undefined) {
      block.content = raw.summaryRulesPrompt;
      if (raw.summaryRulesRole) block.role = raw.summaryRulesRole;
    }
    if (block.id === 'old_summary' && raw.oldSummaryRole) {
      block.role = raw.oldSummaryRole;
    }
    if (block.id === 'chat_messages' && raw.chatMessagesRole) {
      block.role = raw.chatMessagesRole;
    }
    if (block.id === 'summary_instruction' && raw.summaryInstruction !== undefined) {
      block.content = raw.summaryInstruction;
      if (raw.summaryInstructionRole) block.role = raw.summaryInstructionRole;
    }
  }
  raw.promptBlocks = blocks;
  delete raw.jailbreakPrompt;
  delete raw.jailbreakRole;
  delete raw.summaryRulesPrompt;
  delete raw.summaryRulesRole;
  delete raw.oldSummaryRole;
  delete raw.chatMessagesRole;
  delete raw.summaryInstruction;
  delete raw.summaryInstructionRole;
  return raw;
};

const validateBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return DEFAULT_PROMPT_BLOCKS.map((b) => ({ ...b }));
  const normalized = blocks
    .map((b) => {
      if (!b || typeof b !== 'object') return null;
      if (!b.id) b.id = generateBlockId();
      if (!b.type) b.type = BLOCK_TYPES.PROMPT;
      if (!b.name) b.name = '未命名板块';
      if (b.enabled === undefined) b.enabled = true;
      if (b.type === BLOCK_TYPES.PROMPT && b.content === undefined) b.content = '';
      if (b.role === undefined && b.type !== BLOCK_TYPES.BUILTIN_GROUP) b.role = 'system';
      return b;
    })
    .filter(Boolean);
  const byId = new Map(normalized.map((b) => [b.id, b]));
  for (const defaultBlock of DEFAULT_PROMPT_BLOCKS) {
    if (!byId.has(defaultBlock.id)) {
      normalized.push({ ...defaultBlock });
    }
  }
  return normalized;
};

const loadSettings = errorCatched(async () => {
  try {
    const vars = getVariables({ type: 'script' });
    const raw = vars?.[CONFIG.SETTINGS_VAR_KEY];
    if (raw && typeof raw === 'object') {
      const migrated = migrateOldSettings({ ...raw });
      _cachedSettings = { ...DEFAULT_SETTINGS, ...migrated };
      if (!Array.isArray(_cachedSettings.includeTags))
        _cachedSettings.includeTags = [...DEFAULT_SETTINGS.includeTags];
      if (!Array.isArray(_cachedSettings.excludeTags))
        _cachedSettings.excludeTags = [...DEFAULT_SETTINGS.excludeTags];
      _cachedSettings.promptBlocks = validateBlocks(_cachedSettings.promptBlocks);
    } else {
      _cachedSettings = cloneSettings({
        ...DEFAULT_SETTINGS,
        promptBlocks: DEFAULT_PROMPT_BLOCKS.map((b) => ({ ...b })),
      });
    }
  } catch (e) {
    console.warn('加载设置失败，使用默认值:', e);
    _cachedSettings = cloneSettings({
      ...DEFAULT_SETTINGS,
      promptBlocks: DEFAULT_PROMPT_BLOCKS.map((b) => ({ ...b })),
    });
  }
  return _cachedSettings;
});

const saveSettings = errorCatched(async (settings) => {
  _cachedSettings = cloneSettings(settings);
  insertOrAssignVariables(
    { [CONFIG.SETTINGS_VAR_KEY]: cloneSettings(_cachedSettings) },
    { type: 'script' }
  );
});

const getSettings = () => {
  if (!_cachedSettings)
    return cloneSettings({
      ...DEFAULT_SETTINGS,
      promptBlocks: DEFAULT_PROMPT_BLOCKS.map((b) => ({ ...b })),
    });
  return cloneSettings(_cachedSettings);
};

const updateSettings = errorCatched(async (partial) => {
  const current = getSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
});

const resetSettings = errorCatched(async () => {
  const defaults = cloneSettings({
    ...DEFAULT_SETTINGS,
    promptBlocks: DEFAULT_PROMPT_BLOCKS.map((b) => ({ ...b })),
  });
  await saveSettings(defaults);
  return defaults;
});
