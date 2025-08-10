---
description: CSS Modules 样式规范 - MorphixAI 应用样式开发指南（仅限 src/app/ 目录）
globs: ["src/app/**/*.css", "src/app/**/*.module.css"]
alwaysApply: true
---

# CSS Modules 样式规范

## 🎨 CSS Modules 基础规范

### 文件命名规范
```
格式：ComponentName.module.css
示例：
  ✅ App.module.css
  ✅ SimpleCounter.module.css
  ✅ UserProfile.module.css
  
  ❌ app.css
  ❌ styles.css
  ❌ component.module.css
```

### 导入使用规范
```jsx
// React 组件中导入
import styles from './styles/ComponentName.module.css';

// 使用样式类
<div className={styles.container}>
    <button className={styles.primaryButton}>
        按钮
    </button>
</div>

// 条件样式
<div className={`${styles.card} ${isActive ? styles.active : ''}`}>
    内容
</div>
```

## 🏗️ 样式结构规范

### 标准文件结构
```css
/* ComponentName.module.css */

/* 1. 容器和布局样式 */
.container {
    display: flex;
    flex-direction: column;
    padding: 16px;
}

.content {
    --padding: 16px;
    --background: #f8f9fa;
}

/* 2. 组件元素样式 */
.card {
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
}

.button {
    --border-radius: 12px;
    font-weight: 500;
}

/* 3. 状态样式 */
.active {
    --background: var(--ion-color-primary);
    --color: var(--ion-color-primary-contrast);
}

.disabled {
    opacity: 0.5;
    pointer-events: none;
}

/* 4. 响应式样式 */
@media (max-width: 576px) {
    .container {
        --padding: 12px;
    }
    
    .buttonGroup {
        flex-direction: column;
    }
}
```

## 🎯 Ionic CSS 变量集成

### 基础 CSS 变量使用
```css
/* 颜色变量 */
.primaryText {
    color: var(--ion-color-primary);
}

.secondaryBackground {
    background: var(--ion-color-secondary);
}

.successBorder {
    border: 1px solid var(--ion-color-success);
}

/* 间距变量 */
.content {
    --padding-top: 16px;
    --padding-bottom: 16px;
    --padding-start: 16px;
    --padding-end: 16px;
}

/* 组件特定变量 */
.customButton {
    --border-radius: 12px;
    --padding-start: 16px;
    --padding-end: 16px;
    --transition: all 0.2s ease;
}
```

### 常用 Ionic 颜色变量
```css
/* 主要颜色 */
.primary { color: var(--ion-color-primary); }
.secondary { color: var(--ion-color-secondary); }
.tertiary { color: var(--ion-color-tertiary); }

/* 状态颜色 */
.success { color: var(--ion-color-success); }
.warning { color: var(--ion-color-warning); }
.danger { color: var(--ion-color-danger); }

/* 中性颜色 */
.light { color: var(--ion-color-light); }
.medium { color: var(--ion-color-medium); }
.dark { color: var(--ion-color-dark); }

/* 对比色 */
.primaryContrast { color: var(--ion-color-primary-contrast); }
.secondaryContrast { color: var(--ion-color-secondary-contrast); }
```

## 📱 响应式设计规范

### 断点定义
```css
/* 移动端优先设计 */

/* 小屏幕 (手机) */
@media (max-width: 576px) {
    .container {
        --padding: 12px;
    }
    
    .buttonGroup {
        flex-direction: column;
        gap: 8px;
    }
    
    .button {
        width: 100%;
    }
}

/* 中等屏幕 (平板) */
@media (min-width: 577px) and (max-width: 768px) {
    .container {
        --padding: 16px;
    }
    
    .buttonGroup {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
}

/* 大屏幕 (桌面) */
@media (min-width: 769px) {
    .container {
        --padding: 20px;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .buttonGroup {
        justify-content: center;
    }
}
```

### 弹性布局规范
```css
/* Flexbox 布局 */
.flexContainer {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.flexRow {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
}

.flexColumn {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.flexCenter {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Grid 布局 */
.gridContainer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}
```

## 🎨 组件样式模式

### 卡片组件样式
```css
.card {
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.cardHeader {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.cardContent {
    padding: 16px;
}
```

### 按钮组样式
```css
.buttonGroup {
    display: flex;
    gap: 12px;
    margin: 20px 0;
    flex-wrap: wrap;
}

.button {
    --border-radius: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.primaryButton {
    --background: var(--ion-color-primary);
    --color: var(--ion-color-primary-contrast);
}

.outlineButton {
    --border-color: var(--ion-color-primary);
    --color: var(--ion-color-primary);
}
```

### 表单元素样式
```css
.formGroup {
    margin: 16px 0;
}

.input {
    --border-radius: 8px;
    --padding-start: 12px;
    --padding-end: 12px;
}

.inputFocused {
    --border-color: var(--ion-color-primary);
}

.inputError {
    --border-color: var(--ion-color-danger);
}

.label {
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--ion-color-medium);
}
```

## 🔧 工具样式类

### 间距工具类
```css
/* 内边距 */
.p0 { padding: 0; }
.p1 { padding: 4px; }
.p2 { padding: 8px; }
.p3 { padding: 12px; }
.p4 { padding: 16px; }
.p5 { padding: 20px; }

/* 外边距 */
.m0 { margin: 0; }
.m1 { margin: 4px; }
.m2 { margin: 8px; }
.m3 { margin: 12px; }
.m4 { margin: 16px; }
.m5 { margin: 20px; }

/* 特定方向 */
.mt3 { margin-top: 12px; }
.mb3 { margin-bottom: 12px; }
.ml3 { margin-left: 12px; }
.mr3 { margin-right: 12px; }
```

### 文本工具类
```css
.textCenter { text-align: center; }
.textLeft { text-align: left; }
.textRight { text-align: right; }

.textBold { font-weight: bold; }
.textNormal { font-weight: normal; }
.textLight { font-weight: 300; }

.textSmall { font-size: 0.875rem; }
.textBase { font-size: 1rem; }
.textLarge { font-size: 1.125rem; }
.textXL { font-size: 1.25rem; }
```

### 显示工具类
```css
.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.inlineBlock { display: inline-block; }

.visible { visibility: visible; }
.invisible { visibility: hidden; }

.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
```

## 🎯 性能优化

### CSS 优化建议
```css
/* 1. 避免深层嵌套 */
/* ❌ 不推荐 */
.container .content .card .header .title {
    color: red;
}

/* ✅ 推荐 */
.cardTitle {
    color: red;
}

/* 2. 使用高效选择器 */
/* ✅ 类选择器性能最佳 */
.button { }

/* ❌ 避免复杂选择器 */
div > .content + .card ~ .button { }

/* 3. 合理使用 CSS 变量 */
.component {
    --local-color: #007bff;
    color: var(--local-color);
}
```

### 动画性能
```css
/* 使用 transform 和 opacity 进行动画 */
.animatedCard {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.animatedCard:hover {
    transform: translateY(-2px) scale(1.02);
}

/* 避免动画影响布局的属性 */
/* ❌ 避免 */
.slowAnimation {
    transition: width 0.3s ease, height 0.3s ease;
}

/* ✅ 推荐 */
.fastAnimation {
    transition: transform 0.3s ease;
}
```

## ⚠️ 注意事项

1. **命名规范**：类名使用 camelCase
2. **避免全局样式**：所有样式应该模块化
3. **CSS 变量优先**：优先使用 Ionic CSS 变量
4. **响应式设计**：移动端优先设计
5. **性能考虑**：避免复杂选择器和深层嵌套
6. **浏览器兼容**：使用现代 CSS 特性，依赖 Ionic 的兼容性处理

遵循以上规范，确保样式的可维护性、性能和一致性。
