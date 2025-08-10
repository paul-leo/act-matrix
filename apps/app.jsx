import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { PageHeader } from '@morphicai/components';
import { heart, heartOutline, star, starOutline } from 'ionicons/icons';
import SimpleCounter from './components/SimpleCounter';
import styles from './styles/App.module.css';

export default function App() {
    const [liked, setLiked] = useState(false);
    const [starred, setStarred] = useState(false);
    
    return (
        <IonPage>
            <PageHeader title="Simple App Template" />
            <IonContent className={styles.content}>
                <IonCard className={styles.welcomeCard}>
                    <IonCardHeader>
                        <IonCardTitle>🎉 Welcome to MorphixAI!</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <p>This is a simple template that demonstrates the basic structure of a MorphixAI app.</p>
                        
                        <div className={styles.buttonGroup}>
                            <IonButton 
                                fill="outline" 
                                onClick={() => setLiked(!liked)}
                                className={styles.interactButton}
                            >
                                <IonIcon icon={liked ? heart : heartOutline} slot="start" />
                                {liked ? 'Liked!' : 'Like'}
                            </IonButton>
                            
                            <IonButton 
                                fill="outline" 
                                onClick={() => setStarred(!starred)}
                                className={styles.interactButton}
                            >
                                <IonIcon icon={starred ? star : starOutline} slot="start" />
                                {starred ? 'Starred!' : 'Star'}
                            </IonButton>
                        </div>
                        
                        <div className={styles.info}>
                            <h3>Key Features:</h3>
                            <ul>
                                <li>✅ Uses <code>app.jsx</code> as entry point</li>
                                <li>✅ Imports from <code>@ionic/react</code></li>
                                <li>✅ Uses <code>@morphicai/components</code></li>
                                <li>✅ Supports CSS Modules</li>
                                <li>✅ Uses Ionicons for UI icons</li>
                            </ul>
                        </div>
                    </IonCardContent>
                </IonCard>
                
                {/* 简单计数器组件 */}
                <SimpleCounter />
            </IonContent>
        </IonPage>
    );
}
