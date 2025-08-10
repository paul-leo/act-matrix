import React, { useState, useRef } from 'react';
import {
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonCheckbox,
    IonIcon,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonFab,
    IonFabButton,
    IonAlert,
    IonToast
} from '@ionic/react';
import { add, trash, checkmark, close } from 'ionicons/icons';
import styles from '../styles/TodoApp.module.css';

export default function TodoApp() {
    const [todos, setTodos] = useState([
        { id: 1, text: '学习React', completed: false },
        { id: 2, text: '开发TODO应用', completed: true },
        { id: 3, text: '阅读技术文档', completed: false }
    ]);
    const [newTodo, setNewTodo] = useState('');
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const inputRef = useRef(null);

    const addTodo = () => {
        if (newTodo.trim()) {
            const todo = {
                id: Date.now(),
                text: newTodo.trim(),
                completed: false
            };
            setTodos([...todos, todo]);
            setNewTodo('');
            showSuccessToast('任务添加成功！');
            inputRef.current?.setFocus();
        }
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
        const todo = todos.find(t => t.id === id);
        showSuccessToast(todo.completed ? '任务标记为未完成' : '任务完成！');
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
        showSuccessToast('任务删除成功！');
    };

    const confirmDelete = (todo) => {
        setTodoToDelete(todo);
        setShowDeleteAlert(true);
    };

    const handleDelete = () => {
        if (todoToDelete) {
            deleteTodo(todoToDelete.id);
            setTodoToDelete(null);
        }
        setShowDeleteAlert(false);
    };

    const showSuccessToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    };

    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;

    return (
        <>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>我的待办事项</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className={styles.content}>
                {/* 统计卡片 */}
                <IonCard className={styles.statsCard}>
                    <IonCardHeader>
                        <IonCardTitle>任务统计</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{totalCount}</span>
                                <span className={styles.statLabel}>总计</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{completedCount}</span>
                                <span className={styles.statLabel}>已完成</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{totalCount - completedCount}</span>
                                <span className={styles.statLabel}>待完成</span>
                            </div>
                        </div>
                        {totalCount > 0 && (
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progress} 
                                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                                />
                            </div>
                        )}
                    </IonCardContent>
                </IonCard>

                {/* 添加新任务 */}
                <IonCard className={styles.addCard}>
                    <IonCardContent>
                        <div className={styles.addTodoContainer}>
                            <IonInput
                                ref={inputRef}
                                value={newTodo}
                                placeholder="添加新的待办事项..."
                                onIonInput={(e) => setNewTodo(e.detail.value)}
                                onKeyPress={handleKeyPress}
                                className={styles.todoInput}
                                clearInput
                            />
                            <IonButton 
                                onClick={addTodo}
                                disabled={!newTodo.trim()}
                                className={styles.addButton}
                            >
                                <IonIcon icon={add} />
                                添加
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* 任务列表 */}
                <IonList className={styles.todoList}>
                    {todos.length === 0 ? (
                        <IonCard className={styles.emptyState}>
                            <IonCardContent>
                                <div className={styles.emptyStateContent}>
                                    <IonIcon icon={checkmark} className={styles.emptyStateIcon} />
                                    <h3>暂无待办事项</h3>
                                    <p>添加一个新任务开始吧！</p>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    ) : (
                        todos.map((todo) => (
                            <IonItemSliding key={todo.id}>
                                <IonItem className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
                                    <IonCheckbox
                                        checked={todo.completed}
                                        onIonChange={() => toggleTodo(todo.id)}
                                        className={styles.checkbox}
                                    />
                                    <IonLabel className={styles.todoLabel}>
                                        <span className={todo.completed ? styles.completedText : ''}>
                                            {todo.text}
                                        </span>
                                    </IonLabel>
                                </IonItem>
                                <IonItemOptions side="end">
                                    <IonItemOption 
                                        color="danger" 
                                        onClick={() => confirmDelete(todo)}
                                    >
                                        <IonIcon icon={trash} />
                                        删除
                                    </IonItemOption>
                                </IonItemOptions>
                            </IonItemSliding>
                        ))
                    )}
                </IonList>

                {/* 悬浮添加按钮 */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => inputRef.current?.setFocus()}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                {/* 删除确认对话框 */}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="确认删除"
                    message={`确定要删除任务 "${todoToDelete?.text}" 吗？`}
                    buttons={[
                        {
                            text: '取消',
                            role: 'cancel',
                            handler: () => setShowDeleteAlert(false)
                        },
                        {
                            text: '删除',
                            handler: handleDelete
                        }
                    ]}
                />

                {/* 成功提示 */}
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="top"
                    color="success"
                />
            </IonContent>
        </>
    );
}
