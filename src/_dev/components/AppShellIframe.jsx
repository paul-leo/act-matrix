import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    IonCard,
    IonCardContent,
    IonLoading,
    IonButton,
    IonIcon,
    IonToast,
} from '@ionic/react';
import { refreshOutline, warning, checkmarkCircle } from 'ionicons/icons';
import styles from '../styles/AppShellIframe.module.css';
import appFiles from '../app-files.json';
import { APP_SHELL_CONFIG } from '../config/appShellConfig.js';
import { createHostClientAsync } from '../lib/HostClient.ts';
console.log('appFiles', appFiles);

/**
 * AppShell Iframe 加载器组件
 * 功能：
 * 1. 通过 iframe 嵌入 app-shell
 * 2. 实现浏览器通信机制
 * 3. 支持热重载功能
 * 4. 处理错误状态
 * 5. 集成 HostClient 用于快速访问 iframe 能力
 */
const AppShellIframe = forwardRef(function AppShellIframe({
    appId = APP_SHELL_CONFIG.defaultAppId,
    isDev = true,
    height = '600px',
    onAppLoad,
    onAppError,
    onAppUpdate,
    onHostClientReady,
}, ref) {
    const iframeRef = useRef(null);
    const hostClientRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [hostClientReady, setHostClientReady] = useState(false);
    const [hostClientStatus, setHostClientStatus] = useState({
        status: 'idle', // 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'
        version: null,
        capabilities: null,
        error: null,
        retryCount: 0
    });


    // 构建 iframe URL - 使用 useMemo 避免每次渲染都重新计算
    const iframeUrl = useMemo(() => {
        const baseUrl = isDev
            ? APP_SHELL_CONFIG.devBaseUrl
            : APP_SHELL_CONFIG.baseUrl;
        const timestamp = lastUpdateTime; // 使用 lastUpdateTime 作为缓存key
        return `${baseUrl}/app-runner/${appId}?t=${timestamp}`;
    }, [appId, isDev, lastUpdateTime]);

    // 初始化 HostClient
    const initializeHostClient = useCallback(async (maxRetries = 3) => {
        if (!iframeRef.current) {
            console.warn('⚠️ HostClient 初始化失败: iframe 引用不存在');
            setHostClientStatus(prev => ({
                ...prev,
                status: 'error',
                error: 'iframe 引用不存在'
            }));
            return;
        }

        // 如果已经有客户端实例，先销毁
        if (hostClientRef.current) {
            console.log('🧹 销毁现有 HostClient 实例');
            hostClientRef.current.destroy();
            hostClientRef.current = null;
            setHostClientReady(false);
        }

        // 更新连接状态
        setHostClientStatus(prev => ({
            ...prev,
            status: 'connecting',
            error: null
        }));

        try {
            console.log('🔄 正在初始化 HostClient...');
            console.log('📍 iframe URL:', iframeRef.current.src);
            
            const client = await createHostClientAsync(iframeRef.current);
            hostClientRef.current = client;
            setHostClientReady(true);
            
            // 获取详细信息
            const initStatus = await client.checkSDKInitialization();
            const capabilities = client.getCapabilities();
            
            console.log('✅ HostClient 初始化成功');
            console.log('📋 SDK 状态:', initStatus);
            console.log('📋 可用能力:', capabilities);
            
            // 更新状态
            setHostClientStatus({
                status: 'connected',
                version: initStatus.version,
                capabilities,
                error: null,
                retryCount: 0
            });
            
            // 调用回调函数
            onHostClientReady?.(client);
            
        } catch (error) {
            console.error('❌ HostClient 初始化失败:', error);
            console.error('📍 错误详情:', {
                message: error.message,
                iframeSrc: iframeRef.current?.src,
                iframeContentWindow: !!iframeRef.current?.contentWindow
            });
            
            setHostClientReady(false);
            
            const currentRetryCount = hostClientStatus.retryCount + 1;
            const shouldRetry = currentRetryCount < maxRetries;
            
            setHostClientStatus(prev => ({
                ...prev,
                status: 'error',
                error: error.message,
                retryCount: currentRetryCount
            }));
            
            // 重试机制
            if (shouldRetry) {
                console.log(`🔄 第 ${currentRetryCount} 次重试 HostClient 初始化...`);
                const retryDelay = Math.min(1000 * Math.pow(2, currentRetryCount - 1), 5000);
                setTimeout(() => {
                    initializeHostClient(maxRetries);
                }, retryDelay);
            } else {
                console.error(`❌ HostClient 初始化失败，已达到最大重试次数 (${maxRetries})`);
                
                // 特殊错误处理
                if (error.message.includes('timeout')) {
                    console.log('⏰ 初始化超时，可能 iframe 应用尚未完全准备就绪');
                    setToastMessage('连接超时，请检查网络或稍后重试');
                    setShowToast(true);
                }
            }
        }
    }, [onHostClientReady, hostClientStatus.retryCount]);

    // 销毁 HostClient
    const destroyHostClient = useCallback(() => {
        if (hostClientRef.current) {
            console.log('🧹 销毁 HostClient');
            hostClientRef.current.destroy();
            hostClientRef.current = null;
            setHostClientReady(false);
            setHostClientStatus({
                status: 'disconnected',
                version: null,
                capabilities: null,
                error: null,
                retryCount: 0
            });
        }
    }, []);

    // 重新加载 iframe
    const handleReload = useCallback(() => {
        setIsLoading(true);
        setError(null);
        destroyHostClient(); // 销毁旧的客户端
        setLastUpdateTime(Date.now());
    }, [destroyHostClient]);

    // 浏览器通信：向 iframe 发送消息
    const sendMessageToIframe = useCallback(
        (message) => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                const targetOrigin = isDev
                    ? APP_SHELL_CONFIG.devBaseUrl
                    : APP_SHELL_CONFIG.baseUrl;
                iframeRef.current.contentWindow.postMessage(
                    message,
                    targetOrigin
                );
            }
        },
        [isDev]
    );

    // 浏览器通信：监听来自 iframe 的消息
    const handleMessage = useCallback(
        (event) => {
            // 验证消息来源
            const allowedOrigins = [
                'https://app-shell.focusbe.com',
                'https://app-shell.dev.baibian.app',
                'http://localhost:3002',
                'http://127.0.0.1:3002',
                'http://localhost:3000',
                'http://127.0.0.1:3000',
            ];

            if (!allowedOrigins.includes(event.origin)) {
                return;
            }

            try {
                const data =
                    typeof event.data === 'string'
                        ? JSON.parse(event.data)
                        : event.data;
                const eventName = data.event || data.type;

                switch (eventName) {
                    case 'BAIBIAN_APP_READY':
                        setIsLoading(false);
                        setError(null);
                        onAppLoad?.(data);
                        break;

                    // case 'BAIBIAN_APP_RENDERED':
                    //     setLastUpdateTime(Date.now());
                    //     onAppUpdate?.(data);
                    //     break;

                    case 'BAIBIAN_APP_ERROR':
                        setError(data.error || data.message || '应用加载失败');
                        setIsLoading(false);
                        onAppError?.(data.error || data.message);
                        break;

                    case 'APP_FILES_UPDATED':
                        // handleReload();
                        setToastMessage('代码已更新，正在重新加载...');
                        setShowToast(true);
                        break;

                    case 'sdkRequest':
                    case 'app_sdk_response':
                        // SDK 相关消息，静默处理
                        break;

                    case 'GET_APP_FILES_REQUEST':
                        // 处理获取应用文件的请求
                        handleGetAppFilesRequest(event);
                        break;

                    default:
                        // 未知消息类型，忽略
                        break;
                }
            } catch (err) {
                console.error('Error parsing message:', err);
            }
        },
        [onAppLoad, onAppError, onAppUpdate]
    );

    // iframe 加载完成处理
    const handleIframeLoad = useCallback(() => {
        console.log('🎯 iframe 加载完成，开始初始化 HostClient...');
        setIsLoading(false);
        setError(null);
        
        // iframe 加载完成后立即初始化 HostClient
        // 使用 requestAnimationFrame 确保 DOM 更新完成
        requestAnimationFrame(() => {
            setTimeout(() => {
                initializeHostClient();
            }, 200); // 适度延迟确保 iframe 内容完全加载和脚本执行
        });
    }, [initializeHostClient]);

    // iframe 加载错误处理
    const handleIframeError = useCallback(() => {
        setError('无法加载 App Shell');
        setIsLoading(false);
    }, []);

    // 处理获取应用文件的请求
    const handleGetAppFilesRequest = useCallback(async (event) => {
        try {
            const appFiles = await readAppFiles();

            const responseMessage = {
                event: 'GET_APP_FILES_RESPONSE',
                files: appFiles,
                timestamp: Date.now(),
                source: 'morphixai-template',
            };

            if (event.source && event.source.postMessage) {
                event.source.postMessage(responseMessage, event.origin);
            }
        } catch (error) {
            console.error('获取应用文件失败:', error);

            const errorResponse = {
                event: 'GET_APP_FILES_RESPONSE',
                files: {},
                error: error.message,
                timestamp: Date.now(),
                source: 'morphixai-template',
            };

            if (event.source && event.source.postMessage) {
                event.source.postMessage(errorResponse, event.origin);
            }
        }
    }, []);

    // 读取应用文件的函数
    const readAppFiles = useCallback(async () => {
        try {
            console.log('成功从 app-files.json 获取应用文件');
            return appFiles;
        } catch (error) {
            console.error('读取应用文件失败:', error);
            // 如果文件不存在，返回空对象
            return {};
        }
    }, []);

    // 发送文件更新消息到 iframe
    const sendFileUpdateMessage = useCallback((targetAppId = '*') => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            const message = {
                type: 'BAIBIAN_APP_FILE_UPDATE',
                targetAppId: targetAppId,
                timestamp: Date.now()
            };
            
            const targetOrigin = isDev
                ? APP_SHELL_CONFIG.devBaseUrl
                : APP_SHELL_CONFIG.baseUrl;
                
            iframeRef.current.contentWindow.postMessage(message, targetOrigin);
            console.log('🔄 发送文件更新消息到 iframe:', message);
            
            // 显示提示
            setToastMessage('代码已更新，正在通知应用重新加载...');
            setShowToast(true);
        }
    }, [isDev]);

    // 暴露 HostClient API 给父组件
    useImperativeHandle(ref, () => ({
        // 获取 HostClient 实例
        getHostClient: () => hostClientRef.current,
        
        // 检查 HostClient 是否就绪
        isHostClientReady: () => hostClientReady,
        
        // 获取 HostClient 详细状态
        getHostClientStatus: () => hostClientStatus,
        
        // 手动初始化 HostClient
        initializeHostClient,
        
        // 销毁 HostClient
        destroyHostClient,
        
        // 重新加载 iframe
        reload: handleReload,
        
        // 发送消息到 iframe
        sendMessage: sendMessageToIframe,
        
        // 获取 iframe 引用
        getIframe: () => iframeRef.current,
        
        // 调用 iframe 中的方法（通过 HostClient）
        call: async (module, method, ...params) => {
            if (!hostClientRef.current) {
                throw new Error('HostClient 未初始化或未连接');
            }
            if (hostClientStatus.status !== 'connected') {
                throw new Error(`HostClient 状态异常: ${hostClientStatus.status}`);
            }
            return hostClientRef.current.call(module, method, ...params);
        },
        
        // 模块化 API 调用
        api: {
            // 基础 API
            base: {
                getVersion: async () => {
                    if (!hostClientRef.current) throw new Error('HostClient 未初始化');
                    return hostClientRef.current.base.getVersion();
                }
            },
            
            // 认证 API
            auth: {
                getAuthStatus: async () => {
                    if (!hostClientRef.current) throw new Error('HostClient 未初始化');
                    return hostClientRef.current.auth.getAuthStatus();
                },
                getUserInfo: async () => {
                    if (!hostClientRef.current) throw new Error('HostClient 未初始化');
                    return hostClientRef.current.auth.getUserInfo();
                },
                triggerLogin: async () => {
                    if (!hostClientRef.current) throw new Error('HostClient 未初始化');
                    return hostClientRef.current.auth.triggerLogin();
                },
                logout: async () => {
                    if (!hostClientRef.current) throw new Error('HostClient 未初始化');
                    return hostClientRef.current.auth.logout();
                },
                getAppState: async () => {
                    if (!hostClientRef.current) throw new Error('HostClient 未初始化');
                    return hostClientRef.current.auth.getAppState();
                }
            }
        },
        
        // 检查 SDK 初始化状态
        checkSDKInitialization: async () => {
            if (!hostClientRef.current) {
                return { initialized: false, error: 'HostClient 未初始化' };
            }
            return hostClientRef.current.checkSDKInitialization();
        },
        
        // 获取能力列表
        getCapabilities: () => {
            if (!hostClientRef.current) {
                return {};
            }
            return hostClientRef.current.getCapabilities();
        }
    }), [hostClientReady, hostClientStatus, initializeHostClient, destroyHostClient, handleReload, sendMessageToIframe]);

    // 监听 HMR 更新事件，当 app-files.json 变化时触发
    useEffect(() => {
        if (import.meta.hot) {
            // 监听 app-files.json 的 HMR 更新
            import.meta.hot.accept('../app-files.json', (newModule) => {
                console.log('🔥 HMR: 检测到 app-files.json 变化，发送更新消息');
                sendFileUpdateMessage(appId);
            });
        }

        return () => {
            // HMR 清理会自动处理，无需手动清理
        };
    }, [appId, sendFileUpdateMessage]);

    // 设置消息监听器
    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [handleMessage]);

    // 组件卸载时清理 HostClient
    useEffect(() => {
        return () => {
            destroyHostClient();
        };
    }, [destroyHostClient]);

    return (
        <div className={styles.container}>
            {/* Iframe 容器 - 占满屏幕 */}
            <div className={styles.iframeWrapper}>
                <iframe
                    ref={iframeRef}
                    src={iframeUrl}
                    className={styles.iframe}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title={`MorphixAI App: ${appId}`}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
                    data-app-shell="true"
                />

                {/* 加载覆盖层 */}
                {isLoading && (
                    <div className={styles.loadingOverlay}>
                        <IonLoading
                            isOpen={true}
                            message="Loading App Shell..."
                            spinner="crescent"
                        />
                    </div>
                )}
            </div>

            {/* Toast 通知 */}
            <IonToast
                isOpen={showToast}
                message={toastMessage}
                duration={2000}
                onDidDismiss={() => setShowToast(false)}
                position="top"
                color="primary"
            />

            {/* HostClient 状态指示器（开发环境） */}
            {isDev && process.env.NODE_ENV === 'development' && (
                <div 
                    className={styles.hostClientStatus}
                    title={`HostClient: ${hostClientStatus.status} ${hostClientStatus.version ? `(v${hostClientStatus.version})` : ''}`}
                >
                    <div 
                        className={`${styles.statusDot} ${
                            hostClientStatus.status === 'connected' ? styles.connected :
                            hostClientStatus.status === 'connecting' ? styles.connecting :
                            hostClientStatus.status === 'error' ? styles.error :
                            styles.disconnected
                        }`}
                    />
                    <span className={styles.statusText}>
                        HostClient: {hostClientStatus.status}
                        {hostClientStatus.version && ` (v${hostClientStatus.version})`}
                        {hostClientStatus.status === 'error' && hostClientStatus.retryCount > 0 && 
                            ` (重试 ${hostClientStatus.retryCount})`
                        }
                    </span>
                    {hostClientStatus.error && (
                        <span className={styles.errorText} title={hostClientStatus.error}>
                            ⚠️
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

export default AppShellIframe;
