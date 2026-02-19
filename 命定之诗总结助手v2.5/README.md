# 命定之诗总结助手 V2.5

命定之诗角色卡专用的 SillyTavern 总结脚本，用于自动/手动总结聊天内容并存入世界书。

## 项目结构

```
命定之诗总结助手v2.5/
├── README.md              # 本文件
├── build.js               # 构建脚本：将模块合并为单文件
├── dist/                  # 构建输出目录
│   └── 命定之诗总结脚本v2.5.js
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
    └── ui/
        ├── styles.js      # 面板 CSS 样式
        ├── renderer.js    # 状态信息与条目列表渲染
        └── panel.js       # 设置面板 UI 与事件绑定
```

## 构建

使用 Node.js 运行构建脚本，将所有模块合并为可在 SillyTavern 中直接使用的单文件：

```bash
node build.js
```

构建产物输出到 `dist/命定之诗总结脚本v2.5.js`。

## 模块依赖关系

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
    └── panel.js      → config, utils, storage, summary, worldbook, ui/styles, ui/renderer, errorHandler
```

## 作者

Rhys_z_瑞

## 说明

- 命定之诗角色卡专用，用于其它卡不保证效果
- 脚本运行在 SillyTavern 的脚本沙盒环境中
- 依赖 SillyTavern 提供的全局 API（如 `getVariables`、`getChatMessages`、`eventOn` 等）
