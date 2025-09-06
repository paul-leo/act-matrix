import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { IonPage, IonContent, IonButton, IonText } from '@ionic/react';
import AppShellIframe from './components/AppShellIframe';
import DevControlPanel from './components/DevControlPanel.jsx';
import styles from './styles/App.module.css';
import { getProjectIdWithWarning } from './utils/projectId.js';
import { APP_SHELL_CONFIG } from './config/appShellConfig.js';

export default function App() {
    const [projectInfo, setProjectInfo] = useState({ id: 'loading...', hasWarning: false });
    const appShellRef = useRef(null);
    const [hostClient, setHostClient] = useState(null);
    const [hostClientReady, setHostClientReady] = useState(false);

    useEffect(() => {
        // 获取项目 ID
        async function loadProjectId() {
            const info = await getProjectIdWithWarning();
            setProjectInfo(info);
            
            if (info.hasWarning) {
                console.warn(info.warningMessage);
            } else {
                console.log('项目 ID:', info.id);
            }
        }
        
        loadProjectId();
    }, []);

    // App Shell 事件处理
    const handleAppLoad = (data) => {
        console.log('App loaded in iframe:', data);
    };

    const handleAppError = (error) => {
        console.error('App error in iframe:', error);
    };

    const handleAppUpdate = (data) => {
        console.log('App updated in iframe:', data);
    };

    const handleHostClientReady = useCallback((client) => {
        setHostClient(client);
        setHostClientReady(true);
    }, []);

    const getPreviewUrl = useCallback(() => {
        const baseUrl = true ? APP_SHELL_CONFIG.devBaseUrl : APP_SHELL_CONFIG.baseUrl;
        // 使用最新时间戳避免缓存
        return `${baseUrl}/app-runner/${projectInfo.id}?t=${Date.now()}`;
    }, [projectInfo.id]);

    // 如果有警告，显示提示界面
    if (projectInfo.hasWarning) {
        return (
            <IonPage>
                <IonContent className={styles.content}>
                    <div style={{ 
                        padding: '2rem', 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        gap: '1rem'
                    }}>
                        <IonText color="warning">
                            <h2>⚠️ 项目 ID 未找到</h2>
                        </IonText>
                        <IonText>
                            <p>{projectInfo.warningMessage}</p>
                        </IonText>
                        <IonButton onClick={() => {
                            console.log('请在终端运行: npm run generate-id');
                            setTimeout(() => window.location.reload(), 100);
                        }} color="primary">
                            🔄 刷新检查
                        </IonButton>
                        <IonText color="medium">
                            <small>在终端运行 <code>npm run generate-id</code> 后点击刷新</small>
                        </IonText>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    // 创建单一的 AppShellIframe 实例，避免重复创建
    const appShellIframe = useMemo(() => (
        <AppShellIframe
            ref={appShellRef}
            appId={projectInfo.id}
            isDev={true}
            onHostClientReady={handleHostClientReady}
            onAppLoad={handleAppLoad}
            onAppError={handleAppError}
            onAppUpdate={handleAppUpdate}
        />
    ), [projectInfo.id, handleHostClientReady]);

    return (
        <IonPage>
            <IonContent className={styles.content}>

                {/* 桌面端：左右分栏布局 */}
                <div className={styles.splitLayout}>
                    {/* 左侧手机预览容器 */}
                    <div className={styles.devicePreview}>
                        <div className={styles.phoneFrame}>
                            <div className={styles.phoneScreen}>
                                {appShellIframe}
                            </div>
                        </div>
                    </div>

                    {/* 右侧控制面板 */}
                    <div className={styles.controlPanelWrapper}>
                        <DevControlPanel
                            appId={projectInfo.id}
                            isDev={true}
                            hostClient={hostClient}
                            hostClientReady={hostClientReady}
                            getPreviewUrl={getPreviewUrl}
                        />
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
