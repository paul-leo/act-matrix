# 📁 模板文件结构说明

这个简单模板包含了创建 MorphixAI 应用所需的最小文件集合。

## 📋 文件清单

```
morphixai-simple-template/
├── app.jsx                      # 🎯 应用入口文件（必需）
├── components/                  # 📦 组件目录
│   └── SimpleCounter.jsx       # 📱 示例计数器组件
├── styles/                     # 🎨 样式文件目录
│   ├── App.module.css          # 🏠 主应用样式（CSS Modules）
│   └── SimpleCounter.module.css # 🔢 计数器组件样式
├── package.json                # 📦 项目配置文件
├── .gitignore                  # 🚫 Git 忽略文件
├── README.md                   # 📖 项目说明文档
├── GETTING_STARTED.md          # 🚀 快速开始指南
└── TEMPLATE_STRUCTURE.md       # 📁 本文件 - 结构说明
```

## 🔍 文件详细说明

### 🎯 核心文件

#### `app.jsx` - 应用入口
- **必需文件**：所有 MorphixAI 应用都必须有此文件
- **作用**：应用的主入口点，AppRunner 会首先加载这个文件
- **要求**：
  - 必须导出默认的 React 组件
  - 必须使用 `IonPage` 作为根容器
  - 建议使用 `PageHeader` 组件设置标题

#### `package.json` - 项目配置
- **作用**：定义项目元数据和依赖关系
- **特殊字段**：包含 `morphixai` 配置段，声明模板信息

### 📦 组件文件

#### `components/SimpleCounter.jsx`
- **作用**：展示如何创建可复用的 React 组件
- **演示内容**：
  - React Hooks 状态管理
  - Ionic 组件使用
  - 事件处理
  - 样式集成

### 🎨 样式文件

#### `styles/App.module.css`
- **作用**：主应用的样式定义
- **特点**：
  - 使用 CSS Modules 避免样式冲突
  - 响应式设计，适配移动端
  - CSS 变量集成

#### `styles/SimpleCounter.module.css`
- **作用**：计数器组件的独立样式
- **演示**：组件级样式隔离的最佳实践

### 📖 文档文件

#### `README.md`
- **作用**：项目的主要说明文档
- **内容**：技术栈、特性、代码说明、扩展指南

#### `GETTING_STARTED.md`
- **作用**：开发者快速上手指南
- **内容**：具体步骤、开发技巧、部署说明

#### `TEMPLATE_STRUCTURE.md`
- **作用**：文件结构详细说明（本文件）

#### `.gitignore`
- **作用**：Git 版本控制忽略规则
- **内容**：常见的需要忽略的文件和目录

## 🎯 关键设计原则

### 1. 最小化
- 只包含必需的文件
- 避免过度复杂的示例
- 专注于核心概念演示

### 2. 标准化
- 严格遵循 MorphixAI 开发规范
- 使用推荐的文件命名和组织方式
- 集成最佳实践

### 3. 可扩展
- 提供清晰的扩展指南
- 展示如何添加新组件和功能
- 预留标准的目录结构

### 4. 教育性
- 每个文件都有明确的演示目的
- 包含详细的代码注释
- 提供学习路径指导

## 🚀 使用方式

1. **复制模板**：将所有文件复制到新项目
2. **自定义内容**：修改 `app.jsx` 和组件内容
3. **添加功能**：按需添加新组件和样式
4. **测试运行**：在 MorphixAI App Runner 中测试

## 💡 扩展建议

基于此模板，你可以：

- 添加更多 Ionic 组件示例
- 集成 MorphixAI SDK 功能演示
- 创建更复杂的组件交互
- 添加数据持久化示例
- 集成第三方库（通过 remoteImport）

---

这个模板为 MorphixAI 应用开发提供了一个坚实的起点！🎉
