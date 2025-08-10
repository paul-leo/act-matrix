---
description: Ionic React 组件使用规范 - MorphixAI 应用开发（仅限 src/app/ 目录）
globs: ["src/app/**/*.jsx", "src/app/**/*.tsx"]
alwaysApply: true
---

# Ionic React 组件使用规范

## 📱 核心布局组件

### IonPage - 页面容器
**必须用法：**
```jsx
import { IonPage } from '@ionic/react';

export default function App() {
    return (
        <IonPage>
            {/* 页面内容 */}
        </IonPage>
    );
}
```

### IonContent - 内容容器
**标准用法：**
```jsx
import { IonContent } from '@ionic/react';

<IonContent className={styles.content}>
    {/* 滚动内容 */}
</IonContent>
```

**常用属性：**
```jsx
<IonContent 
    fullscreen={true}
    scrollEvents={true}
    className={styles.content}
>
```

## 🎯 交互组件

### IonButton - 按钮组件
**基本用法：**
```jsx
import { IonButton, IonIcon } from '@ionic/react';
import { iconName } from 'ionicons/icons';

// 基础按钮
<IonButton fill="outline" onClick={handleClick}>
    按钮文本
</IonButton>

// 带图标的按钮
<IonButton fill="outline" onClick={handleClick}>
    <IonIcon icon={iconName} slot="start" />
    按钮文本
</IonButton>
```

**填充样式：**
- `fill="solid"` - 实心按钮（默认）
- `fill="outline"` - 边框按钮
- `fill="clear"` - 透明按钮

**颜色主题：**
```jsx
<IonButton color="primary">主要</IonButton>
<IonButton color="secondary">次要</IonButton>
<IonButton color="success">成功</IonButton>
<IonButton color="warning">警告</IonButton>
<IonButton color="danger">危险</IonButton>
<IonButton color="medium">中性</IonButton>
```

## 🎴 展示组件

### IonCard 系列 - 卡片组件
**完整卡片结构：**
```jsx
import { 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle,
    IonCardContent 
} from '@ionic/react';

<IonCard className={styles.card}>
    <IonCardHeader>
        <IonCardTitle>卡片标题</IonCardTitle>
        <IonCardSubtitle>卡片副标题</IonCardSubtitle>
    </IonCardHeader>
    <IonCardContent>
        <p>卡片内容</p>
    </IonCardContent>
</IonCard>
```

### IonBadge - 徽章组件
**状态徽章：**
```jsx
import { IonBadge } from '@ionic/react';

<IonBadge color={count > 0 ? 'success' : count < 0 ? 'danger' : 'medium'}>
    {count}
</IonBadge>
```

## 🎨 图标组件

### IonIcon - 图标组件
**基本用法：**
```jsx
import { IonIcon } from '@ionic/react';
import { 
    heart, 
    heartOutline, 
    star, 
    starOutline,
    add,
    remove,
    refresh
} from 'ionicons/icons';

// 基础图标
<IonIcon icon={heart} />

// 条件图标
<IonIcon icon={liked ? heart : heartOutline} />

// 按钮中的图标
<IonButton>
    <IonIcon icon={add} slot="start" />
    添加
</IonButton>
```

**常用图标：**
```jsx
// 基础操作
import { 
    add,           // 添加
    remove,        // 删除
    refresh,       // 刷新
    close,         // 关闭
    checkmark,     // 确认
    arrow-back,    // 返回
    arrow-forward  // 前进
} from 'ionicons/icons';

// 状态图标
import {
    heart,         // 实心爱心
    heartOutline,  // 空心爱心
    star,          // 实心星星
    starOutline    // 空心星星
} from 'ionicons/icons';
```

## 📋 表单组件

### IonInput - 输入框
```jsx
import { IonInput, IonItem, IonLabel } from '@ionic/react';

<IonItem>
    <IonLabel position="stacked">标签</IonLabel>
    <IonInput 
        type="text"
        value={value}
        onIonInput={(e) => setValue(e.detail.value)}
        placeholder="请输入内容"
    />
</IonItem>
```

### IonTextarea - 文本域
```jsx
import { IonTextarea, IonItem, IonLabel } from '@ionic/react';

<IonItem>
    <IonLabel position="stacked">多行文本</IonLabel>
    <IonTextarea 
        value={text}
        onIonInput={(e) => setText(e.detail.value)}
        rows={4}
        placeholder="请输入多行内容"
    />
</IonItem>
```

## 🔄 状态管理与事件处理

### 事件处理规范
```jsx
import React, { useState } from 'react';

export default function Component() {
    const [state, setState] = useState(initialValue);
    
    // 事件处理函数命名规范
    const handleClick = () => {
        setState(newValue);
    };
    
    const handleInputChange = (e) => {
        setState(e.detail.value);
    };
    
    return (
        <IonButton onClick={handleClick}>
            点击事件
        </IonButton>
    );
}
```

### 条件渲染
```jsx
// 条件显示组件
{isVisible && (
    <IonCard>
        <IonCardContent>条件内容</IonCardContent>
    </IonCard>
)}

// 条件样式
<IonButton 
    color={isActive ? 'primary' : 'medium'}
    fill={isSelected ? 'solid' : 'outline'}
>
    条件按钮
</IonButton>
```

## 🎨 样式集成

### CSS Modules 配合使用
```jsx
import styles from '../styles/Component.module.css';

<IonCard className={styles.customCard}>
    <IonCardContent className={styles.content}>
        内容
    </IonCardContent>
</IonCard>
```

### CSS 变量覆盖
```css
/* Component.module.css */
.customButton {
    --border-radius: 12px;
    --padding-start: 16px;
    --padding-end: 16px;
}

.primaryCard {
    --background: var(--ion-color-primary);
    --color: var(--ion-color-primary-contrast);
}
```

## 📱 响应式设计

### 屏幕尺寸适配
```jsx
// 响应式按钮组
<div className={styles.buttonGroup}>
    <IonButton className={styles.responsiveButton}>
        按钮 1
    </IonButton>
    <IonButton className={styles.responsiveButton}>
        按钮 2
    </IonButton>
</div>
```

```css
/* 对应的 CSS */
.buttonGroup {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

@media (max-width: 576px) {
    .buttonGroup {
        flex-direction: column;
    }
    
    .responsiveButton {
        width: 100%;
    }
}
```

## ⚠️ 最佳实践

1. **组件导入**：按需导入 Ionic 组件，避免全量导入
2. **事件处理**：使用 `onIon` 前缀的事件（如 `onIonInput`）
3. **样式优先级**：CSS Modules > Ionic CSS 变量 > 全局样式
4. **图标使用**：优先使用 ionicons，保持图标风格一致
5. **颜色主题**：使用 Ionic 预定义颜色，保持主题一致性

遵循以上规范，确保 Ionic React 组件的正确使用和最佳性能。
