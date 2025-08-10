import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import AppShellIframe from './components/AppShellIframe';
import styles from './styles/App.module.css';

export default function App() {
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

    return (
        <IonPage>
            <IonContent className={styles.content}>
                <AppShellIframe
                    appId="simple-template"
                    isDev={true}
                    onAppLoad={handleAppLoad}
                    onAppError={handleAppError}
                    onAppUpdate={handleAppUpdate}
                />
            </IonContent>
        </IonPage>
    );
}
