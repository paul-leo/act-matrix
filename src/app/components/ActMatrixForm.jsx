import React, { useEffect, useState } from 'react';
import {
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonTextarea,
    IonList,
    IonSpinner,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonPage
} from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { close, add, trash, create, arrowForward, arrowBack } from 'ionicons/icons';
import styles from '../styles/ActMatrixForm.module.css';

const COLLECTION_NAME = 'act_matrix_quadrants';

// 象限类型定义
const QUADRANT_TYPES = {
    INNER_EXPERIENCE: 'inner_experience', // 左下：内在体验
    AWAY_MOVES: 'away_moves',             // 左上：远离行为  
    VALUES: 'values',                     // 右下：价值/重要之事
    TOWARD_MOVES: 'toward_moves'          // 右上：价值行动
};

const QUADRANT_CONFIG = {
    [QUADRANT_TYPES.INNER_EXPERIENCE]: {
        title: '内在体验',
        subtitle: '不想要的内在感受',
        question: '什么不想要的内在感受（如恐惧）在你身上出现？',
        placeholder: '例如：恐惧、焦虑、"我不够好"的想法',
        position: 'left-bottom',
        color: '#ef4444'
    },
    [QUADRANT_TYPES.AWAY_MOVES]: {
        title: '远离行为',
        subtitle: '你会做的远离行为',
        question: '你会做什么远离行为（如逃跑）？',
        placeholder: '例如：逃避、拖延、刷手机、找借口',
        position: 'left-top',
        color: '#f97316'
    },
    [QUADRANT_TYPES.VALUES]: {
        title: '重要之事',
        subtitle: '谁和什么是重要的',
        question: '谁和什么对你是重要的？',
        placeholder: '例如：家人、成长、诚实、创造价值',
        position: 'right-bottom',
        color: '#10b981'
    },
    [QUADRANT_TYPES.TOWARD_MOVES]: {
        title: '趋向行为',
        subtitle: '你可以做的趋向行为',
        question: '你可以做什么趋向行为（如拥抱）？',
        placeholder: '例如：主动沟通、练习技能、关心他人',
        position: 'right-top',
        color: '#3b82f6'
    }
};

export default function ActMatrixForm() {
    const [loading, setLoading] = useState(false);
    const [quadrants, setQuadrants] = useState({
        [QUADRANT_TYPES.INNER_EXPERIENCE]: [],
        [QUADRANT_TYPES.AWAY_MOVES]: [],
        [QUADRANT_TYPES.VALUES]: [],
        [QUADRANT_TYPES.TOWARD_MOVES]: []
    });

    // 模态框状态
    const [modalOpen, setModalOpen] = useState(false);
    const [activeQuadrant, setActiveQuadrant] = useState(null);
    const [newItemText, setNewItemText] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        loadQuadrantData();
    }, []);

    const loadQuadrantData = async () => {
        setLoading(true);
        try {
            const result = await AppSdk.appData.queryData({
                collection: COLLECTION_NAME,
                query: []
            });
            
            const newQuadrants = {
                [QUADRANT_TYPES.INNER_EXPERIENCE]: [],
                [QUADRANT_TYPES.AWAY_MOVES]: [],
                [QUADRANT_TYPES.VALUES]: [],
                [QUADRANT_TYPES.TOWARD_MOVES]: []
            };

            if (Array.isArray(result)) {
                result.forEach(item => {
                    if (item.quadrantType && newQuadrants[item.quadrantType]) {
                        newQuadrants[item.quadrantType].push(item);
                    }
                });

                // 对每个象限按创建时间排序
                Object.keys(newQuadrants).forEach(key => {
                    newQuadrants[key].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                });
            }

            setQuadrants(newQuadrants);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'loadQuadrantData'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuadrantClick = (quadrantType) => {
        setActiveQuadrant(quadrantType);
        setModalOpen(true);
        setNewItemText('');
        setEditingItem(null);
    };

    const handleAddItem = async () => {
        if (!newItemText.trim() || !activeQuadrant) return;

        try {
            const data = {
                quadrantType: activeQuadrant,
                content: newItemText.trim(),
                createdAt: Date.now()
            };

            const created = await AppSdk.appData.createData({
                collection: COLLECTION_NAME,
                data
            });

            setQuadrants(prev => ({
                ...prev,
                [activeQuadrant]: [created, ...prev[activeQuadrant]]
            }));

            setNewItemText('');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'handleAddItem'
            });
        }
    };

    const handleEditItem = async (item) => {
        if (!newItemText.trim()) return;

        try {
            const updated = await AppSdk.appData.updateData({
                collection: COLLECTION_NAME,
                id: item.id,
                data: { content: newItemText.trim() }
            });

            setQuadrants(prev => ({
                ...prev,
                [activeQuadrant]: prev[activeQuadrant].map(i => 
                    i.id === item.id ? updated : i
                )
            }));

            setNewItemText('');
            setEditingItem(null);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'handleEditItem'
            });
        }
    };

    const handleDeleteItem = async (item) => {
        try {
            await AppSdk.appData.deleteData({
                collection: COLLECTION_NAME,
                id: item.id
            });

            setQuadrants(prev => ({
                ...prev,
                [activeQuadrant]: prev[activeQuadrant].filter(i => i.id !== item.id)
            }));
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'handleDeleteItem'
            });
        }
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setNewItemText(item.content);
    };

    const closeModal = () => {
        setModalOpen(false);
        setActiveQuadrant(null);
        setNewItemText('');
        setEditingItem(null);
    };

    const activeConfig = activeQuadrant ? QUADRANT_CONFIG[activeQuadrant] : null;
    const activeItems = activeQuadrant ? quadrants[activeQuadrant] : [];

    return (
        
        <IonPage>
            <PageHeader title="ACT 矩阵" />
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <IonSpinner name="crescent" />
                        </div>
                    )}

                    {/* ACT 坐标系容器 */}
                    <div className={styles.coordinateSystem}>
                        {/* 坐标轴线 */}
                        <div className={styles.axisLines}>
                            <div className={styles.horizontalAxis}></div>
                            <div className={styles.verticalAxis}></div>
                        </div>

                        {/* 坐标轴标签 - 绝对定位覆盖在轴线上 */}
                        <div className={styles.axisLabels}>
                            {/* 顶部标签 */}
                            <div className={styles.topAxisLabel}>
                                <div className={styles.axisLabelText}>五感体验</div>
                                <div className={styles.axisSubLabelText}>5-Senses Experiencing</div>
                            </div>
                            
                            {/* 底部标签 */}
                            <div className={styles.bottomAxisLabel}>
                                <div className={styles.axisLabelText}>心理体验</div>
                                <div className={styles.axisSubLabelText}>Mental Experiencing</div>
                            </div>
                            
                            {/* 左侧标签 */}
                            <div className={styles.leftAxisLabel}>
                                <IonIcon icon={arrowBack} className={styles.axisArrow} />
                                <div className={styles.axisLabelText}>远离</div>
                                <div className={styles.axisSubLabelText}>Away</div>
                            </div>
                            
                            {/* 右侧标签 */}
                            <div className={styles.rightAxisLabel}>
                                <div className={styles.axisLabelText}>趋向</div>
                                <div className={styles.axisSubLabelText}>Toward</div>
                                <IonIcon icon={arrowForward} className={styles.axisArrow} />
                            </div>
                        </div>

                        {/* 四象限网格 - 铺满整个容器 */}
                        <div className={styles.quadrantGrid}>
                            {/* 左上象限：远离行为 */}
                            <div 
                                className={`${styles.quadrant} ${styles.topLeft}`}
                                onClick={() => handleQuadrantClick(QUADRANT_TYPES.AWAY_MOVES)}
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>远离行为</h3>
                                    <p className={styles.quadrantSubtitle}>你会做的远离行为</p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[QUADRANT_TYPES.AWAY_MOVES].slice(0, 3).map((item) => (
                                        <div key={item.id} className={styles.quadrantItem}>
                                            {truncate(item.content, 30)}
                                        </div>
                                    ))}
                                    {quadrants[QUADRANT_TYPES.AWAY_MOVES].length > 3 && (
                                        <div className={styles.moreItems}>
                                            +{quadrants[QUADRANT_TYPES.AWAY_MOVES].length - 3} 更多
                                        </div>
                                    )}
                                    {quadrants[QUADRANT_TYPES.AWAY_MOVES].length === 0 && (
                                        <div className={styles.emptyHint}>点击添加内容</div>
                                    )}
                                </div>
                            </div>

                            {/* 右上象限：趋向行为 */}
                            <div 
                                className={`${styles.quadrant} ${styles.topRight}`}
                                onClick={() => handleQuadrantClick(QUADRANT_TYPES.TOWARD_MOVES)}
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>趋向行为</h3>
                                    <p className={styles.quadrantSubtitle}>你可以做的趋向行为</p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[QUADRANT_TYPES.TOWARD_MOVES].slice(0, 3).map((item) => (
                                        <div key={item.id} className={styles.quadrantItem}>
                                            {truncate(item.content, 30)}
                                        </div>
                                    ))}
                                    {quadrants[QUADRANT_TYPES.TOWARD_MOVES].length > 3 && (
                                        <div className={styles.moreItems}>
                                            +{quadrants[QUADRANT_TYPES.TOWARD_MOVES].length - 3} 更多
                                        </div>
                                    )}
                                    {quadrants[QUADRANT_TYPES.TOWARD_MOVES].length === 0 && (
                                        <div className={styles.emptyHint}>点击添加内容</div>
                                    )}
                                </div>
                            </div>

                            {/* 左下象限：内在体验 */}
                            <div 
                                className={`${styles.quadrant} ${styles.bottomLeft}`}
                                onClick={() => handleQuadrantClick(QUADRANT_TYPES.INNER_EXPERIENCE)}
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>内在体验</h3>
                                    <p className={styles.quadrantSubtitle}>不想要的内在感受</p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[QUADRANT_TYPES.INNER_EXPERIENCE].slice(0, 3).map((item) => (
                                        <div key={item.id} className={styles.quadrantItem}>
                                            {truncate(item.content, 30)}
                                        </div>
                                    ))}
                                    {quadrants[QUADRANT_TYPES.INNER_EXPERIENCE].length > 3 && (
                                        <div className={styles.moreItems}>
                                            +{quadrants[QUADRANT_TYPES.INNER_EXPERIENCE].length - 3} 更多
                                        </div>
                                    )}
                                    {quadrants[QUADRANT_TYPES.INNER_EXPERIENCE].length === 0 && (
                                        <div className={styles.emptyHint}>点击添加内容</div>
                                    )}
                                </div>
                            </div>

                            {/* 右下象限：重要之事 */}
                            <div 
                                className={`${styles.quadrant} ${styles.bottomRight}`}
                                onClick={() => handleQuadrantClick(QUADRANT_TYPES.VALUES)}
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>重要之事</h3>
                                    <p className={styles.quadrantSubtitle}>谁和什么是重要的</p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[QUADRANT_TYPES.VALUES].slice(0, 3).map((item) => (
                                        <div key={item.id} className={styles.quadrantItem}>
                                            {truncate(item.content, 30)}
                                        </div>
                                    ))}
                                    {quadrants[QUADRANT_TYPES.VALUES].length > 3 && (
                                        <div className={styles.moreItems}>
                                            +{quadrants[QUADRANT_TYPES.VALUES].length - 3} 更多
                                        </div>
                                    )}
                                    {quadrants[QUADRANT_TYPES.VALUES].length === 0 && (
                                        <div className={styles.emptyHint}>点击添加内容</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </IonContent>

            {/* 象限内容管理模态框 */}
            <IonModal isOpen={modalOpen} onDidDismiss={closeModal}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>
                            {activeConfig?.title}
                        </IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={closeModal}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className={styles.modalContent}>
                        {activeConfig && (
                            <div className={styles.modalHeader}>
                                <p className={styles.modalQuestion}>{activeConfig.question}</p>
                            </div>
                        )}

                        {/* 添加/编辑输入框 */}
                        <div className={styles.inputSection}>
                            <IonItem>
                                <IonTextarea
                                    value={newItemText}
                                    placeholder={activeConfig?.placeholder}
                                    onIonInput={(e) => setNewItemText(e.detail.value || '')}
                                    autoGrow
                                    rows={2}
                                />
                            </IonItem>
                            <div className={styles.inputActions}>
                                {editingItem ? (
                                    <>
                                        <IonButton 
                                            onClick={() => handleEditItem(editingItem)}
                                            disabled={!newItemText.trim()}
                                        >
                                            保存修改
                                        </IonButton>
                                        <IonButton 
                                            fill="outline" 
                                            onClick={() => {
                                                setEditingItem(null);
                                                setNewItemText('');
                                            }}
                                        >
                                            取消
                                        </IonButton>
                                    </>
                                ) : (
                                    <IonButton 
                                        onClick={handleAddItem}
                                        disabled={!newItemText.trim()}
                                    >
                                        添加
                                    </IonButton>
                                )}
                            </div>
                        </div>

                        {/* 内容列表 */}
                        <IonList>
                            {activeItems.map((item) => (
                                <IonItemSliding key={item.id}>
                                    <IonItem>
                                        <IonLabel>
                                            <p className={styles.itemContent}>{item.content}</p>
                                            <p className={styles.itemDate}>{formatDate(item.createdAt)}</p>
                                        </IonLabel>
                                    </IonItem>
                                    <IonItemOptions side="end">
                                        <IonItemOption 
                                            color="primary" 
                                            onClick={() => startEdit(item)}
                                        >
                                            <IonIcon icon={create} />
                                        </IonItemOption>
                                        <IonItemOption 
                                            color="danger" 
                                            onClick={() => handleDeleteItem(item)}
                                        >
                                            <IonIcon icon={trash} />
                                        </IonItemOption>
                                    </IonItemOptions>
                                </IonItemSliding>
                            ))}
                            {activeItems.length === 0 && (
                                <IonItem>
                                    <IonLabel>暂无内容，点击上方添加</IonLabel>
                                </IonItem>
                            )}
                        </IonList>
                    </div>
                </IonContent>
            </IonModal>
        </IonPage>
    );
}

function truncate(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    } catch (_) {
        return '';
    }
}


