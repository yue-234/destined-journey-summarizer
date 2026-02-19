# 贡献指南

感谢你对命定之诗总结助手项目的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告问题

如果你发现了 Bug 或有功能建议：

1. 在 [Issues](https://github.com/yourusername/destiny-poem-summary-assistant/issues) 页面搜索是否已有相关问题
2. 如果没有，创建新的 Issue
3. 清晰描述问题或建议，包括：
   - 问题的详细描述
   - 复现步骤（如果是 Bug）
   - 期望的行为
   - 实际的行为
   - 环境信息（SillyTavern 版本、浏览器等）
   - 相关的错误日志或截图

### 提交代码

#### 准备工作

1. Fork 本仓库
2. 克隆你的 Fork：
```bash
git clone https://github.com/your-username/destiny-poem-summary-assistant.git
cd destiny-poem-summary-assistant
```

3. 创建新分支：
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

#### 开发规范

##### 代码风格

- 使用 2 个空格缩进
- 使用单引号而非双引号（除非必要）
- 函数和变量使用驼峰命名法
- 常量使用大写下划线命名法
- 添加必要的注释，特别是复杂逻辑

示例：
```javascript
// ✅ 好的示例
const MAX_RETRY_COUNT = 3;

function getUserMessages(chatId) {
  // 从聊天历史中提取用户消息
  const messages = getChatMessages(chatId);
  return messages.filter(msg => msg.is_user);
}

// ❌ 不好的示例
const max_retry_count = 3;

function GetUserMessages(chatId) {
  const messages = getChatMessages(chatId);
  return messages.filter(msg => msg.is_user);
}
```

##### 模块化原则

- 每个模块保持单一职责
- 避免循环依赖
- 新增模块需更新 [`build.js`](../build.js) 中的 `MODULE_ORDER`
- 保持模块间的低耦合

##### 错误处理

- 使用 `errorHandler.js` 包装可能出错的函数
- 提供有意义的错误信息
- 避免静默失败

示例：
```javascript
const safeFetchData = wrapWithErrorHandler(async function fetchData() {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}, 'fetchData');
```

##### 注释规范

使用 JSDoc 风格注释：

```javascript
/**
 * 从聊天历史中提取指定数量的消息
 * 
 * @param {number} count - 要提取的消息数量
 * @param {boolean} includeSystem - 是否包含系统消息
 * @returns {Array<Object>} 消息对象数组
 */
function extractMessages(count, includeSystem = false) {
  // 实现...
}
```

#### 提交规范

使用语义化的提交信息：

```
<类型>: <简短描述>

<详细描述>（可选）

<关联 Issue>（可选）
```

类型包括：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```bash
git commit -m "feat: 添加批量删除总结功能

支持一次性删除多个总结条目，提高操作效率

Closes #123"
```

#### 测试

在提交前请确保：

1. 运行构建脚本无错误：
```bash
node build.js
```

2. 在 SillyTavern 中测试构建产物
3. 检查浏览器控制台无错误
4. 验证核心功能正常工作

#### 提交 Pull Request

1. 推送你的分支：
```bash
git push origin feature/your-feature-name
```

2. 在 GitHub 上创建 Pull Request
3. 填写 PR 模板，说明：
   - 改动的内容
   - 改动的原因
   - 测试情况
   - 相关的 Issue

4. 等待代码审查
5. 根据反馈进行修改

## 📝 文档贡献

文档同样重要！你可以：

- 修正文档中的错误
- 补充使用示例
- 翻译文档到其他语言
- 改进文档结构

文档位于：
- [`README.md`](../README.md) - 项目主文档
- [`docs/USAGE.md`](docs/USAGE.md) - 使用说明
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - 架构文档
- [`CHANGELOG.md`](../CHANGELOG.md) - 更新日志

## 🎨 设计贡献

如果你擅长 UI/UX 设计：

- 改进界面布局
- 优化交互体验
- 设计图标和视觉元素
- 提供设计建议

## 💡 功能建议

有好的想法？欢迎：

1. 在 Issues 中提出功能建议
2. 说明功能的使用场景
3. 描述期望的实现方式
4. 讨论可行性

## ❓ 问题讨论

如果你有疑问：

1. 查看 [使用文档](docs/USAGE.md)
2. 搜索已有的 Issues
3. 在 Discussions 中提问
4. 联系维护者

## 📋 开发路线图

查看 [Issues](https://github.com/yourusername/destiny-poem-summary-assistant/issues) 中标记为 `enhancement` 的内容，了解计划中的功能。

## 🏆 贡献者

感谢所有为本项目做出贡献的开发者！

## 📄 许可证

通过贡献代码，你同意你的贡献将在 [MIT 许可证](../LICENSE) 下发布。

---

再次感谢你的贡献！每一个 PR、Issue 和建议都让这个项目变得更好。
