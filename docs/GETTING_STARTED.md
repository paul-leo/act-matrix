# 🚀 快速开始

本指南将帮助你基于这个简单模板创建自己的 MorphixAI 应用。

## 📋 步骤

### 1. 复制模板文件
将模板文件复制到你的项目中：

```bash
# 创建新项目目录
mkdir my-morphixai-app
cd my-morphixai-app

# 复制模板文件
cp -r path/to/morphixai-simple-template/* .
```

### 2. 自定义应用
修改 `app.jsx` 中的内容：

```jsx
// 修改应用标题
<PageHeader title="My Awesome App" />

// 修改卡片内容
<IonCardTitle>🎨 My Creative App</IonCardTitle>
```

### 3. 添加自己的组件
在 `components/` 目录下创建新组件：

```jsx
// components/MyFeature.jsx
import React from 'react';
import { IonCard, IonCardContent } from '@ionic/react';

export default function MyFeature() {
    return (
        <IonCard>
            <IonCardContent>
                <h2>My Feature</h2>
                <p>This is my custom feature!</p>
            </IonCardContent>
        </IonCard>
    );
}
```

### 4. 添加样式
为新组件创建样式文件：

```css
/* styles/MyFeature.module.css */
.featureCard {
    border-radius: 16px;
    margin: 16px 0;
}
```

### 5. 在 app.jsx 中使用
导入并使用你的新组件：

```jsx
import MyFeature from './components/MyFeature';

// 在 JSX 中使用
<MyFeature />
```

## 🛠 开发技巧

### 使用原生功能
```jsx
import AppSdk from '@morphixai/app-sdk';

// 拍照
const photo = await AppSdk.camera.takePicture();

// 获取位置
const location = await AppSdk.location.getCurrentPosition();

// AI 对话
const response = await AppSdk.AI.chat({
    messages: [{role: "user", content: "Hello!"}]
});
```

### 状态管理
```jsx
import { useState, useEffect } from 'react';

function MyComponent() {
    const [data, setData] = useState([]);
    
    useEffect(() => {
        // 组件加载时执行
        loadData();
    }, []);
    
    const loadData = async () => {
        // 加载数据逻辑
    };
}
```

### 错误处理
```jsx
import { reportError } from '@morphixai/lib';

try {
    await someOperation();
} catch (error) {
    await reportError(error, 'OperationError', {
        component: 'MyComponent'
    });
}
```

## 📱 测试你的应用

1. **在 App Shell 中预览**：将文件上传到开发环境
2. **使用 RemoteAppRunner**：通过 API 加载你的应用
3. **移动端测试**：确保在不同设备上正常工作

## 🚀 部署

当你的应用准备好时：

1. 确保所有文件都符合 MorphixAI 规范
2. 测试所有功能正常工作
3. 通过 MorphixAI 平台部署你的应用

## 💡 下一步

- 查看 [完整开发文档](https://app-shell.focusbe.com/docs/)
- 学习 [更多 API 功能](https://app-shell.focusbe.com/docs/app-sdk-api.md)
- 参考 [设计规范](https://app-shell.focusbe.com/docs/icon-specification.md)

祝你开发愉快！🎉
