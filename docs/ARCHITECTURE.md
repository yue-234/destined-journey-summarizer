# 架构设计文档

> **📝 声明：本文档内容全部由 AI 生成**

本文档详细说明命定之诗总结助手的技术架构和设计思路。

## ⚠️ 运行环境依赖

本脚本是 **[JS-Slash-Runner](https://github.com/N0VI028/JS-Slash-Runner)** 酒馆助手插件的运行脚本，必须在该插件提供的环境中运行。

### JS-Slash-Runner 提供的全局函数

脚本依赖以下由 JS-Slash-Runner 插件提供的全局函数：

- **脚本管理**：`replaceScriptButtons()` - 注册脚本按钮
- **事件系统**：`eventOn()`, `eventOff()`, `getButtonEvent()` - 事件监听与触发
- **数据访问**：`getVariables()`, `getChatMessages()` - 获取聊天数据
- **UI 交互**：`toastr` - 消息提示，`callPopup()` - 弹窗显示
- **世界书操作**：世界书相关的 API 函数

**离开 JS-Slash-Runner 环境，这些函数将不可用，脚本无法运行。**

## 🏗️ 整体架构

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│              SillyTavern + JS-Slash-Runner 环境              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              命定之诗总结助手 V2.5                     │  │
│  │                                                       │  │
│  │  ┌─────────────┐      ┌──────────────┐              │  │
│  │  │   UI Layer  │◄────►│  Core Layer  │              │  │
│  │  │  (ui/*)     │      │  (*.js)      │              │  │
│  │  └─────────────┘      └──────────────┘              │  │
│  │         │                     │                      │  │
│  │         │                     ▼                      │  │
│  │         │            ┌──────────────┐               │  │
│  │         └───────────►│ Storage Layer│               │  │
│  │                      │ (storage.js) │               │  │
│  │                      └──────────────┘               │  │
│  │                             │                       │  │
│  └─────────────────────────────┼───────────────────────┘  │
│                                ▼                          │
│                    ┌────────────────────────┐             │
│                    │  JS-Slash-Runner API   │             │
│                    │  - replaceScriptButtons│             │
│                    │  - eventOn/eventOff    │             │
│                    │  - getVariables        │             │
│                    │  - getChatMessages     │             │
│                    │  - toastr, callPopup   │             │
│                    └────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   External API  │
                   │  (可选自定义)    │
                   └─────────────────┘
```

## 📦 模块设计

### 核心模块

#### 1. errorHandler.js - 错误处理器
**职责**：全局错误捕获和处理

```javascript
// 功能：
- 包装函数调用，捕获异常
- 统一错误日志格式
- 防止脚本崩溃
```

#### 2. config.js - 配置管理
**职责**：定义全局配置常量

```javascript
// 包含：
- 默认设置值
- API 配置
- UI 常量
- 世界书配置
```

#### 3. utils.js - 工具函数
**职责**：提供通用工具方法

```javascript
// 功能：
- 字符串处理
- 日期格式化
- DOM 操作辅助
- 数据验证
```

#### 4. storage.js - 存储管理
**职责**：设置的持久化存储

```javascript
// 功能：
- 加载/保存设置
- 版本迁移
- 默认值处理
- 数据验证
```

### 业务模块

#### 5. messages.js - 消息处理
**职责**：聊天消息的提取和处理

```javascript
// 功能：
- 获取聊天历史
- 过滤系统消息
- 格式化消息内容
- 提取上下文
```

#### 6. api.js - API 调用
**职责**：与 AI 模型交互

```javascript
// 功能：
- 调用 SillyTavern API
- 支持自定义 API
- 请求/响应处理
- 错误重试机制
```

#### 7. prompt.js - 提示词构建
**职责**：构建总结提示词

```javascript
// 功能：
- 组装提示词模板
- 注入消息内容
- 参数配置
- 格式化输出
```

#### 8. worldbook.js - 世界书管理
**职责**：世界书条目的 CRUD 操作

```javascript
// 功能：
- 绑定世界书
- 创建/更新/删除条目
- 关键词管理
- 条目查询
```

#### 9. summary.js - 总结流程
**职责**：总结的完整流程控制

```javascript
// 功能：
- 触发总结
- 执行总结流程
- 重新生成总结
- 状态管理
```

### UI 模块

#### 10. ui/styles.js - 样式定义
**职责**：面板 CSS 样式

```javascript
// 包含：
- 面板布局样式
- 按钮和表单样式
- 响应式设计
- 主题适配
```

#### 11. ui/renderer.js - 渲染器
**职责**：状态和数据的视图渲染

```javascript
// 功能：
- 渲染状态信息
- 渲染条目列表
- 动态更新 DOM
- 数据绑定
```

#### 12. ui/panel.js - 面板管理
**职责**：设置面板的创建和管理

```javascript
// 功能：
- 创建面板 UI
- 初始化表单
- 绑定事件
- 面板显示/隐藏
```

#### 13. ui/panelEvents.js - 事件处理
**职责**：面板交互事件处理

```javascript
// 功能：
- 表单提交处理
- 按钮点击事件
- 输入验证
- 用户反馈
```

### 入口模块

#### 14. index.js - 主入口
**职责**：脚本初始化和事件绑定

```javascript
// 功能：
- 初始化各模块
- 绑定全局事件
- 启动脚本
- 生命周期管理
```

## 🔄 数据流

### 总结流程数据流

```
用户触发
   │
   ▼
summary.js (触发总结)
   │
   ├──► messages.js (提取消息)
   │         │
   │         ▼
   ├──► prompt.js (构建提示词)
   │         │
   │         ▼
   ├──► api.js (调用 API)
   │         │
   │         ▼
   └──► worldbook.js (保存到世界书)
            │
            ▼
      ui/renderer.js (更新显示)
```

### 设置管理数据流

```
用户修改设置
      │
      ▼
ui/panelEvents.js (事件处理)
      │
      ▼
storage.js (保存设置)
      │
      ▼
SillyTavern 本地存储
```

## 🔌 依赖关系

### 模块依赖层级

```
Level 0 (无依赖):
  - errorHandler.js
  - config.js
  - ui/styles.js

Level 1 (依赖 Level 0):
  - utils.js
  - storage.js

Level 2 (依赖 Level 0-1):
  - messages.js
  - worldbook.js

Level 3 (依赖 Level 0-2):
  - api.js
  - prompt.js
  - ui/renderer.js

Level 4 (依赖 Level 0-3):
  - summary.js
  - ui/panel.js

Level 5 (依赖 Level 0-4):
  - ui/panelEvents.js
  - index.js
```

## 🛠️ 构建系统

### 构建流程

[`build.js`](../build.js) 负责将模块化源码合并为单文件：

1. **读取模块**：按依赖顺序读取所有源文件
2. **合并代码**：将模块代码拼接到一起
3. **包装 IIFE**：用立即执行函数包装，避免全局污染
4. **输出文件**：生成最终的单文件脚本

### 模块加载顺序

构建时严格按照依赖关系排序：

```javascript
const MODULE_ORDER = [
  'src/errorHandler.js',    // 最先加载
  'src/config.js',
  'src/utils.js',
  'src/storage.js',
  'src/messages.js',
  'src/api.js',
  'src/worldbook.js',
  'src/prompt.js',
  'src/summary.js',
  'src/ui/styles.js',
  'src/ui/renderer.js',
  'src/ui/panel.js',
  'src/ui/panelEvents.js',
  'src/index.js',           // 最后加载
];
```

## 🔐 安全考虑

### 沙盒环境

脚本运行在 SillyTavern 的沙盒中：
- 无法访问文件系统
- 受限的网络访问
- 隔离的执行环境

### 数据安全

- 所有设置存储在本地
- 不向外部发送敏感信息
- API 密钥加密存储（如适用）

## 🎯 设计原则

### 1. 模块化
- 单一职责原则
- 高内聚低耦合
- 便于测试和维护

### 2. 可扩展性
- 插件化架构
- 配置驱动
- 易于添加新功能

### 3. 容错性
- 全局错误处理
- 优雅降级
- 详细的错误日志

### 4. 用户友好
- 直观的 UI 设计
- 清晰的反馈信息
- 完善的文档

## 📊 性能优化

### 代码优化
- 避免不必要的 DOM 操作
- 使用事件委托
- 延迟加载非关键资源

### 存储优化
- 最小化存储数据量
- 使用增量更新
- 定期清理过期数据

## 🔮 未来规划

### 可能的改进方向

1. **多语言支持**：国际化 UI 和提示词
2. **主题系统**：可自定义的 UI 主题
3. **插件系统**：支持第三方扩展
4. **批量操作**：批量处理多个总结
5. **导出功能**：导出总结为多种格式

---

**注意**：本文档描述的是 V2.5 版本的架构，后续版本可能会有调整。
