---
description: MorphixAI 应用开发规范 - 基于官方文档
globs: ["src/app/**/*.jsx", "src/app/**/*.js", "src/app/**/*.ts", "src/app/**/*.tsx", "src/app/**/*.css"]
alwaysApply: true
---

# MorphixAI 应用开发规范

基于官方文档制定：
- [应用开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- [App SDK API 文档](https://app-shell.focusbe.com/docs/app-sdk-api.md)

## 📋 项目结构

### 应用入口
- 必须使用 `src/app/app.jsx` 作为应用入口文件
- 导出默认函数组件

### 标准结构
```
src/app/
├── app.jsx              # 应用入口文件（必需）
├── components/          # 组件目录
└── styles/             # CSS 模块样式
```

## 🛠 技术规范

### 核心依赖
```json
{
  "peerDependencies": {
    "react": "19.0.0",
    "@ionic/react": "8.6.2",
    "ionicons": "7.4.0"
  }
}
```

### 导入规范
```jsx
import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { iconName } from 'ionicons/icons';
import styles from './styles/App.module.css';
```

### 组件结构
```jsx
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

## 📝 编码规范

### 命名约定
- 组件名：PascalCase（如 `UserCard`）
- 文件名：PascalCase.jsx（如 `UserCard.jsx`）
- 函数名：camelCase（如 `handleClick`）
- CSS 类名：camelCase（如 `buttonGroup`）

### 样式管理
- 使用 CSS Modules（`.module.css`）
- 文件命名：`ComponentName.module.css`
- 使用 Ionic CSS 变量

## 🚀 API 使用

### MorphixAI SDK
```jsx
import { CameraAPI, StorageAPI } from '@morphixai/sdk';

// 使用原生能力
const result = await CameraAPI.takePhoto();
await StorageAPI.set('key', 'value');
```

## 📚 参考文档

详细规范请参考：
- [应用开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- [App SDK API 文档](https://app-shell.focusbe.com/docs/app-sdk-api.md)
