---
description: MorphixAI 应用开发规范 - 基于官方文档的完整开发指南
globs: ["src/app/**/*.jsx", "src/app/**/*.js", "src/app/**/*.ts", "src/app/**/*.tsx", "src/app/**/*.css", "src/app/**/*.json"]
alwaysApply: true
---

# MorphixAI 应用开发规范

基于官方文档 [MorphixAI App Builder 开发文档](https://app-shell.dev.baibian.app/docs/index.md) 制定的开发规范。

## 🚨 重要约束条件

### ⛔ 严格的开发限制
**必须遵守的硬性规则：**

1. **只能在 `src/app/` 目录下开发**
   - ✅ 允许：在 `src/app/` 及其子目录下创建、修改文件
   - ❌ 禁止：修改 `src/app/` 以外的任何文件
   - ❌ 禁止：修改根目录的配置文件（package.json, vite.config.js 等）
   - ❌ 禁止：修改 `src/_dev/` 目录

2. **受保护的文件和目录**
   ```
   禁止修改：
   ├── package.json               ❌ 不可修改
   ├── vite.config.js            ❌ 不可修改
   ├── index.html                ❌ 不可修改
   ├── public/                   ❌ 不可修改
   ├── scripts/                  ❌ 不可修改
   ├── src/_dev/                 ❌ 不可修改
   └── 其他根目录文件             ❌ 不可修改
   
   允许开发：
   └── src/app/                  ✅ 唯一允许的开发目录
       ├── app.jsx               ✅ 可以修改
       ├── components/           ✅ 可以修改
       ├── styles/               ✅ 可以修改
       └── 其他子目录/文件        ✅ 可以创建和修改
   ```

3. **开发约束**
   - 所有新功能必须在 `src/app/` 下实现
   - 所有组件必须放在 `src/app/components/` 下
   - 所有样式必须放在 `src/app/styles/` 下
   - 不得尝试修改项目配置或构建脚本

## 📋 核心开发原则

### 1. 项目结构规范

**必需的文件结构：**
```
src/
├── app/
│   ├── app.jsx                    # 应用主入口文件（必需）
│   ├── components/                # 组件目录
│   │   └── *.jsx                 # React 组件文件
│   └── styles/                   # 样式文件目录
│       └── *.module.css          # CSS 模块文件
├── _dev/                         # 开发环境文件（可选）
└── ...
```

**关键要求：**
- ✅ 使用 `app.jsx` 作为应用入口点
- ✅ 所有应用代码必须放在 `src/app/` 目录下
- ✅ 组件放在 `src/app/components/` 目录
- ✅ 样式文件放在 `src/app/styles/` 目录
- ✅ 使用 CSS Modules（`.module.css`）进行样式管理

### 2. 包依赖规范

**核心依赖（必需）：**
```json
{
  "peerDependencies": {
    "react": "19.0.0",
    "@ionic/react": "8.6.2", 
    "ionicons": "7.4.0"
  }
}
```

**package.json 配置要求：**
```json
{
  "type": "module",
  "main": "app.jsx",
  "morphixai": {
    "version": "1.0.0",
    "entry": "app.jsx",
    "framework": "react-ionic",
    "features": ["css-modules", "ionicons", "morphixai-components"],
    "minAppRunnerVersion": "1.0.0"
  }
}
```

### 3. 导入规范

**必需的导入：**
```jsx
// React 核心
import React from 'react';

// Ionic React 组件 - 按需导入
import {
    IonPage,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    // 其他需要的 Ionic 组件
} from '@ionic/react';

// MorphixAI 组件（如果可用）
import { PageHeader } from '@morphixai/components';

// Ionicons 图标
import { iconName } from 'ionicons/icons';

// 样式文件（CSS Modules）
import styles from './styles/ComponentName.module.css';
```

### 4. 组件开发规范

**主应用组件结构：**
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

**子组件结构：**
```jsx
/**
 * 组件功能描述
 * @param {Object} props - 组件属性
 */
export default function ComponentName({ prop1, prop2 }) {
    // 组件逻辑
    
    return (
        <IonCard className={styles.componentCard}>
            {/* 组件内容 */}
        </IonCard>
    );
}
```

### 5. CSS Modules 样式规范

**样式文件命名：**
- 组件样式：`ComponentName.module.css`
- 应用主样式：`App.module.css`

**CSS 变量使用：**
```css
.content {
    --padding: 16px;
    --background: #f8f9fa;
}

.card {
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 使用 Ionic 颜色变量 */
.primaryText {
    color: var(--ion-color-primary);
}
```

**响应式设计：**
```css
/* 移动端适配 */
@media (max-width: 576px) {
    .buttonGroup {
        flex-direction: column;
    }
}
```

## 🛠 组件使用规范

### Ionic React 组件规范

**页面布局组件：**
- 必须使用 `IonPage` 作为页面根容器
- 使用 `IonContent` 包裹页面内容
- 使用 `PageHeader` 作为页面标题栏

**UI 组件使用：**
- `IonCard` 系列：用于内容卡片展示
- `IonButton` 系列：用于交互按钮
- `IonIcon`：使用 ionicons 图标库
- `IonBadge`：用于状态标识

**图标使用：**
```jsx
import { heart, heartOutline, add, remove } from 'ionicons/icons';

<IonIcon icon={liked ? heart : heartOutline} slot="start" />
```

### 状态管理规范

**使用 React Hooks：**
```jsx
import React, { useState, useEffect } from 'react';

export default function Component() {
    const [state, setState] = useState(initialValue);
    
    // 使用 useEffect 处理副作用
    useEffect(() => {
        // 副作用逻辑
    }, [dependencies]);
}
```

## 📝 编码风格规范

### 1. 命名约定
- **组件名**：PascalCase（如 `SimpleCounter`）
- **文件名**：PascalCase.jsx（如 `SimpleCounter.jsx`）
- **函数名**：camelCase（如 `handleClick`）
- **变量名**：camelCase（如 `isLoading`）
- **CSS 类名**：camelCase（如 `buttonGroup`）

### 2. 代码注释
```jsx
/**
 * 组件功能描述
 * @param {Object} props - 组件属性描述
 * @returns {JSX.Element} 返回的 JSX 元素
 */
export default function ComponentName({ props }) {
    // 内部逻辑注释
}
```

### 3. 代码格式
- 使用 2 空格缩进
- JSX 属性换行对齐
- 导入语句分组排序

## 🎯 开发最佳实践

### 1. 性能优化
- 合理使用 React.memo 避免不必要的重渲染
- 使用 useCallback 和 useMemo 优化函数和计算
- 按需导入 Ionic 组件

### 2. 错误处理
- 使用 try-catch 处理异步操作
- 提供用户友好的错误提示
- 实现 Error Boundary（如果需要）

### 3. 可访问性
- 为按钮和交互元素添加适当的 aria 属性
- 确保键盘导航可用
- 提供足够的颜色对比度

## 📚 参考文档

基于以下官方文档制定：
- [应用开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- [App SDK API 文档](https://app-shell.focusbe.com/docs/app-sdk-api.md)
- [图标使用规范](https://app-shell.focusbe.com/docs/icon-specification.md)

## ⚠️ 注意事项

1. **入口文件**：必须使用 `app.jsx` 作为应用入口
2. **框架兼容**：确保与 MorphixAI App Runner 兼容
3. **版本控制**：注意 React 19.0.0 和 Ionic 8.6.2 的兼容性
4. **构建要求**：使用 ES Modules (type: "module")

遵循以上规范，确保应用能够在 MorphixAI 平台上正确运行。
