/**
 * api.js
 * API 调用逻辑（酒馆主API / 自定义API）
 * 依赖: config.js, storage.js, messages.js, errorHandler.js
 */

const buildCustomApiConfig = (settings) => {
  if (settings.apiMode !== 'custom') return undefined;
  if (!settings.customApiUrl || !settings.customApiModel) {
    throw new Error('自定义API模式下必须填写API地址和模型名称');
  }
  const config = {
    apiurl: settings.customApiUrl,
    model: settings.customApiModel,
    source: settings.customApiSource || 'openai',
  };
  if (settings.customApiKey) config.key = settings.customApiKey;
  if (settings.temperature !== 'same_as_preset') config.temperature = settings.temperature;
  if (settings.maxTokens !== 'same_as_preset') config.max_tokens = settings.maxTokens;
  return config;
};

const callSummaryApi = errorCatched(
  async ({ promptBlocks, oldSummaryContent, mergedChatText, scanText }) => {
    const settings = getSettings();
    const customApi = buildCustomApiConfig(settings);
    const useNoTrans = settings.noTransTag !== false;
    const NO_TRANS = '<|no-trans|>';
    const wrapContent = (text) => (useNoTrans ? `${NO_TRANS}${text}` : text);

    const orderedPrompts = [];
    for (const block of promptBlocks) {
      if (!block.enabled) continue;
      switch (block.type) {
        case BLOCK_TYPES.PROMPT: {
          const content = replaceMacros(block.content || '');
          if (content.trim()) {
            orderedPrompts.push({
              role: block.role || 'system',
              content: wrapContent(content),
            });
          }
          break;
        }
        case BLOCK_TYPES.BUILTIN_GROUP: {
          orderedPrompts.push(...BUILTIN_PROMPTS);
          break;
        }
        case BLOCK_TYPES.OLD_SUMMARY: {
          if (oldSummaryContent && oldSummaryContent.trim()) {
            orderedPrompts.push({
              role: block.role || 'system',
              content: wrapContent(
                `<existing_summary>\n${oldSummaryContent}\n</existing_summary>`
              ),
            });
          }
          break;
        }
        case BLOCK_TYPES.CHAT_MESSAGES: {
          if (mergedChatText && mergedChatText.trim()) {
            orderedPrompts.push({
              role: block.role || 'user',
              content: wrapContent(
                `以下是本次需要总结的聊天内容：\n\n${mergedChatText}`
              ),
            });
          }
          break;
        }
      }
    }

    const injects = [];
    if (scanText && scanText.trim()) {
      injects.push({
        role: 'system',
        content: scanText,
        position: 'none',
        should_scan: true,
      });
    }

    const config = { should_silence: true, ordered_prompts: orderedPrompts, injects };
    if (customApi) config.custom_api = customApi;

    let generateRawFn =
      (typeof generateRaw !== 'undefined' ? generateRaw : undefined) ||
      (typeof window !== 'undefined'
        ? window.generateRaw || (window.parent && window.parent.generateRaw)
        : undefined);

    if (generateRawFn) {
      try {
        const result = await generateRawFn(config);
        return result ? String(result).trim() : '';
      } catch (e) {
        console.warn('Global generateRaw failed, trying fetch fallback', e);
      }
    }

    console.log('Using fetch fallback for generateRaw');
    const headers = { 'Content-Type': 'application/json' };
    const stObj =
      typeof SillyTavern !== 'undefined'
        ? SillyTavern
        : window.SillyTavern || (window.parent && window.parent.SillyTavern);
    if (stObj && stObj.getRequestHeaders) {
      const stHeaders = stObj.getRequestHeaders();
      Object.assign(headers, stHeaders);
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Generation failed (${response.status}): ${errText}`);
    }
    const resultData = await response.json();
    if (
      resultData &&
      Array.isArray(resultData.results) &&
      resultData.results.length > 0
    ) {
      return String(resultData.results[0].text).trim();
    }
    return '';
  }
);

const callMegaSummaryApi = errorCatched(
  async ({ promptBlocks, oldMegaSummaryContent, mergedSummaryText }) => {
    const settings = getSettings();
    const customApi = buildCustomApiConfig(settings);
    const useNoTrans = settings.noTransTag !== false;
    const NO_TRANS = '<|no-trans|>';
    const wrapContent = (text) => (useNoTrans ? `${NO_TRANS}${text}` : text);

    const orderedPrompts = [];
    for (const block of promptBlocks) {
      if (!block.enabled) continue;
      switch (block.type) {
        case BLOCK_TYPES.PROMPT: {
          const content = replaceMacros(block.content || '');
          if (content.trim()) {
            orderedPrompts.push({
              role: block.role || 'system',
              content: wrapContent(content),
            });
          }
          break;
        }
        case BLOCK_TYPES.BUILTIN_GROUP: {
          orderedPrompts.push(...BUILTIN_PROMPTS);
          break;
        }
        case BLOCK_TYPES.OLD_SUMMARY: {
          if (oldMegaSummaryContent && oldMegaSummaryContent.trim()) {
            orderedPrompts.push({
              role: block.role || 'system',
              content: wrapContent(
                `<existing_mega_summary>\n${oldMegaSummaryContent}\n</existing_mega_summary>`
              ),
            });
          }
          break;
        }
        case BLOCK_TYPES.CHAT_MESSAGES: {
          if (mergedSummaryText && mergedSummaryText.trim()) {
            orderedPrompts.push({
              role: block.role || 'user',
              content: wrapContent(
                `以下是需要进行大总结的总结条目内容：\n\n${mergedSummaryText}`
              ),
            });
          }
          break;
        }
      }
    }

    const config = { should_silence: true, ordered_prompts: orderedPrompts };
    if (customApi) config.custom_api = customApi;

    let generateRawFn =
      (typeof generateRaw !== 'undefined' ? generateRaw : undefined) ||
      (typeof window !== 'undefined'
        ? window.generateRaw || (window.parent && window.parent.generateRaw)
        : undefined);

    if (generateRawFn) {
      try {
        const result = await generateRawFn(config);
        return result ? String(result).trim() : '';
      } catch (e) {
        console.warn('Global generateRaw failed, trying fetch fallback', e);
      }
    }

    console.log('Using fetch fallback for generateRaw');
    const headers = { 'Content-Type': 'application/json' };
    const stObj =
      typeof SillyTavern !== 'undefined'
        ? SillyTavern
        : window.SillyTavern || (window.parent && window.parent.SillyTavern);
    if (stObj && stObj.getRequestHeaders) {
      const stHeaders = stObj.getRequestHeaders();
      Object.assign(headers, stHeaders);
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Generation failed (${response.status}): ${errText}`);
    }
    const resultData = await response.json();
    if (
      resultData &&
      Array.isArray(resultData.results) &&
      resultData.results.length > 0
    ) {
      return String(resultData.results[0].text).trim();
    }
    return '';
  }
);

const fetchModelList = errorCatched(async (apiUrl, apiKey) => {
  if (!apiUrl) throw new Error('请先填写API地址');
  const params = { apiurl: apiUrl };
  if (apiKey) params.key = apiKey;

  let getModelListFn = undefined;
  try {
    if (typeof getModelList !== 'undefined') getModelListFn = getModelList;
    else if (typeof window !== 'undefined' && window.getModelList)
      getModelListFn = window.getModelList;
    else if (typeof window !== 'undefined' && window.parent && window.parent.getModelList)
      getModelListFn = window.parent.getModelList;
  } catch (e) {}

  if (getModelListFn) {
    try {
      return await getModelListFn(params);
    } catch (e) {
      console.warn('Global getModelList failed, falling back to fetch', e);
    }
  }

  let url = apiUrl.trim();
  if (!url.endsWith('/')) url += '/';
  if (!url.endsWith('models/') && !url.endsWith('models')) {
    url += 'models';
  }
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  try {
    console.log('Fetching models from:', url);
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (data && Array.isArray(data.data)) {
      return data.data.map((x) => x.id);
    }
    if (Array.isArray(data)) {
      return data.map((x) => x.id || x);
    }
    throw new Error('响应格式无法解析');
  } catch (e) {
    throw new Error(`获取模型列表失败: ${e.message} (尝试 URL: ${url})`);
  }
});
