import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonText } from '@ionic/react';
import AppShellIframe from './components/AppShellIframe';
import styles from './styles/App.module.css';
import { getProjectIdWithWarning } from './utils/projectId.js';

export default function App() {
    const [projectInfo, setProjectInfo] = useState({ id: 'loading...', hasWarning: false });

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

    const handleGenerateId = () => {
        console.log('请在终端运行: npm run generate-id');
        // 刷新页面以重新检查项目 ID
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

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
                        <IonButton onClick={handleGenerateId} color="primary">
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

    return (
        <IonPage>
            <IonContent className={styles.content}>
                <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    fontSize: '12px', 
                    color: '#666',
                    zIndex: 1000,
                    background: 'rgba(255,255,255,0.9)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                }}>
                    项目 ID: {projectInfo.id}
                </div>
                <AppShellIframe
                    appId={projectInfo.id}
                    isDev={true}
                    onAppLoad={handleAppLoad}
                    onAppError={handleAppError}
                    onAppUpdate={handleAppUpdate}
                />
            </IonContent>
        </IonPage>
    );
}
