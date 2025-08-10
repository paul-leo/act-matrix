---
description: MorphixAI 项目结构和文件命名规范 - 仅限 src/app/ 目录
globs: ["src/app/**/*"]
alwaysApply: true
---

# MorphixAI 项目结构规范

## 🚨 严格开发限制

### ⛔ 关键约束
**所有开发活动必须严格限制在 `src/app/` 目录内！**

- ✅ **允许**：在 `src/app/` 及其子目录下创建、修改任何文件
- ❌ **严禁**：修改 `src/app/` 目录外的任何文件
- ❌ **严禁**：修改项目配置文件（package.json, vite.config.js 等）
- ❌ **严禁**：修改 `src/_dev/` 目录内容

### 🎯 开发沙盒
```
项目根目录/
├── package.json               🔒 受保护 - 禁止修改
├── vite.config.js            🔒 受保护 - 禁止修改
├── index.html                🔒 受保护 - 禁止修改
├── public/                   🔒 受保护 - 禁止修改
├── scripts/                  🔒 受保护 - 禁止修改
├── src/
│   ├── _dev/                 🔒 受保护 - 禁止修改
│   └── app/                  🟢 开发区域 - 唯一允许修改的目录
│       ├── app.jsx           ✅ 可以修改
│       ├── components/       ✅ 可以修改和扩展
│       ├── styles/           ✅ 可以修改和扩展
│       └── [新目录/文件]      ✅ 可以创建
└── 其他文件                   🔒 受保护 - 禁止修改
```

## 📁 标准项目结构

### 完整目录结构
```
morphixai-app/
├── package.json                  # 项目配置文件
├── vite.config.js               # Vite 构建配置
├── index.html                   # HTML 入口文件
├── public/                      # 静态资源目录
│   ├── favicon.ico
│   └── assets/
├── src/                         # 源代码目录
│   ├── app/                     # 应用代码（主要开发目录）
│   │   ├── app.jsx             # 🎯 应用入口文件（必需）
│   │   ├── components/         # 组件目录
│   │   │   ├── ComponentName.jsx
│   │   │   └── ...
│   │   └── styles/            # 样式文件目录
│   │       ├── App.module.css
│   │       ├── ComponentName.module.css
│   │       └── ...
│   └── _dev/                  # 开发辅助文件（可选）
├── scripts/                   # 构建脚本
└── docs/                     # 文档目录（可选）
```

### 核心目录说明

#### `src/app/` - 应用主目录
- **作用**：包含所有应用相关代码
- **必需文件**：`app.jsx` 作为应用入口
- **规则**：所有业务代码必须在此目录下

#### `src/app/components/` - 组件目录
- **作用**：存放所有 React 组件
- **命名**：PascalCase（如 `SimpleCounter.jsx`）
- **结构**：每个组件一个文件

#### `src/app/styles/` - 样式目录
- **作用**：存放所有 CSS 模块文件
- **命名**：PascalCase.module.css（如 `App.module.css`）
- **规则**：必须使用 CSS Modules

## 📄 文件命名规范

### React 组件文件
```
格式：PascalCase.jsx
示例：
  ✅ App.jsx
  ✅ SimpleCounter.jsx
  ✅ UserProfile.jsx
  ✅ NavigationMenu.jsx
  
  ❌ app.jsx
  ❌ simpleCounter.jsx
  ❌ user-profile.jsx
```

### CSS 模块文件
```
格式：PascalCase.module.css
示例：
  ✅ App.module.css
  ✅ SimpleCounter.module.css
  ✅ UserProfile.module.css
  
  ❌ app.css
  ❌ simpleCounter.css
  ❌ user-profile.css
```

### 配置文件
```
格式：kebab-case.js/json
示例：
  ✅ package.json
  ✅ vite.config.js
  ✅ app-config.json
```

## 🎯 入口文件规范

### `app.jsx` - 应用入口
**位置**：`src/app/app.jsx`
**必需结构**：
```jsx
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

### `package.json` 配置
**必需配置**：
```json
{
    "type": "module",
    "main": "app.jsx",
    "morphixai": {
        "version": "1.0.0",
        "entry": "app.jsx",
        "framework": "react-ionic",
        "features": [
            "css-modules",
            "ionicons", 
            "morphixai-components"
        ]
    }
}
```

## 🧩 组件组织规范

### 组件文件结构
```jsx
// 文件：src/app/components/ComponentName.jsx

import React, { useState } from 'react';
import { Ion组件 } from '@ionic/react';
import { iconName } from 'ionicons/icons';
import styles from '../styles/ComponentName.module.css';

/**
 * 组件功能描述
 * @param {Object} props - 组件属性
 */
export default function ComponentName({ prop1, prop2 }) {
    // 1. 状态定义
    const [state, setState] = useState(initialValue);
    
    // 2. 事件处理函数
    const handleEvent = () => {
        // 处理逻辑
    };
    
    // 3. 渲染
    return (
        <div className={styles.container}>
            {/* 组件内容 */}
        </div>
    );
}
```

### 样式文件结构
```css
/* 文件：src/app/styles/ComponentName.module.css */

/* 1. 容器样式 */
.container {
    /* 布局样式 */
}

/* 2. 组件特定样式 */
.componentElement {
    /* 元素样式 */
}

/* 3. 状态样式 */
.active {
    /* 激活状态 */
}

/* 4. 响应式样式 */
@media (max-width: 576px) {
    .container {
        /* 移动端样式 */
    }
}
```

## 📦 依赖管理规范

### 依赖分类
```json
{
    "peerDependencies": {
        "react": "19.0.0",
        "@ionic/react": "8.6.2",
        "ionicons": "7.4.0"
    },
    "dependencies": {
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
    },
    "devDependencies": {
        "vite": "^5.0.0",
        "@vitejs/plugin-react": "^4.0.0"
    }
}
```

### 导入顺序规范
```jsx
// 1. React 核心库
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { IonPage, IonContent, IonButton } from '@ionic/react';
import { iconName } from 'ionicons/icons';

// 3. MorphixAI 组件
import { PageHeader } from '@morphixai/components';

// 4. 本地组件
import ComponentName from './components/ComponentName';

// 5. 样式文件
import styles from './styles/App.module.css';
```

## 🗂️ 文件组织最佳实践

### 单一职责原则
- 每个组件文件只包含一个主要组件
- 每个样式文件对应一个组件
- 相关的辅助函数可以放在同一文件中

### 组件拆分原则
```
建议拆分：
✅ 超过 100 行的组件
✅ 包含复杂逻辑的组件
✅ 可复用的 UI 片段
✅ 有独立状态的功能块

保持合并：
❌ 简单的展示组件（< 50 行）
❌ 紧密耦合的相关组件
❌ 只在一处使用的小组件
```

### 目录扩展规则
```
随着项目增长，可以增加子目录：

src/app/
├── components/
│   ├── common/          # 通用组件
│   ├── forms/           # 表单组件
│   └── layout/          # 布局组件
├── styles/
│   ├── common/          # 通用样式
│   └── components/      # 组件样式
├── utils/               # 工具函数
├── hooks/               # 自定义 Hooks
└── constants/           # 常量定义
```

## ⚠️ 注意事项

1. **入口文件**：必须使用 `app.jsx`，不能更改
2. **目录位置**：应用代码必须在 `src/app/` 下
3. **CSS Modules**：必须使用 `.module.css` 后缀
4. **组件导出**：使用 `export default` 导出主组件
5. **文件编码**：使用 UTF-8 编码
6. **换行符**：使用 LF (Unix) 换行符

遵循以上结构规范，确保项目的可维护性和 MorphixAI 平台兼容性。
