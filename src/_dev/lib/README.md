# HostClient 集成说明

## 概述

`hostClient.ts` 是一个用于快速访问 iframe 中能力的客户端 SDK，已集成到 `AppShellIframe.jsx` 组件中。

## 功能特性

- ✅ **自动初始化**: iframe 加载完成后立即初始化 HostClient
- ✅ **Proxy 代理**: 支持直接调用 iframe 中的方法
- ✅ **生命周期管理**: 自动处理客户端的创建和销毁
- ✅ **错误处理**: 完善的错误处理和超时机制
- ✅ **状态指示**: 可视化的连接状态指示器
- ✅ **TypeScript 支持**: 完整的类型定义

## 使用方法

### 1. 基础使用

```jsx
import React, { useRef } from 'react';
import AppShellIframe from '../components/AppShellIframe.jsx';

function MyComponent() {
    const appShellRef = useRef(null);

    const handleHostClientReady = (client) => {
        console.log('HostClient 准备就绪！');
        console.log('可用能力:', client.getCapabilities());
    };

    return (
        <AppShellIframe
            ref={appShellRef}
            appId="my-app"
            onHostClientReady={handleHostClientReady}
        />
    );
}
```

### 2. 通过 ref 调用方法

```jsx
// 获取 HostClient 实例
const hostClient = appShellRef.current?.getHostClient();

// 调用 iframe 中的方法
if (hostClient) {
    try {
        const result = await hostClient.call('methodName', param1, param2);
        console.log('调用结果:', result);
    } catch (error) {
        console.error('调用失败:', error);
    }
}

// 或者使用 ref 的简化方法
try {
    const result = await appShellRef.current?.call('methodName', param1, param2);
    console.log('调用结果:', result);
} catch (error) {
    console.error('调用失败:', error);
}
```

### 3. 检查连接状态

```jsx
// 检查 HostClient 是否就绪
const isReady = appShellRef.current?.isHostClientReady();

// 获取 HostClient 实例
const hostClient = appShellRef.current?.getHostClient();

if (hostClient && isReady) {
    // 可以安全地调用方法
}
```

## AppShellIframe 新增 Props

| Prop | 类型 | 描述 |
|------|------|------|
| `onHostClientReady` | `(client) => void` | HostClient 准备就绪时的回调 |

## AppShellIframe 新增 Ref 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `getHostClient()` | - | `HostClient \| null` | 获取 HostClient 实例 |
| `isHostClientReady()` | - | `boolean` | 检查 HostClient 是否就绪 |
| `call(method, ...params)` | `string, ...any` | `Promise<any>` | 调用 iframe 中的方法 |
| `initializeHostClient()` | - | `Promise<void>` | 手动初始化 HostClient |
| `destroyHostClient()` | - | `void` | 销毁 HostClient |

## HostClient API

### 核心方法

```typescript
// 调用 iframe 中的方法
await hostClient.call<ReturnType>('methodName', ...params);

// 获取可用能力
const capabilities = hostClient.getCapabilities();

// 检查是否就绪
const isReady = hostClient.isClientReady();

// 销毁客户端
hostClient.destroy();
```

### Proxy 代理调用

```typescript
// 如果 iframe 中有方法 `getUserData`
const userData = await hostClient.getUserData();

// 如果 iframe 中有方法 `setTheme`
await hostClient.setTheme('dark');

// 如果 iframe 中有方法 `showNotification`
await hostClient.showNotification('Hello!', 'success');
```

## 状态指示器

在开发环境中，右下角会显示 HostClient 的连接状态：

- 🟢 **已连接**: HostClient 成功连接到 iframe
- 🔴 **未连接**: HostClient 尚未连接或连接失败

## 示例代码

查看 `src/_dev/examples/HostClientExample.jsx` 获取完整的使用示例。

## 开发调试

在开发环境中，HostClient 会暴露到全局变量：

```javascript
// 在浏览器控制台中
window.__HOST_CLIENT__.createHostClient(iframe);
window.__HOST_CLIENT__.createHostClientAsync(iframe);
```

## 注意事项

1. **初始化时机**: HostClient 会在 iframe 加载完成时自动初始化（onLoad 事件触发后）
2. **错误处理**: 始终使用 try-catch 包装 HostClient 调用
3. **生命周期**: 组件卸载时会自动清理 HostClient
4. **超时设置**: 默认请求超时时间为 30 秒
5. **安全性**: 消息通信会验证来源，确保安全性
6. **早期初始化**: 由于 HostClient 在 iframe 加载后立即初始化，可能在应用完全就绪前尝试连接

## 故障排除

### HostClient 无法连接

1. 检查 iframe 是否正确加载（onLoad 事件是否触发）
2. 确认 iframe 应用是否发送了 `hostSdkReady` 事件
3. 查看浏览器控制台是否有错误信息，特别关注初始化日志
4. 确认消息来源验证是否正确
5. 如果初始化过早，iframe 应用可能尚未完全准备就绪，可以重试或等待应用完全加载

### 方法调用失败

1. 确认 HostClient 已经连接（`isHostClientReady()` 返回 `true`）
2. 检查方法名是否正确
3. 确认 iframe 应用中是否存在该方法
4. 查看参数格式是否正确
