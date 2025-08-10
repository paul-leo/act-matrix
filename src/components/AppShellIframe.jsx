import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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

// App Shell 配置
const APP_SHELL_CONFIG = {
    baseUrl: 'https://app-shell.focusbe.com',
    devBaseUrl: 'https://app-shell.dev.baibian.app',
    defaultAppId: 'simple-template',
};

/**
 * AppShell Iframe 加载器组件
 * 功能：
 * 1. 通过 iframe 嵌入 app-shell
 * 2. 实现浏览器通信机制
 * 3. 支持热重载功能
 * 4. 处理错误状态
 */
export default function AppShellIframe({
    appId = APP_SHELL_CONFIG.defaultAppId,
    isDev = true,
    height = '600px',
    onAppLoad,
    onAppError,
    onAppUpdate,
}) {
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // 构建 iframe URL - 使用 useMemo 避免每次渲染都重新计算
    const iframeUrl = useMemo(() => {
        const baseUrl = isDev
            ? APP_SHELL_CONFIG.devBaseUrl
            : APP_SHELL_CONFIG.baseUrl;
        const timestamp = lastUpdateTime; // 使用 lastUpdateTime 作为缓存key
        return `${baseUrl}/app-runner/${appId}?t=${timestamp}&embed=true`;
    }, [appId, isDev, lastUpdateTime]);

    // 重新加载 iframe
    const handleReload = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setLastUpdateTime(Date.now());
    }, []);

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
                source: 'morphicai-template',
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
                source: 'morphicai-template',
            };

            if (event.source && event.source.postMessage) {
                event.source.postMessage(errorResponse, event.origin);
            }
        }
    }, []);

    // 读取应用文件的函数
    const readAppFiles = useCallback(async () => {
        try {
            // 从 JSON 文件获取应用文件内容
            const response = await fetch('/app-files.json');
            if (response.ok) {
                const appFiles = await response.json();
                return appFiles;
            } else {
                console.warn('无法获取 app-files.json，使用备用方法');
                // 备用方法：直接读取文件
                return await readAppFilesDirectly();
            }
        } catch (error) {
            console.error('读取应用文件失败:', error);
            // 备用方法：直接读取文件
            return await readAppFilesDirectly();
        }
    }, []);

    // 备用方法：直接读取文件
    const readAppFilesDirectly = useCallback(async () => {
        try {
            // 首先尝试请求 /app-files.json
            const response = await fetch('/app-files.json');
            if (response.ok) {
                const appFiles = await response.json();
                console.log('成功从 /app-files.json 获取应用文件');
                return appFiles;
            } else {
                console.warn(
                    `/app-files.json 请求失败，状态码: ${response.status}，回退到单个文件获取`
                );
            }
        } catch (jsonError) {
            console.warn(
                '请求 /app-files.json 出错:',
                jsonError.message,
                '，回退到单个文件获取'
            );
        }

        // 如果 /app-files.json 请求失败，回退到单个文件获取
        try {
            const appFiles = {
                'app.jsx': await fetchAppFile('/apps/app.jsx'),
                'components/SimpleCounter.jsx': await fetchAppFile(
                    '/apps/components/SimpleCounter.jsx'
                ),
                'styles/App.module.css': await fetchAppFile(
                    '/apps/styles/App.module.css'
                ),
                'styles/SimpleCounter.module.css': await fetchAppFile(
                    '/apps/styles/SimpleCounter.module.css'
                ),
            };

            return appFiles;
        } catch (error) {
            console.error('直接读取应用文件失败:', error);
            return {};
        }
    }, []);

    // 获取单个文件内容
    const fetchAppFile = useCallback(async (filePath) => {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                return await response.text();
            }
            return '';
        } catch (error) {
            return '';
        }
    }, []);

    // 设置消息监听器
    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [handleMessage]);

    return (
        <div className={styles.container}>
            {/* Iframe 容器 - 占满屏幕 */}
            <div className={styles.iframeWrapper}>
                <iframe
                    ref={iframeRef}
                    src={iframeUrl}
                    className={styles.iframe}
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
        </div>
    );
}

// 导出配置和工具函数
export { APP_SHELL_CONFIG };
