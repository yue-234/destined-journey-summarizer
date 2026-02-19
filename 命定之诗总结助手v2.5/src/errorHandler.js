/**
 * errorHandler.js
 * 全局错误处理包装器
 * 将 async 函数包装为自动捕获异常并显示 toastr 提示的版本
 */

function errorCatched(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('[SummaryAssist] Catched error:', error);
      toastr.error(`[总结助手] 操作失败: ${error.message}`);
    }
  };
}
