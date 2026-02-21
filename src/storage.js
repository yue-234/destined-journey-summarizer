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
  // 迁移 temperature 和 maxTokens 的默认值（v2.6+）
  if (raw.temperature === 'same_as_preset') {
    raw.temperature = 1;
  }
  if (raw.maxTokens === 'same_as_preset') {
    raw.maxTokens = 32000;
  }
  
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

// ---- 大总结映射管理 ----

const loadMegaSummaryMap = errorCatched(async () => {
  try {
    const vars = getVariables({ type: 'chat' });
    const map = vars?.[CONFIG.MEGA_SUMMARY_VAR_KEY];
    if (map && typeof map === 'object') {
      return map;
    }
    return {};
  } catch (e) {
    console.warn('加载大总结映射失败:', e);
    return {};
  }
});

const saveMegaSummaryMap = errorCatched(async (map) => {
  insertOrAssignVariables(
    { [CONFIG.MEGA_SUMMARY_VAR_KEY]: map || {} },
    { type: 'chat' }
  );
});

const getMegaSummaryMap = errorCatched(async () => {
  return await loadMegaSummaryMap();
});

const setMegaSummaryMapping = errorCatched(async (megaSummaryName, summaryNames) => {
  const map = await loadMegaSummaryMap();
  map[megaSummaryName] = Array.isArray(summaryNames) ? [...summaryNames] : [];
  await saveMegaSummaryMap(map);
});

const getMegaSummaryMapping = errorCatched(async (megaSummaryName) => {
  const map = await loadMegaSummaryMap();
  return map[megaSummaryName] || null;
});

const deleteMegaSummaryMapping = errorCatched(async (megaSummaryName) => {
  const map = await loadMegaSummaryMap();
  delete map[megaSummaryName];
  await saveMegaSummaryMap(map);
});
