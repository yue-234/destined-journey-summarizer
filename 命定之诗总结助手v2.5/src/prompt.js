/**
 * prompt.js
 * 总结提示词参数构建
 * 依赖: storage.js, messages.js, worldbook.js, errorHandler.js
 */

const buildSummaryPromptParams = errorCatched(async (startFloor, endFloor) => {
  const settings = getSettings();
  const rawMsgs = await getRawMessages(startFloor, endFloor);
  const processed = processMessagesByTags(rawMsgs, settings.includeTags, settings.excludeTags);
  if (processed.length === 0) {
    throw new Error(`楼层 ${startFloor}-${endFloor} 中没有提取到任何有效内容`);
  }
  const mergedChatText = messagesToMergedText(
    processed,
    settings.userPrefix,
    settings.assistantPrefix
  );
  let oldSummaryContent = '';
  if (settings.includeOldSummary) {
    const allSummaries = await getAllSummaryContents();
    if (allSummaries.length > 0) {
      oldSummaryContent = allSummaries
        .map((s) => `[${s.name}]\n${s.content}`)
        .join('\n\n');
    }
  }
  const scanText = await getRawChatTextForScan(startFloor, endFloor);
  return {
    promptBlocks: settings.promptBlocks || [],
    oldSummaryContent,
    mergedChatText,
    scanText,
  };
});

const buildRegeneratePromptParams = errorCatched(async (entryName) => {
  const settings = getSettings();
  const parsed = parseSummaryEntryName(entryName);
  if (!parsed) throw new Error('条目名不符合"总结x-y楼"格式');
  const { start, end } = parsed;
  const lastId = getLastMessageId();
  const actualEnd = Math.min(end, lastId);
  const rawMsgs = await getRawMessages(start, actualEnd);
  const processed = processMessagesByTags(rawMsgs, settings.includeTags, settings.excludeTags);
  if (processed.length === 0) {
    throw new Error(`楼层 ${start}-${actualEnd} 中没有提取到任何有效内容`);
  }
  const mergedChatText = messagesToMergedText(
    processed,
    settings.userPrefix,
    settings.assistantPrefix
  );
  let oldSummaryContent = '';
  if (settings.includeOldSummary) {
    const beforeSummaries = await getSummaryContentsBefore(entryName);
    if (beforeSummaries.length > 0) {
      oldSummaryContent = beforeSummaries
        .map((s) => `[${s.name}]\n${s.content}`)
        .join('\n\n');
    }
  }
  const scanText = await getRawChatTextForScan(start, actualEnd);
  return {
    promptBlocks: settings.promptBlocks || [],
    oldSummaryContent,
    mergedChatText,
    scanText,
  };
});
