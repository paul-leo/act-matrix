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
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(true);

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

                {/* 桌面端：左右分栏；移动端：仅展示 iframe */}
                <div className={styles.splitLayout}>
                    {/* 左侧手机预览容器（桌面可见） */}
                    <div className={styles.devicePreview}>
                        <div className={styles.phoneFrame}>
                            <div className={styles.phoneScreen}>
                                {appShellIframe}
                            </div>
                        </div>
                    </div>

                    {/* 右侧控制面板（桌面可见，始终展示） */}
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


                {/* 移动端：全屏显示 iframe */}
                <div className={styles.mobileOnly}>
                    {appShellIframe}
                </div>

                {/* 移动端：展开按钮（抽屉关闭时显示） */}
                {!isMobileDrawerOpen && (
                    <div 
                        className={styles.mobileExpandBtn}
                        onClick={() => setIsMobileDrawerOpen(true)}
                        role="button"
                        aria-label="展开控制面板"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                )}

                {/* 移动端：右侧可折叠控制面板 */}
                <div className={styles.mobileDrawerOverlay}>
                    <div className={`${styles.mobileDrawer} ${isMobileDrawerOpen ? '' : 'hidden'}`}>
                        <div
                            className={styles.mobileDrawerHandle}
                            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
                            role="button"
                            aria-label="Toggle control panel"
                        >
                            {isMobileDrawerOpen ? '>' : '<'}
                        </div>
                        <div style={{ padding: '12px', height: 'calc(100vh - 24px)', maxHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <DevControlPanel
                                appId={projectInfo.id}
                                isDev={true}
                                hostClient={hostClient}
                                hostClientReady={hostClientReady}
                                getPreviewUrl={getPreviewUrl}
                                onClose={() => setIsMobileDrawerOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
