# Cursor Rules for MorphixAI App Development

这个目录包含了 MorphixAI 应用开发的完整 Cursor 规则集，基于官方文档 [MorphixAI App Builder 开发文档](https://app-shell.dev.baibian.app/docs/index.md) 制定。

## 🚨 重要：严格开发限制

### ⛔ 硬性约束
**所有开发活动必须严格限制在 `src/app/` 目录内！**

- ✅ **允许**：在 `src/app/` 及其子目录下创建、修改任何文件
- ❌ **严禁**：修改 `src/app/` 目录外的任何文件
- ❌ **严禁**：修改项目配置文件（package.json, vite.config.js 等）
- ❌ **严禁**：修改 `src/_dev/` 目录内容

这不是建议，而是**必须遵守的硬性规则**！

## 📋 规则文件说明

### 🔒 文件保护
- **[file-protection.md](./file-protection.md)** - 文件保护规则（最高优先级）
  - 严格开发限制说明
  - 受保护文件列表
  - 开发沙盒定义
  - 违规后果警告

### 🎯 核心规范
- **[morphixai-app-development.md](./morphixai-app-development.md)** - 主要开发规范
  - 严格约束条件
  - 项目结构规范
  - 包依赖规范  
  - 导入规范
  - 组件开发规范
  - 编码风格规范

### 🏗️ 项目结构
- **[project-structure.md](./project-structure.md)** - 项目结构和文件命名规范
  - 开发沙盒定义
  - 标准目录结构
  - 文件命名约定
  - 入口文件规范
  - 组件组织方式

### 🧩 组件开发
- **[ionic-react-components.md](./ionic-react-components.md)** - Ionic React 组件使用规范
  - 核心布局组件
  - 交互组件使用
  - 展示组件规范
  - 图标使用指南

### 🎨 样式规范
- **[css-modules-styling.md](./css-modules-styling.md)** - CSS Modules 样式规范
  - CSS Modules 基础规范
  - Ionic CSS 变量集成
  - 响应式设计规范
  - 性能优化建议

### 🚀 API 集成
- **[morphixai-api-sdk.md](./morphixai-api-sdk.md)** - MorphixAI API SDK 使用规范
  - MorphixAI 组件导入
  - 原生能力 API 使用
  - 错误处理最佳实践
  - 权限管理规范

## 🎯 快速开始

### 1. 📍 确认开发区域
**只能在 `src/app/` 目录下开发！**
```
✅ 允许修改的区域：
src/app/
├── app.jsx              # 应用入口文件
├── components/          # 组件目录
│   └── *.jsx           # React 组件
└── styles/             # 样式目录
    └── *.module.css    # CSS 模块文件

❌ 禁止修改的区域：
├── package.json         # 🔒 项目配置
├── vite.config.js      # 🔒 构建配置
├── src/_dev/           # 🔒 开发辅助
└── 其他根目录文件       # 🔒 系统文件
```

### 2. ⚠️ 重要提醒
**不要尝试修改以下文件：**
- ❌ package.json
- ❌ vite.config.js  
- ❌ index.html
- ❌ src/_dev/ 目录下的任何文件
- ❌ 任何根目录配置文件

### 3. 标准应用入口模板
```jsx
// src/app/app.jsx
import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import styles from './styles/App.module.css';

export default function App() {
    return (
        <IonPage>
            <PageHeader title="应用标题" />
            <IonContent className={styles.content}>
                {/* 应用内容 */}
            </IonContent>
        </IonPage>
    );
}
```

## 📚 参考文档

基于以下官方文档制定的规则：

- **基础文档**: [MorphixAI App Builder 开发文档](https://app-shell.dev.baibian.app/docs/index.md)
- **开发规范**: [应用开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- **API 文档**: [App SDK API 文档](https://app-shell.focusbe.com/docs/app-sdk-api.md)
- **图标规范**: [图标使用规范](https://app-shell.focusbe.com/docs/icon-specification.md)

## ⚠️ 重要提醒

1. **入口文件**: 必须使用 `app.jsx` 作为应用入口
2. **目录结构**: 应用代码必须放在 `src/app/` 目录下
3. **CSS 模块**: 必须使用 `.module.css` 后缀的样式文件
4. **依赖版本**: 确保 React 19.0.0 和 Ionic 8.6.2 的兼容性
5. **平台兼容**: 确保应用与 MorphixAI App Runner 兼容

## 🔧 使用说明

这些规则文件会自动被 Cursor 加载和应用。当你在开发 MorphixAI 应用时，Cursor 的 AI 助手将根据这些规则提供相应的代码建议和补全，确保生成的代码符合 MorphixAI 平台的规范要求。

遵循这些规则，你可以：
- ✅ 确保应用结构正确
- ✅ 使用正确的组件和 API
- ✅ 遵循最佳编码实践
- ✅ 保持代码风格一致
- ✅ 确保平台兼容性

Happy coding with MorphixAI! 🚀
