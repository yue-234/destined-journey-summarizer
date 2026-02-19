# 命定之诗总结助手

<div align="center">

**命定之诗角色卡专用的 SillyTavern 总结脚本**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-2.5.0-blue)](https://github.com/yourusername/destiny-poem-summary-assistant)

用于自动/手动总结聊天内容并存入世界书

</div>

---

## ✨ 特性

- 🤖 **自动总结**：自动提取聊天内容并生成总结
- 📚 **世界书集成**：直接将总结存入 SillyTavern 世界书
- ⚙️ **灵活配置**：支持自定义 API、提示词等多项设置
- 🎨 **友好界面**：提供可视化设置面板和状态显示
- 🔄 **模块化设计**：清晰的代码结构，易于维护和扩展

## 📦 安装

### 前置要求

- [Node.js](https://nodejs.org/) >= 12.0.0
- [SillyTavern](https://github.com/SillyTavern/SillyTavern)

### 构建步骤

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/destiny-poem-summary-assistant.git
cd destiny-poem-summary-assistant
```

2. 运行构建脚本：
```bash
node build.js
```

3. 构建产物将输出到 `dist/命定之诗总结脚本.js`

4. 将生成的脚本文件导入到 SillyTavern 中使用

## 📖 使用说明

详细使用文档请参阅 [docs/USAGE.md](docs/USAGE.md)

## 📁 项目结构

```
命定之诗总结助手/
├── .editorconfig          # 编辑器配置
├── .gitattributes         # Git 属性配置
├── .gitignore             # Git 忽略文件配置
├── LICENSE                # MIT 许可证
├── README.md              # 项目说明文档
├── CHANGELOG.md           # 版本更新日志
├── CONTRIBUTING.md        # 贡献指南
├── package.json           # 项目配置文件
├── build.js               # 构建脚本：将模块合并为单文件
├── dist/                  # 构建输出目录
│   └── 命定之诗总结脚本.js
├── docs/                  # 文档目录
│   ├── USAGE.md           # 使用说明
│   └── ARCHITECTURE.md    # 架构说明
└── src/                   # 源代码目录
    ├── index.js           # 主入口：事件绑定、初始化
    ├── errorHandler.js    # 错误处理包装器
    ├── config.js          # 配置常量、默认设置
    ├── utils.js           # 通用工具函数
    ├── storage.js         # 设置的加载/保存/迁移
    ├── messages.js        # 聊天消息提取与处理
    ├── api.js             # API 调用（酒馆/自定义）
    ├── prompt.js          # 总结提示词参数构建
    ├── summary.js         # 总结流程（触发/执行/重新生成）
    ├── worldbook.js       # 世界书绑定/条目管理
    └── ui/                # UI 相关模块
        ├── styles.js      # 面板 CSS 样式
        ├── renderer.js    # 状态信息与条目列表渲染
        ├── panel.js       # 设置面板 UI 与事件绑定
        └── panelEvents.js # 面板事件处理
```

## 🔧 模块依赖关系

```
index.js
├── errorHandler.js   (全局错误包装)
├── config.js         (配置常量)
├── utils.js          (工具函数)
├── storage.js        → config, utils, errorHandler
├── messages.js       → utils, errorHandler
├── api.js            → config, storage, messages, errorHandler
├── prompt.js         → config, storage, messages, worldbook, errorHandler
├── worldbook.js      → config, utils, storage, errorHandler
├── summary.js        → config, storage, messages, api, prompt, worldbook, errorHandler
└── ui/
    ├── styles.js     (纯 CSS)
    ├── renderer.js   → utils, storage, worldbook, errorHandler
    ├── panel.js      → config, utils, storage, summary, worldbook, ui/styles, ui/renderer, errorHandler
    └── panelEvents.js → panel 相关事件处理
```

## 🚀 开发

### 构建命令

```bash
# 构建项目
npm run build

# 或直接使用 Node.js
node build.js
```

### 代码规范

项目使用 EditorConfig 保持代码风格一致性，请确保你的编辑器支持 EditorConfig。

## ⚠️ 注意事项

- ⚡ 本脚本专为**命定之诗角色卡**设计，用于其它角色卡不保证效果
- 🔒 脚本运行在 SillyTavern 的脚本沙盒环境中
- 🔌 依赖 SillyTavern 提供的全局 API（如 `getVariables`、`getChatMessages`、`eventOn` 等）

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

## 👤 作者

**Rhys_z_瑞**

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！详见 [贡献指南](CONTRIBUTING.md)。

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ 吧！**

</div>
