import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
    useImperativeHandle,
    forwardRef,
} from 'react';
import { IonLoading, IonToast } from '@ionic/react';
import styles from '../styles/AppShellIframe.module.css';
import initialAppFiles from '../app-files.js';
import { APP_SHELL_CONFIG } from '../config/appShellConfig.js';
import { createHostClientAsync } from '../lib/hostClient.ts';

/**
 * 简化版 AppShell Iframe 组件
 * 核心功能：
 * 1. 嵌入 iframe
 * 2. 基础通信
 * 3. HostClient 集成
 */
const AppShellIframe = forwardRef(function AppShellIframe(
    {
        appId = APP_SHELL_CONFIG.defaultAppId,
        isDev = true,
        onAppLoad,
        onAppError,
        onHostClientReady,
    },
    ref
) {
    const iframeRef = useRef(null);
    const hostClientRef = useRef(null);

    // 基础状态
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [hostClientReady, setHostClientReady] = useState(false);
    const [appFiles, setAppFiles] = useState(initialAppFiles);
    // iframe URL
    const iframeUrl = useMemo(() => {
        const baseUrl = isDev
            ? APP_SHELL_CONFIG.devBaseUrl
            : APP_SHELL_CONFIG.baseUrl;
        return `${baseUrl}/app-runner/${appId}?t=${lastUpdateTime}`;
    }, [appId, isDev, lastUpdateTime]);

    // 初始化 HostClient (简化版)
    const initializeHostClient = useCallback(async () => {
        if (!iframeRef.current || hostClientRef.current) return;

        try {
            const client = await createHostClientAsync(iframeRef.current);
            hostClientRef.current = client;
            setHostClientReady(true);
            onHostClientReady?.(client);
        } catch (error) {
            console.error('HostClient 初始化失败:', error);
            setError(error.message);
        }
    }, [onHostClientReady]);

    // 销毁 HostClient
    const destroyHostClient = useCallback(() => {
        if (hostClientRef.current) {
            hostClientRef.current.destroy();
            hostClientRef.current = null;
            setHostClientReady(false);
        }
    }, []);

    // 重新加载
    const handleReload = useCallback(() => {
        setError(null);
        destroyHostClient();
        setLastUpdateTime(Date.now());
    }, [destroyHostClient]);

    // 发送文件更新消息到 iframe
    const sendFileUpdateMessage = useCallback(
        (targetAppId = '*') => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                const message = {
                    type: 'BAIBIAN_APP_FILE_UPDATE',
                    targetAppId: targetAppId,
                    timestamp: Date.now(),
                };

                const targetOrigin = isDev
                    ? APP_SHELL_CONFIG.devBaseUrl
                    : APP_SHELL_CONFIG.baseUrl;

                iframeRef.current.contentWindow.postMessage(
                    message,
                    targetOrigin
                );
                console.log('🔄 发送文件更新消息到 iframe:', message);

                // 显示提示
                setToastMessage('代码已更新，正在通知应用重新加载...');
                setShowToast(true);
            }
        },
        [isDev]
    );
    // 消息通信 (简化版)
    const handleMessage = useCallback(
        (event) => {
            try {
                const data =
                    typeof event.data === 'string'
                        ? JSON.parse(event.data)
                        : event.data;
                const eventName = data.event || data.type;

                switch (eventName) {
                    case 'BAIBIAN_APP_READY':
                        setError(null);
                        onAppLoad?.(data);
                        break;
                    case 'BAIBIAN_APP_ERROR':
                        setError(data.error || data.message || '应用加载失败');
                        onAppError?.(data.error || data.message);
                        break;
                    case 'GET_APP_FILES_REQUEST':
                        // 直接返回文件
                        console.log('appFiles', appFiles);
                        if (event.source?.postMessage) {
                            event.source.postMessage(
                                {
                                    event: 'GET_APP_FILES_RESPONSE',
                                    files: appFiles,
                                    timestamp: Date.now(),
                                    source: 'morphixai-template',
                                },
                                event.origin
                            );
                        }
                        break;
                }
            } catch (err) {
                console.error('消息解析错误:', err);
            }
        },
        [onAppLoad, onAppError, appFiles]
    );

    // iframe 加载处理
    const handleIframeLoad = useCallback(() => {
        setError(null);
        // 简单延迟后初始化
        setTimeout(() => initializeHostClient(), 300);
    }, [initializeHostClient]);

    const handleIframeError = useCallback(() => {
        setError('无法加载 App Shell');
    }, []);

    // HMR 支持 (简化版)
    useEffect(() => {
        let dispose;
        if (import.meta.hot) {
            dispose = import.meta.hot.accept('../app-files.js', (newModule) => {
                console.log('newModule', newModule);
                setAppFiles(newModule.default);
                sendFileUpdateMessage();
                // handleReload();
                // setToastMessage('代码已更新');
                // setShowToast(true);
                // handleReload();
            });
        }
        return () => dispose?.();
    }, []);

    // 事件监听
    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    // 组件卸载清理
    useEffect(() => {
        return () => destroyHostClient();
    }, [destroyHostClient]);

    // 暴露简化的 API
    useImperativeHandle(
        ref,
        () => ({
            getHostClient: () => hostClientRef.current,
            isHostClientReady: () => hostClientReady,
            reload: handleReload,
            getIframe: () => iframeRef.current,
            // 基础 API 调用
            call: async (module, method, ...params) => {
                if (!hostClientRef.current) {
                    throw new Error('HostClient 未初始化');
                }
                return hostClientRef.current.call(module, method, ...params);
            },
        }),
        [hostClientReady, handleReload]
    );

    return (
        <div className={styles.container}>
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
                />



                {/* 简化的错误显示 */}
                {error && (
                    <div className={styles.errorOverlay}>
                        <div className={styles.errorMessage}>
                            {error}
                            <button onClick={handleReload}>重试</button>
                        </div>
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
        </div>
    );
});

export default AppShellIframe;
