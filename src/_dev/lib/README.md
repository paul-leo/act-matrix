# HostClient - 独立使用指南

## 📦 独立复制

`HostClient.ts` 文件可以独立复制到其他项目中使用，包含了所有必要的：

- ✅ 标准消息协议定义 (`HOST_SDK_EVENT`, `HostRequest`, `HostResponse`)
- ✅ 完整的类型定义 (`TypedHostClient`, `AuthStatus`, `UserInfo` 等)
- ✅ 核心客户端实现 (`HostClient` 类)
- ✅ 代理和工厂函数 (`createHostClient`, `createHostClientAsync`)
- ✅ 调试工具和版本信息

## 🚀 快速开始

### 1. 复制文件

```bash
# 只需要复制这一个文件
cp HostClient.ts your-project/lib/
```

### 2. 基础使用

```typescript
import { createHostClient, TypedHostClient } from './lib/HostClient';

// 创建客户端实例
const iframe = document.getElementById('app-iframe') as HTMLIFrameElement;
const client: TypedHostClient = createHostClient(iframe);

// 等待初始化完成
await client.readyPromise;

// 使用模块化 API（推荐）
const version = await client.base.getVersion();
const authStatus = await client.auth.getAuthStatus();
const appsList = await client.apps.getAppsList({ page: 1, limit: 10 });

// 或使用手动调用
const userInfo = await client.call('auth', 'getUserInfo');
const app = await client.call('apps', 'getAppById', 'app-id-123');
```

### 3. 安全配置

```typescript
// 指定安全域，避免跨域攻击
const client = createHostClient(iframe, 'https://trusted-app-domain.com');
```

### 4. 错误处理

```typescript
try {
    // 认证相关
    const result = await client.auth.triggerLogin();
    if (result.success) {
        console.log('登录成功');
    } else {
        console.error('登录失败:', result.error);
    }

    // 应用管理相关
    const createResult = await client.apps.createApp({
        name: '我的应用',
        code: 'console.log("Hello World");',
        version: '1.0.0',
        unique_id: crypto.randomUUID()
    });
    
    if (createResult.success) {
        console.log('应用创建成功:', createResult.data);
    } else {
        console.error('应用创建失败:', createResult.message);
    }
} catch (error) {
    console.error('调用失败:', error);
}
```

### 5. 状态检查

```typescript
// 检查客户端是否就绪
if (client.isClientReady()) {
    // 检查 HostSDK 初始化状态
    const initStatus = await client.checkSDKInitialization();
    if (initStatus.initialized) {
        console.log('SDK 版本:', initStatus.version);
    } else {
        console.error('SDK 未初始化:', initStatus.error);
    }
}
```

### 6. 资源清理

```typescript
// 在组件卸载或页面离开时清理
client.destroy();
```

## 🔧 配置选项

### createHostClient(iframe, targetOrigin?)

- `iframe`: 目标 iframe 元素
- `targetOrigin`: 可选，目标域名，默认为 `'*'`

### createHostClientAsync(iframe, targetOrigin?)

- 异步版本，返回 Promise
- 等待初始化完成后返回客户端实例

## 📋 可用的 API

### 基础能力 (client.base)

- `getVersion()`: 获取 SDK 版本号

### 认证能力 (client.auth)

- `getAuthStatus()`: 获取认证状态
- `getUserInfo()`: 获取用户信息
- `triggerLogin()`: 触发登录流程
- `logout()`: 执行登出操作
- `getAppState()`: 获取完整的应用状态

### 应用管理能力 (client.apps)

- `createApp(request)`: 创建应用
- `getAppById(appId, isFork?)`: 根据ID获取应用
- `getAppByUniqueId(uniqueId)`: 根据unique_id获取应用
- `updateApp(appId, request)`: 更新应用
- `getAppCode(appId)`: 获取应用代码
- `getAppBuildCode(appId)`: 获取应用构建代码
- `deleteApp(appId)`: 删除应用
- `getAppsList(request?)`: 获取应用列表
- `validateCreateAppRequest(request)`: 验证创建应用参数

### 客户端方法

- `call(module, method, ...params)`: 手动调用方法
- `isClientReady()`: 检查客户端是否就绪
- `checkSDKInitialization()`: 检查 SDK 初始化状态
- `getCapabilities()`: 获取可用能力列表
- `destroy()`: 销毁客户端

## 🛡️ 安全注意事项

1. **设置 targetOrigin**: 避免使用 `'*'`，指定具体的域名
2. **验证响应**: 检查返回的数据格式和内容
3. **错误处理**: 妥善处理网络错误和超时
4. **资源清理**: 及时调用 `destroy()` 清理资源

## 🐛 调试

在开发环境中，HostClient 会自动注册调试工具：

```javascript
// 浏览器控制台中可用
window.__HOST_CLIENT__.createHostClient(iframe);
window.__HOST_CLIENT__.HOST_SDK_EVENT; // 协议事件名
window.__HOST_CLIENT__.HOST_CLIENT_VERSION; // 客户端版本
```

## 📄 版本兼容性

- **HostClient**: v1.0.0+
- **HostSDK**: v1.0.0+
- **TypeScript**: v4.0.0+
- **浏览器**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

## 🚀 完整使用示例

### 应用管理完整流程

```typescript
import { createHostClient, TypedHostClient } from './lib/HostClient';

async function appManagementExample() {
    // 1. 创建客户端
    const iframe = document.getElementById('app-iframe') as HTMLIFrameElement;
    const client: TypedHostClient = createHostClient(iframe, 'https://trusted-domain.com');
    
    // 2. 等待初始化完成
    await client.readyPromise;
    
    try {
        // 3. 创建应用
        const createResult = await client.apps.createApp({
            name: '示例应用',
            code: 'console.log("Hello from my app!");',
            version: '1.0.0',
            unique_id: crypto.randomUUID(),
            desc: '这是一个示例应用',
            visible: true,
            icon: 'https://example.com/icon.png',
            color: '#007bff'
        });
        
        if (!createResult.success) {
            throw new Error(createResult.message);
        }
        
        const appId = createResult.data!.id;
        console.log('应用创建成功:', appId);
        
        // 4. 获取应用信息
        const appInfo = await client.apps.getAppById(appId);
        console.log('应用信息:', appInfo.data);
        
        // 5. 更新应用
        const updateResult = await client.apps.updateApp(appId, {
            desc: '更新后的描述',
            version: '1.0.1'
        });
        console.log('更新结果:', updateResult);
        
        // 6. 获取应用代码
        const codeResult = await client.apps.getAppCode(appId);
        console.log('应用代码:', codeResult.data?.code);
        
        // 7. 获取应用列表
        const listResult = await client.apps.getAppsList({
            page: 1,
            limit: 10,
            visible: true,
            search: '示例'
        });
        console.log('应用列表:', listResult.data);
        console.log('分页信息:', listResult.pagination);
        
        // 8. 参数验证示例
        const validation = await client.apps.validateCreateAppRequest({
            name: '测试应用',
            code: 'console.log("test");',
            version: '1.0.0',
            unique_id: 'invalid-uuid' // 这会导致验证失败
        });
        
        if (!validation.valid) {
            console.log('验证失败:', validation.errors);
        }
        
    } catch (error) {
        console.error('应用管理操作失败:', error);
    } finally {
        // 9. 清理资源
        client.destroy();
    }
}

// 运行示例
appManagementExample();
```

### 认证与应用管理结合使用

```typescript
async function authAndAppExample() {
    const client = createHostClient(iframe);
    await client.readyPromise;
    
    // 检查认证状态
    const authStatus = await client.auth.getAuthStatus();
    if (!authStatus.isAuthenticated) {
        // 触发登录
        const loginResult = await client.auth.triggerLogin();
        if (!loginResult.success) {
            console.error('登录失败');
            return;
        }
    }
    
    // 获取用户信息
    const userInfo = await client.auth.getUserInfo();
    console.log('当前用户:', userInfo);
    
    // 获取用户的应用列表
    const userApps = await client.apps.getAppsList({
        page: 1,
        limit: 20
    });
    
    console.log(`用户 ${userInfo?.email} 的应用:`, userApps.data);
}
```

## 🔗 协议规范

HostClient 使用标准的 PostMessage 协议与嵌入的应用通信：

- **事件名称**: `'HOSTSDK_MESSAGE'`
- **消息格式**: 包含 `requestId`, `module`, `method`, `params` 等字段
- **超时时间**: 30 秒
- **重试机制**: 连接建立时最多重试 5 次

### 支持的模块

- **base**: 基础能力模块
- **auth**: 认证能力模块  
- **apps**: 应用管理能力模块
