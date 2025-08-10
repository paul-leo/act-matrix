# MorphixAI 简单应用模板

这是一个极简的 MorphixAI 应用模板，展示了符合规范的最基本项目结构。

## 📁 文件结构

```
morphicai-simple-template/
├── app.jsx                    # 主入口文件（必需）
├── styles/
│   └── App.module.css        # CSS Modules 样式
└── README.md                 # 说明文档
```

## 🚀 核心特性

- ✅ **标准入口**：使用 `app.jsx` 作为应用入口文件
- ✅ **内置组件**：使用 `@ionic/react` 和 `@morphicai/components`
- ✅ **图标系统**：集成 `ionicons` 图标库
- ✅ **CSS Modules**：样式隔离和模块化
- ✅ **响应式设计**：适配移动端和桌面端

## 🛠 使用的技术

### 核心库
- **React 19.0.0** - 现代化的 React 版本
- **Ionic React 8.6.2** - 移动端 UI 组件库
- **Ionicons 7.4.0** - 图标库

### MorphixAI 组件
- **PageHeader** - 统一的页面头部组件
- **@morphicai/components** - 内置组件库

## 📝 代码说明

### app.jsx
```jsx
import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonIcon, IonCard } from '@ionic/react';
import { PageHeader } from '@morphicai/components';
import { heart, heartOutline, star, starOutline } from 'ionicons/icons';
import styles from './styles/App.module.css';

export default function App() {
    // 组件逻辑
}
```

**关键要点：**
1. 必须以 `app.jsx` 命名
2. 导出默认函数组件
3. 使用 `IonPage` 作为根容器
4. 使用 `PageHeader` 组件设置标题
5. 通过 CSS Modules 管理样式

### 样式管理
```css
/* App.module.css */
.content {
    --padding: 16px;
    --background: #f8f9fa;
}
```

使用 CSS Modules 的优势：
- **样式隔离**：避免全局样式冲突
- **模块化**：每个组件有独立的样式文件
- **类型安全**：支持 IDE 智能提示

## 🎯 扩展指南

### 添加新组件
1. 在根目录创建 `components/` 文件夹
2. 添加组件文件，如 `components/MyComponent.jsx`
3. 创建对应样式文件 `styles/MyComponent.module.css`

```jsx
// components/MyComponent.jsx
import React from 'react';
import { IonButton } from '@ionic/react';
import styles from '../styles/MyComponent.module.css';

export default function MyComponent() {
    return (
        <IonButton className={styles.myButton}>
            Click me
        </IonButton>
    );
}
```

### 添加工具函数
创建 `utils/` 文件夹，添加工具函数：

```javascript
// utils/helpers.js
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN');
};
```

### 使用原生能力
```jsx
import AppSdk from '@morphicai/app-sdk';

// 调用相机
const result = await AppSdk.camera.takePicture();

// 获取位置
const position = await AppSdk.location.getCurrentPosition();

// AI 对话
const response = await AppSdk.AI.chat({
    messages: [{role: "user", content: "你好"}]
});
```

## 📱 运行环境

此模板设计为在 **MorphixAI App Runner** 中运行：

1. **开发环境**：在 App Shell 中预览
2. **生产环境**：通过 RemoteAppRunner 加载
3. **编译输出**：支持预编译和实时编译两种模式

## 🔗 相关文档

- [应用开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- [App SDK API 文档](https://app-shell.focusbe.com/docs/app-sdk-api.md)
- [图标使用规范](https://app-shell.focusbe.com/docs/icon-specification.md)

## 💡 最佳实践

1. **保持简洁**：模板应该尽可能简单，便于理解和扩展
2. **遵循规范**：严格按照 MorphixAI 开发规范编写代码
3. **移动优先**：优先考虑移动端体验
4. **错误处理**：在关键位置添加适当的错误处理
5. **性能优化**：合理使用 React Hooks，避免不必要的重渲染

---

**这个模板为开发者提供了一个最小化的起点，展示了 MorphixAI 应用的基本结构和核心概念。**
