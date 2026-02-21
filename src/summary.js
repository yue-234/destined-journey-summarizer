/**
 * summary.js
 * 总结流程：触发判断、执行生成、重新生成、自动触发
 * 依赖: config.js, utils.js, storage.js, api.js, prompt.js, worldbook.js, errorHandler.js
 */

let _summaryHintEl = null;
let _summaryHintStyleReady = false;

// ---- 总结进度提示 UI ----

const ensureSummaryHintStyle = () => {
  if (_summaryHintStyleReady) return;
  const doc = window.top?.document || document;
  if (doc.getElementById('sa-summary-hint-style')) {
    _summaryHintStyleReady = true;
    return;
  }
  const style = doc.createElement('style');
  style.id = 'sa-summary-hint-style';
  style.textContent = `
    .sa-summary-hint {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10020;
      min-width: 280px;
      max-width: min(90vw, 780px);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.5;
      color: #eee;
      background: rgba(26, 26, 46, 0.94);
      border: 1px solid rgba(123, 104, 238, 0.55);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
      pointer-events: none;
      text-align: center;
      white-space: pre-wrap;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }
    .sa-summary-hint.sa-summary-hint-success {
      border-color: rgba(40, 167, 69, 0.75);
      background: rgba(26, 46, 33, 0.92);
    }
    .sa-summary-hint.sa-summary-hint-error {
      border-color: rgba(220, 53, 69, 0.75);
      background: rgba(55, 24, 28, 0.92);
    }
  `;
  doc.head.appendChild(style);
  _summaryHintStyleReady = true;
};

const showSummaryHint = (text, variant = 'info') => {
  const doc = window.top?.document || document;
  ensureSummaryHintStyle();
  if (!_summaryHintEl || !_summaryHintEl.isConnected) {
    _summaryHintEl = doc.createElement('div');
    _summaryHintEl.className = 'sa-summary-hint';
    doc.body.appendChild(_summaryHintEl);
  }
  _summaryHintEl.className = `sa-summary-hint${
    variant === 'success'
      ? ' sa-summary-hint-success'
      : variant === 'error'
        ? ' sa-summary-hint-error'
        : ''
  }`;
  _summaryHintEl.textContent = text;
};

const hideSummaryHint = () => {
  if (_summaryHintEl && _summaryHintEl.isConnected) {
    _summaryHintEl.remove();
  }
  _summaryHintEl = null;
};

const showSummaryHintFor = (text, variant = 'info', ms = 2800) => {
  showSummaryHint(text, variant);
  setTimeout(() => {
    if (_summaryHintEl && _summaryHintEl.textContent === text) {
      hideSummaryHint();
    }
  }, ms);
};

// ---- 总结计划 ----

const computeSummaryPlan = errorCatched(async () => {
  const settings = getSettings();
  const lastId = getLastMessageId();
  if (lastId < 0) return null;
  const lastSummarized = await getLastSummarizedFloor();
  const startFloor = lastSummarized + 1;
  const endFloor = lastId - settings.keepFloorCount;
  if (endFloor < startFloor) return null;
  return {
    startFloor,
    endFloor,
    entryName: makeSummaryEntryName(startFloor, endFloor),
    lastId,
    unsummarizedCount: lastId - lastSummarized,
  };
});

const shouldAutoTrigger = errorCatched(async () => {
  const settings = getSettings();
  const lastId = getLastMessageId();
  if (lastId < 0) return false;
  const lastSummarized = await getLastSummarizedFloor();
  const unsummarizedCount = lastId - lastSummarized;
  return unsummarizedCount >= settings.triggerFloorCount;
});

// ---- 执行总结 ----

const startSummaryProcess = errorCatched(async () => {
  const plan = await computeSummaryPlan();
  if (!plan) {
    toastr.warning('当前没有需要总结的楼层。');
    return;
  }
  const confirm = await SillyTavern.callGenericPopup(
    `将总结以下楼层范围：\n\n` +
      `起始楼层：${plan.startFloor}\n` +
      `结束楼层：${plan.endFloor}\n` +
      `条目名称：${escapeHtml(plan.entryName)}\n\n` +
      `未总结消息数：${plan.unsummarizedCount}\n` +
      `继续吗？`,
    SillyTavern.POPUP_TYPE.CONFIRM
  );
  if (confirm !== SillyTavern.POPUP_RESULT.AFFIRMATIVE) return;
  await executeSummary(plan.startFloor, plan.endFloor, plan.entryName, {
    requireReview: true,
  });
});

const executeSummary = errorCatched(
  async (startFloor, endFloor, entryName, { requireReview = false } = {}) => {
    showSummaryHint(
      `正在生成总结，请稍候...\n总结范围：${startFloor} - ${endFloor} 楼`
    );
    try {
      const params = await buildSummaryPromptParams(startFloor, endFloor);
      const aiMessage = await callSummaryApi(params);
      if (!aiMessage) {
        showSummaryHintFor('总结失败：AI没有返回任何内容。', 'error', 3800);
        toastr.error('AI没有返回任何内容。');
        return;
      }
      let contentToSave = aiMessage;
      if (requireReview) {
        const result = await SillyTavern.callGenericPopup(
          `AI生成的总结（将保存为：${escapeHtml(entryName)}），可在下方编辑：`,
          SillyTavern.POPUP_TYPE.INPUT,
          aiMessage,
          { rows: 12, wide: true, okButton: '确定保存', cancelButton: '取消' }
        );
        if (typeof result !== 'string') {
          showSummaryHintFor('已取消保存本次总结。', 'info', 2200);
          toastr.info('操作已取消。');
          return;
        }
        contentToSave = result;
      }
      await upsertSummaryEntryByName(entryName, contentToSave);
      showSummaryHintFor(`总结已生成：${entryName}`, 'success', 3200);
      toastr.success(`总结已保存：${entryName}`);
    } catch (error) {
      console.error('总结过程中出错:', error);
      const errMsg = formatErrorMessage(error);
      showSummaryHintFor(`总结失败：${errMsg}`, 'error', 4200);
      toastr.error(`总结失败: ${errMsg}`);
    }
  }
);

// ---- 重新生成 ----

const regenerateAndReplaceEntry = errorCatched(async (entryName) => {
  const parsed = parseSummaryEntryName(entryName);
  if (!parsed) {
    toastr.error('条目名不符合"总结x-y楼"格式。');
    return;
  }
  const lastId = getLastMessageId();
  if (lastId < 0) {
    toastr.warning('聊天为空，无法生成。');
    return;
  }
  const { start, end } = parsed;
  if (start > lastId) {
    toastr.error(`条目起始楼层超出当前聊天（最后一楼=${lastId}）。`);
    return;
  }
  const confirm = await SillyTavern.callGenericPopup(
    `将对条目「${escapeHtml(entryName)}」执行重新生成。\n\n` +
      `流程：\n` +
      `1) 提取 ${start}-${Math.min(end, lastId)} 楼的标签内容\n` +
      `2) 发送该条目之前的总结作为上下文（不含该条目及之后的）\n` +
      `3) 调用API生成总结并替换该条目内容\n\n` +
      `继续吗？`,
    SillyTavern.POPUP_TYPE.CONFIRM
  );
  if (confirm !== SillyTavern.POPUP_RESULT.AFFIRMATIVE) return;
  showSummaryHint(`正在重新生成条目，请稍候...\n目标条目：${entryName}`);
  try {
    const params = await buildRegeneratePromptParams(entryName);
    const aiMessage = await callSummaryApi(params);
    if (!aiMessage) {
      showSummaryHintFor('重新生成失败：AI没有返回任何内容。', 'error', 3800);
      toastr.error('AI没有返回任何内容。');
      return;
    }
    const result = await SillyTavern.callGenericPopup(
      `重新生成的总结（${escapeHtml(entryName)}），可在下方编辑：`,
      SillyTavern.POPUP_TYPE.INPUT,
      aiMessage,
      { rows: 12, wide: true, okButton: '确定替换', cancelButton: '取消' }
    );
    if (typeof result !== 'string') {
      showSummaryHintFor('已取消替换该条目。', 'info', 2200);
      toastr.info('操作已取消。');
      return;
    }
    await upsertSummaryEntryByName(entryName, result);
    showSummaryHintFor(`条目已重新生成：${entryName}`, 'success', 3200);
    toastr.success(`已重新生成并替换：${entryName}`);
  } catch (error) {
    console.error('重新生成失败:', error);
    const errMsg = formatErrorMessage(error);
    showSummaryHintFor(`重新生成失败：${errMsg}`, 'error', 4200);
    toastr.error(`重新生成失败: ${errMsg}`);
  }
});

// ---- 自动触发 ----

const autoTriggerSummary = errorCatched(async () => {
  const should = await shouldAutoTrigger();
  if (!should) return;
  const settings = getSettings();
  const plan = await computeSummaryPlan();
  if (!plan) return;
  if (settings.autoTriggerConfirm) {
    const confirm = await SillyTavern.callGenericPopup(
      `未总结消息已达 ${plan.unsummarizedCount} 条（触发阈值：${settings.triggerFloorCount}）。\n\n` +
        `是否开始总结 ${plan.startFloor}-${plan.endFloor} 楼？`,
      SillyTavern.POPUP_TYPE.CONFIRM
    );
    if (confirm !== SillyTavern.POPUP_RESULT.AFFIRMATIVE) return;
  }
  await executeSummary(plan.startFloor, plan.endFloor, plan.entryName, {
    requireReview: false,
  });
});

// ---- 大总结流程 ----

const executeMegaSummary = errorCatched(
  async (summaryNames, entryName, { requireReview = false } = {}) => {
    showSummaryHint(
      `正在生成大总结，请稍候...\n总结条目数：${summaryNames.length}`
    );
    try {
      const params = await buildMegaSummaryPromptParams(summaryNames);
      const aiMessage = await callMegaSummaryApi(params);
      if (!aiMessage) {
        showSummaryHintFor('大总结失败：AI没有返回任何内容。', 'error', 3800);
        toastr.error('AI没有返回任何内容。');
        return;
      }
      let contentToSave = aiMessage;
      if (requireReview) {
        const result = await SillyTavern.callGenericPopup(
          `AI生成的大总结（将保存为：${escapeHtml(entryName)}），可在下方编辑：`,
          SillyTavern.POPUP_TYPE.INPUT,
          aiMessage,
          { rows: 12, wide: true, okButton: '确定保存', cancelButton: '取消' }
        );
        if (typeof result !== 'string') {
          showSummaryHintFor('已取消保存本次大总结。', 'info', 2200);
          toastr.info('操作已取消。');
          return;
        }
        contentToSave = result;
      }
      
      // 保存大总结条目
      await upsertMegaSummaryEntry(entryName, contentToSave, summaryNames);
      
      // 禁用已被大总结的总结条目
      const wbName = getActiveWorldbookName();
      if (wbName) {
        await updateWorldbookWith(wbName, (wb) => {
          const arr = normalizeWorldbookEntries(wb);
          for (const summaryName of summaryNames) {
            const entry = arr.find((e) => e && e.name === summaryName);
            if (entry) {
              entry.enabled = false;
              entry.disable = true;
            }
          }
          return Array.isArray(wb) ? arr : { ...wb, entries: arr };
        });
      }
      
      showSummaryHintFor(`大总结已生成：${entryName}`, 'success', 3200);
      toastr.success(`大总结已保存：${entryName}`);
    } catch (error) {
      console.error('大总结过程中出错:', error);
      const errMsg = formatErrorMessage(error);
      showSummaryHintFor(`大总结失败：${errMsg}`, 'error', 4200);
      toastr.error(`大总结失败: ${errMsg}`);
    }
  }
);

const regenerateAndReplaceMegaEntry = errorCatched(async (entryName) => {
  const parsed = parseMegaSummaryEntryName(entryName);
  if (!parsed) {
    toastr.error('条目名不符合"大总结x-y楼"格式。');
    return;
  }
  
  const summaryNames = await getMegaSummaryMapping(entryName);
  if (!summaryNames || summaryNames.length === 0) {
    toastr.error('未找到该大总结的原始总结条目映射。');
    return;
  }
  
  const confirm = await SillyTavern.callGenericPopup(
    `将对大总结条目「${escapeHtml(entryName)}」执行重新生成。\n\n` +
      `流程：\n` +
      `1) 提取原始总结条目的内容（共${summaryNames.length}个）\n` +
      `2) 发送该大总结之前的大总结作为上下文（不含该大总结及之后的）\n` +
      `3) 调用API生成大总结并替换该条目内容\n\n` +
      `继续吗？`,
    SillyTavern.POPUP_TYPE.CONFIRM
  );
  if (confirm !== SillyTavern.POPUP_RESULT.AFFIRMATIVE) return;
  
  showSummaryHint(`正在重新生成大总结条目，请稍候...\n目标条目：${entryName}`);
  try {
    const params = await buildRegenerateMegaSummaryPromptParams(entryName);
    const aiMessage = await callMegaSummaryApi(params);
    if (!aiMessage) {
      showSummaryHintFor('重新生成失败：AI没有返回任何内容。', 'error', 3800);
      toastr.error('AI没有返回任何内容。');
      return;
    }
    const result = await SillyTavern.callGenericPopup(
      `重新生成的大总结（${escapeHtml(entryName)}），可在下方编辑：`,
      SillyTavern.POPUP_TYPE.INPUT,
      aiMessage,
      { rows: 12, wide: true, okButton: '确定替换', cancelButton: '取消' }
    );
    if (typeof result !== 'string') {
      showSummaryHintFor('已取消替换该大总结条目。', 'info', 2200);
      toastr.info('操作已取消。');
      return;
    }
    await upsertMegaSummaryEntry(entryName, result, summaryNames);
    showSummaryHintFor(`大总结条目已重新生成：${entryName}`, 'success', 3200);
    toastr.success(`已重新生成并替换：${entryName}`);
  } catch (error) {
    console.error('重新生成大总结失败:', error);
    const errMsg = formatErrorMessage(error);
    showSummaryHintFor(`重新生成失败：${errMsg}`, 'error', 4200);
    toastr.error(`重新生成失败: ${errMsg}`);
  }
});
