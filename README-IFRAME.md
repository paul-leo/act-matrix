# MorphixAI Iframe 集成方案

本文档描述了如何在模板项目中通过 iframe 嵌入 app-shell，实现动态加载和热更新功能。

## 🎯 功能概述

### 核心功能
1. **Iframe 嵌入**：通过 iframe 加载 `app-shell.focusbe.com/app-runner/appid`
2. **浏览器通信**：使用 PostMessage API 实现双向通信
3. **动态渲染**：将 `apps/` 目录下的项目渲染到 iframe 中
4. **热重载**：代码变更时自动触发重新渲染
5. **错误处理**：完整的加载状态和错误处理机制

### 架构流程
```
Template Project → iframe → App Shell → Dynamic Load → apps/ Directory → Render
```

## 📁 新增文件结构

```
src/
├── components/
│   └── AppShellIframe.jsx          # Iframe 加载器组件
├── styles/
│   └── AppShellIframe.module.css   # Iframe 组件样式
├── utils/
│   └── fileWatcher.js              # 文件监听和热重载工具
└── App.jsx                         # 更新后的主应用组件

index.html                          # 更新后的 HTML（支持 iframe 通信）
```

## 🔧 技术实现

### 1. AppShellIframe 组件

**功能特性：**
- 动态构建 iframe URL
- 浏览器消息通信
- 加载状态管理
- 错误处理和重试
- 热重载支持

**核心 API：**
```jsx
<AppShellIframe
    appId="simple-template"
    isDev={true}
    height="800px"
    onAppLoad={handleAppLoad}
    onAppError={handleAppError}
    onAppUpdate={handleAppUpdate}
/>
```

### 2. 浏览器通信机制

**消息类型：**
- `BAIBIAN_APP_READY`: 应用加载完成
- `BAIBIAN_APP_RENDERED`: 应用渲染完成
- `BAIBIAN_APP_ERROR`: 应用加载错误
- `APP_FILES_UPDATED`: 文件更新通知
- `INIT_COMMUNICATION`: 初始化通信

**通信示例：**
```javascript
// 发送消息到 iframe
sendMessageToIframe({
    event: 'APP_FILES_CHANGED',
    data: {
        appId: 'simple-template',
        timestamp: Date.now()
    }
});

// 监听来自 iframe 的消息
window.addEventListener('message', (event) => {
    if (event.data.event === 'BAIBIAN_APP_READY') {
        console.log('App ready:', event.data);
    }
});
```

### 3. 文件监听和热重载

**FileWatcher 类功能：**
- 监听 `apps/` 目录文件变更
- 自动触发重新加载
- 支持多个回调函数
- 可配置监听间隔和文件类型

**使用示例：**
```javascript
import fileWatcher from './utils/fileWatcher';

// 添加变更回调
fileWatcher.addChangeCallback((changedFiles) => {
    console.log('Files changed:', changedFiles);
    // 触发 iframe 重新加载
});

// 开始监听
fileWatcher.startWatching();
```

## 🚀 使用指南

### 1. 启动模板项目
```bash
cd templates/morphicai-simple-template
npm install
npm run dev
```

### 2. 访问应用
打开浏览器访问 `http://localhost:5173`

### 3. 切换视图模式
- **Template View**: 显示原始模板内容
- **App Shell View**: 显示通过 iframe 加载的 app-shell 内容

### 4. 测试热重载
1. 修改 `apps/app.jsx` 中的代码
2. 观察 iframe 自动重新加载
3. 查看控制台的通信日志

## 🔄 工作流程

### 加载流程
1. 用户选择 "App Shell View"
2. `AppShellIframe` 组件创建 iframe
3. iframe 加载 `app-shell.focusbe.com/app-runner/simple-template`
4. App Shell 获取 `apps/` 目录下的文件
5. 动态编译并渲染应用
6. 发送 `BAIBIAN_APP_READY` 消息
7. 模板项目接收消息并更新状态

### 热重载流程
1. `FileWatcher` 检测到文件变更
2. 触发 `APP_FILES_UPDATED` 事件
3. `AppShellIframe` 接收事件
4. 发送 `APP_FILES_CHANGED` 消息到 iframe
5. App Shell 重新获取文件并重新渲染
6. 发送渲染完成消息

## 🛡️ 安全考虑

### CSP 配置
```html
<meta http-equiv="Content-Security-Policy" content="
  frame-src 'self' https://app-shell.focusbe.com http://localhost:3000;
  connect-src 'self' https://app-shell.focusbe.com ws: wss:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
">
```

### 消息验证
```javascript
// 验证消息来源
const allowedOrigins = [
    'https://app-shell.focusbe.com',
    'http://localhost:3000'
];

if (!allowedOrigins.includes(event.origin)) {
    return; // 忽略非法来源的消息
}
```

## 🎨 自定义配置

### App Shell 配置
```javascript
const APP_SHELL_CONFIG = {
    baseUrl: 'https://app-shell.focusbe.com',
    devBaseUrl: 'http://localhost:3000',
    defaultAppId: 'simple-template'
};
```

### 文件监听配置
```javascript
fileWatcher.updateConfig({
    interval: 1000,                    // 检查间隔
    extensions: ['.jsx', '.js', '.css'], // 监听文件类型
    watchPaths: ['./src/app'],            // 监听路径
    ignore: ['node_modules', '.git']    // 忽略目录
});
```

## 🐛 故障排除

### 常见问题

1. **iframe 无法加载**
   - 检查 CSP 配置
   - 确认 app-shell 服务可访问
   - 查看控制台错误信息

2. **消息通信失败**
   - 验证消息来源设置
   - 检查 iframe 的 `data-app-shell` 属性
   - 确认全局通信管理器已初始化

3. **热重载不工作**
   - 确认 FileWatcher 已启动
   - 检查文件路径配置
   - 查看监听间隔设置

### 调试技巧
```javascript
// 启用详细日志
window.AppShellCommunication.debug = true;

// 查看文件监听状态
console.log(fileWatcher.getStatus());

// 手动触发重新加载
iframe.src = iframe.src;
```

## 📝 扩展功能

### 1. 多应用支持
可以同时加载多个应用到不同的 iframe 中：
```jsx
<AppShellIframe appId="app1" />
<AppShellIframe appId="app2" />
```

### 2. 自定义通信协议
扩展消息类型以支持更复杂的交互：
```javascript
// 自定义消息处理
case 'CUSTOM_ACTION':
    handleCustomAction(data);
    break;
```

### 3. 性能优化
- 使用 iframe 预加载
- 实现应用缓存
- 优化消息传递频率

## 🔗 相关链接

- [App Shell 文档](https://app-shell.focusbe.com/docs/)
- [PostMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Iframe 安全最佳实践](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

---

**这个方案实现了您需求中的所有功能：**
✅ 通过 iframe 嵌入 app-shell  
✅ 浏览器通信机制  
✅ 动态加载 apps/ 目录项目  
✅ 代码变更触发重新渲染  
✅ 完整的错误处理和状态管理  
