import React, { useState } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge } from '@ionic/react';
import { add, remove, refresh } from 'ionicons/icons';
import styles from '../styles/SimpleCounter.module.css';

/**
 * 简单的计数器组件 - 展示基本的 React 状态管理
 */
export default function SimpleCounter() {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);

    return (
        <IonCard className={styles.counterCard}>
            <IonCardHeader>
                <IonCardTitle className={styles.title}>
                    Simple Counter
                    <IonBadge className={styles.badge} color={count > 0 ? 'success' : count < 0 ? 'danger' : 'medium'}>
                        {count}
                    </IonBadge>
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <p className={styles.description}>
                    This demonstrates basic React state management and Ionic components.
                </p>
                
                <div className={styles.buttonGroup}>
                    <IonButton 
                        fill="outline" 
                        color="danger"
                        onClick={decrement}
                        className={styles.button}
                    >
                        <IonIcon icon={remove} slot="start" />
                        Decrease
                    </IonButton>
                    
                    <IonButton 
                        fill="outline" 
                        color="medium"
                        onClick={reset}
                        className={styles.button}
                    >
                        <IonIcon icon={refresh} slot="start" />
                        Reset
                    </IonButton>
                    
                    <IonButton 
                        fill="outline" 
                        color="success"
                        onClick={increment}
                        className={styles.button}
                    >
                        <IonIcon icon={add} slot="start" />
                        Increase
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    );
}
