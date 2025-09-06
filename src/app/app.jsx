import React from 'react';
import { IonPage } from '@ionic/react';
import TodoApp from './components/TodoApp';

/**
 * 主应用组件
 * 
 * 当前使用 Welcome 组件作为演示页面
 * 在实际开发中，请替换 Welcome 组件为您的应用内容
 */
export default function App() {
    return (
        <IonPage>
            <TodoApp />
        </IonPage>
    );
}