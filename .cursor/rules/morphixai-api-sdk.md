---
description: MorphixAI API SDK 使用规范 - 原生能力调用指南（仅限 src/app/ 目录）
globs: ["src/app/**/*.jsx", "src/app/**/*.js", "src/app/**/*.ts", "src/app/**/*.tsx"]
alwaysApply: true
---

# MorphixAI API SDK 使用规范

## 🚀 MorphixAI 组件导入

### PageHeader 组件
**标准用法：**
```jsx
import { PageHeader } from '@morphixai/components';

export default function App() {
    return (
        <IonPage>
            <PageHeader title="应用标题" />
            <IonContent>
                {/* 页面内容 */}
            </IonContent>
        </IonPage>
    );
}
```

**高级配置：**
```jsx
<PageHeader 
    title="应用标题"
    showBackButton={true}
    onBack={() => console.log('返回')}
    actions={[
        {
            icon: 'settings',
            onClick: () => console.log('设置')
        }
    ]}
/>
```

## 📱 原生能力 API

### 设备信息获取
```jsx
import { DeviceAPI } from '@morphixai/sdk';

export default function DeviceInfo() {
    const [deviceInfo, setDeviceInfo] = useState(null);
    
    useEffect(() => {
        const getDeviceInfo = async () => {
            try {
                const info = await DeviceAPI.getDeviceInfo();
                setDeviceInfo(info);
            } catch (error) {
                console.error('获取设备信息失败:', error);
            }
        };
        
        getDeviceInfo();
    }, []);
    
    return (
        <IonCard>
            <IonCardContent>
                {deviceInfo && (
                    <div>
                        <p>设备型号: {deviceInfo.model}</p>
                        <p>操作系统: {deviceInfo.platform}</p>
                        <p>版本: {deviceInfo.version}</p>
                    </div>
                )}
            </IonCardContent>
        </IonCard>
    );
}
```

### 存储 API
```jsx
import { StorageAPI } from '@morphixai/sdk';

export default function UserSettings() {
    const [settings, setSettings] = useState({});
    
    // 保存设置
    const saveSettings = async (newSettings) => {
        try {
            await StorageAPI.set('userSettings', newSettings);
            setSettings(newSettings);
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    };
    
    // 加载设置
    const loadSettings = async () => {
        try {
            const savedSettings = await StorageAPI.get('userSettings');
            if (savedSettings) {
                setSettings(savedSettings);
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    };
    
    useEffect(() => {
        loadSettings();
    }, []);
    
    return (
        <IonCard>
            <IonCardContent>
                <IonButton onClick={() => saveSettings({ theme: 'dark' })}>
                    保存设置
                </IonButton>
            </IonCardContent>
        </IonCard>
    );
}
```

### 网络请求 API
```jsx
import { HttpAPI } from '@morphixai/sdk';

export default function DataFetcher() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await HttpAPI.get('https://api.example.com/data');
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // POST 请求示例
    const postData = async (payload) => {
        try {
            const response = await HttpAPI.post('https://api.example.com/data', {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            return response.data;
        } catch (error) {
            console.error('POST 请求失败:', error);
            throw error;
        }
    };
    
    return (
        <IonCard>
            <IonCardContent>
                <IonButton onClick={fetchData} disabled={loading}>
                    {loading ? '加载中...' : '获取数据'}
                </IonButton>
                
                {error && (
                    <p style={{ color: 'red' }}>错误: {error}</p>
                )}
                
                {data && (
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                )}
            </IonCardContent>
        </IonCard>
    );
}
```

### 相机 API
```jsx
import { CameraAPI } from '@morphixai/sdk';

export default function CameraCapture() {
    const [photo, setPhoto] = useState(null);
    
    const takePhoto = async () => {
        try {
            const result = await CameraAPI.takePhoto({
                quality: 90,
                allowEditing: true,
                resultType: 'base64'
            });
            
            setPhoto(`data:image/jpeg;base64,${result.base64String}`);
        } catch (error) {
            console.error('拍照失败:', error);
        }
    };
    
    const selectFromGallery = async () => {
        try {
            const result = await CameraAPI.pickImage({
                quality: 90,
                allowEditing: true,
                resultType: 'base64'
            });
            
            setPhoto(`data:image/jpeg;base64,${result.base64String}`);
        } catch (error) {
            console.error('选择图片失败:', error);
        }
    };
    
    return (
        <IonCard>
            <IonCardContent>
                <div className={styles.buttonGroup}>
                    <IonButton onClick={takePhoto}>
                        <IonIcon icon={camera} slot="start" />
                        拍照
                    </IonButton>
                    
                    <IonButton onClick={selectFromGallery}>
                        <IonIcon icon={images} slot="start" />
                        选择图片
                    </IonButton>
                </div>
                
                {photo && (
                    <img 
                        src={photo} 
                        alt="拍摄的照片"
                        className={styles.previewImage}
                    />
                )}
            </IonCardContent>
        </IonCard>
    );
}
```

### 地理位置 API
```jsx
import { GeolocationAPI } from '@morphixai/sdk';

export default function LocationTracker() {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    
    const getCurrentPosition = async () => {
        try {
            const coords = await GeolocationAPI.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            });
            
            setPosition(coords);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };
    
    const watchPosition = () => {
        const watchId = GeolocationAPI.watchPosition(
            (coords) => {
                setPosition(coords);
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
        
        // 清理函数
        return () => {
            GeolocationAPI.clearWatch(watchId);
        };
    };
    
    return (
        <IonCard>
            <IonCardContent>
                <IonButton onClick={getCurrentPosition}>
                    获取当前位置
                </IonButton>
                
                {position && (
                    <div className={styles.locationInfo}>
                        <p>纬度: {position.latitude}</p>
                        <p>经度: {position.longitude}</p>
                        <p>精度: {position.accuracy}m</p>
                    </div>
                )}
                
                {error && (
                    <p className={styles.error}>错误: {error}</p>
                )}
            </IonCardContent>
        </IonCard>
    );
}
```

## 🔔 通知 API

### 本地通知
```jsx
import { NotificationAPI } from '@morphixai/sdk';

export default function NotificationManager() {
    const scheduleNotification = async () => {
        try {
            await NotificationAPI.schedule({
                title: '提醒标题',
                body: '这是一个本地通知',
                scheduledTime: new Date(Date.now() + 5000), // 5秒后
                sound: true,
                vibrate: true
            });
        } catch (error) {
            console.error('安排通知失败:', error);
        }
    };
    
    const requestPermission = async () => {
        try {
            const permission = await NotificationAPI.requestPermission();
            console.log('通知权限:', permission);
        } catch (error) {
            console.error('请求通知权限失败:', error);
        }
    };
    
    return (
        <IonCard>
            <IonCardContent>
                <IonButton onClick={requestPermission}>
                    请求通知权限
                </IonButton>
                
                <IonButton onClick={scheduleNotification}>
                    安排通知
                </IonButton>
            </IonCardContent>
        </IonCard>
    );
}
```

## 🔧 错误处理最佳实践

### 统一错误处理
```jsx
import { ErrorHandler } from '@morphixai/sdk';

// 全局错误处理器
const handleAPIError = (error) => {
    console.error('API 错误:', error);
    
    // 根据错误类型显示不同提示
    switch (error.code) {
        case 'NETWORK_ERROR':
            // 显示网络错误提示
            break;
        case 'PERMISSION_DENIED':
            // 显示权限被拒绝提示
            break;
        case 'TIMEOUT':
            // 显示超时提示
            break;
        default:
            // 显示通用错误提示
            break;
    }
};

// 在组件中使用
export default function APIComponent() {
    const callAPI = async () => {
        try {
            const result = await SomeAPI.method();
            // 处理成功结果
        } catch (error) {
            handleAPIError(error);
        }
    };
    
    return (
        <IonButton onClick={callAPI}>
            调用 API
        </IonButton>
    );
}
```

### 权限检查模式
```jsx
import { PermissionAPI } from '@morphixai/sdk';

export default function PermissionAwareComponent() {
    const [hasPermission, setHasPermission] = useState(false);
    
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const permission = await PermissionAPI.check('camera');
                setHasPermission(permission === 'granted');
            } catch (error) {
                console.error('权限检查失败:', error);
            }
        };
        
        checkPermission();
    }, []);
    
    const requestPermission = async () => {
        try {
            const permission = await PermissionAPI.request('camera');
            setHasPermission(permission === 'granted');
        } catch (error) {
            console.error('权限请求失败:', error);
        }
    };
    
    if (!hasPermission) {
        return (
            <IonCard>
                <IonCardContent>
                    <p>需要相机权限才能使用此功能</p>
                    <IonButton onClick={requestPermission}>
                        请求权限
                    </IonButton>
                </IonCardContent>
            </IonCard>
        );
    }
    
    return (
        <IonCard>
            <IonCardContent>
                {/* 需要权限的功能 */}
            </IonCardContent>
        </IonCard>
    );
}
```

## ⚠️ 重要注意事项

1. **异步处理**：所有 API 调用都是异步的，使用 async/await
2. **错误处理**：始终包含 try-catch 错误处理
3. **权限检查**：使用敏感 API 前先检查权限
4. **资源清理**：适当清理监听器和定时器
5. **兼容性**：确保 API 在目标平台上可用
6. **性能考虑**：避免频繁调用高开销 API

参考官方文档：[App SDK API 文档](https://app-shell.focusbe.com/docs/app-sdk-api.md)

遵循以上规范，确保正确使用 MorphixAI 原生能力和最佳用户体验。
