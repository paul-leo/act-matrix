import React, { useState, useRef, useEffect } from 'react';
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
    IonToast,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonBadge
} from '@ionic/react';
import { add, trash, checkmark, close, cloudUpload, cloudDownload, sync } from 'ionicons/icons';
import styles from '../styles/TodoApp.module.css';
import todoService from '../services/todoService';

export default function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'offline'
    const inputRef = useRef(null);

    // 加载所有Todo数据
    const loadTodos = async (showToast = false) => {
        try {
            setIsLoading(true);
            setSyncStatus('syncing');
            
            // 首次加载时清理无效数据
            if (!showToast) {
                await todoService.cleanupInvalidData();
            }
            
            const todosData = await todoService.getAllTodos();
            setTodos(todosData);
            setSyncStatus('synced');
            
            // 只在手动刷新时显示成功提示
            if (showToast && todosData.length > 0) {
                showSuccessToast('数据同步成功！');
            }
        } catch (error) {
            setSyncStatus('offline');
            if (showToast) {
                showErrorToast('数据加载失败，使用离线模式');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 组件挂载时加载数据
    useEffect(() => {
        loadTodos();
    }, []);

    const addTodo = async () => {
        if (newTodo.trim()) {
            try {
                setSyncStatus('syncing');
                const todoData = {
                    text: newTodo.trim(),
                    completed: false
                };
                
                const newTodoItem = await todoService.createTodo(todoData);
                setTodos(prevTodos => [...prevTodos, newTodoItem]);
                setNewTodo('');
                setSyncStatus('synced');
                showSuccessToast('任务添加成功！');
                inputRef.current?.setFocus();
            } catch (error) {
                setSyncStatus('offline');
                showErrorToast('添加失败，已保存到本地');
            }
        }
    };

    const toggleTodo = async (id) => {
        try {
            setSyncStatus('syncing');
            const todo = todos.find(t => t.id === id);
            const updatedData = { completed: !todo.completed };
            
            await todoService.updateTodo(id, updatedData);
            setTodos(todos.map(todo =>
                todo.id === id ? { ...todo, ...updatedData } : todo
            ));
            
            setSyncStatus('synced');
            showSuccessToast(updatedData.completed ? '任务完成！' : '任务标记为未完成');
        } catch (error) {
            setSyncStatus('offline');
            showErrorToast('更新失败，已保存到本地');
        }
    };

    const deleteTodo = async (id) => {
        try {
            setSyncStatus('syncing');
            await todoService.deleteTodo(id);
            setTodos(todos.filter(todo => todo.id !== id));
            setSyncStatus('synced');
            showSuccessToast('任务删除成功！');
        } catch (error) {
            setSyncStatus('offline');
            showErrorToast('删除失败，已保存到本地');
        }
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

    // 手动同步数据
    const handleManualSync = async () => {
        try {
            setIsSyncing(true);
            setSyncStatus('syncing');
            
            // 同步本地数据到云端
            await todoService.syncLocalToCloud();
            
            // 重新加载所有数据
            await loadTodos(true);
            
            showSuccessToast('手动同步完成！');
        } catch (error) {
            setSyncStatus('offline');
            showErrorToast('同步失败，请检查网络连接');
        } finally {
            setIsSyncing(false);
        }
    };

    // 下拉刷新
    const handleRefresh = async (event) => {
        await loadTodos(true);
        event.detail.complete();
    };

    const showSuccessToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const showErrorToast = (message) => {
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
                    <IonButton 
                        fill="clear" 
                        slot="end" 
                        onClick={handleManualSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <IonSpinner name="crescent" />
                        ) : (
                            <IonIcon icon={sync} />
                        )}
                    </IonButton>
                    <IonBadge 
                        slot="end" 
                        color={syncStatus === 'synced' ? 'success' : syncStatus === 'syncing' ? 'warning' : 'danger'}
                        className={styles.syncBadge}
                    >
                        {syncStatus === 'synced' ? '已同步' : syncStatus === 'syncing' ? '同步中' : '离线'}
                    </IonBadge>
                </IonToolbar>
            </IonHeader>

            <IonContent className={styles.content}>
                {/* 下拉刷新 */}
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent
                        pullingIcon={cloudDownload}
                        pullingText="下拉同步数据"
                        refreshingSpinner="crescent"
                        refreshingText="正在同步..."
                    />
                </IonRefresher>
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
                    {isLoading ? (
                        <IonCard className={styles.loadingCard}>
                            <IonCardContent>
                                <div className={styles.loadingContent}>
                                    <IonSpinner name="crescent" />
                                    <p>正在加载数据...</p>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    ) : todos.length === 0 ? (
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
                                        {todo.isLocal && (
                                            <IonBadge color="warning" className={styles.localBadge}>
                                                本地
                                            </IonBadge>
                                        )}
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

                {/* 提示消息 */}
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="top"
                    color={toastMessage.includes('失败') || toastMessage.includes('错误') ? 'danger' : 'success'}
                />
            </IonContent>
        </>
    );
}
