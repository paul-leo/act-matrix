import React, { useEffect, useState } from 'react';
import {
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton,
    IonModal
} from '@ionic/react';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { chevronBack, add, time, grid, close, create } from 'ionicons/icons';
import styles from '../styles/HistoryPage.module.css';
import { useMatrix } from '../store/matrixStore';

const COLLECTION_NAME = 'act_matrix_quadrants';
const MATRIX_SESSIONS_COLLECTION = 'act_matrix_sessions';

export default function HistoryPage({ onBack, onCreateNew, onEditItem }) {
    const { currentMatrixId, setCurrentMatrix } = useMatrix();
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        loadHistoryData();
    }, []);

    const loadHistoryData = async () => {
        setLoading(true);
        try {
            // 获取所有象限数据
            const quadrantsResult = await AppSdk.appData.queryData({
                collection: COLLECTION_NAME,
                query: []
            });

            // 按矩阵ID分组数据，创建会话
            const sessionMap = new Map();
            
            if (Array.isArray(quadrantsResult)) {
                quadrantsResult.forEach(item => {
                    const matrixId = item.matrixId || 'default';
                    const createdAt = item.createdAt || Date.now();
                    
                    if (!sessionMap.has(matrixId)) {
                        sessionMap.set(matrixId, {
                            id: matrixId,
                            matrixId: matrixId,
                            timestamp: createdAt,
                            items: [],
                            isCurrentMatrix: matrixId === currentMatrixId
                        });
                    }
                    
                    const session = sessionMap.get(matrixId);
                    session.items.push(item);
                    // 更新时间戳为最新的项目时间
                    if (createdAt > session.timestamp) {
                        session.timestamp = createdAt;
                    }
                });
            }

            // 转换为数组并按时间排序
            const sessionsArray = Array.from(sessionMap.values())
                .sort((a, b) => b.timestamp - a.timestamp);

            setSessions(sessionsArray);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HistoryPage',
                action: 'loadHistoryData'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewMatrix = async () => {
        try {
            // 创建新的矩阵会话
            const newSession = {
                id: Date.now().toString(),
                createdAt: Date.now(),
                name: `ACT矩阵 - ${formatDate(Date.now())}`
            };

            // 可以在这里保存会话信息到数据库
            // await AppSdk.appData.createData({
            //     collection: MATRIX_SESSIONS_COLLECTION,
            //     data: newSession
            // });

            if (onCreateNew) {
                onCreateNew();
            }
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HistoryPage',
                action: 'handleCreateNewMatrix'
            });
        }
    };

    const getQuadrantSummary = (items) => {
        const quadrantCounts = {
            inner_experience: 0,
            away_moves: 0,
            values: 0,
            toward_moves: 0
        };

        items.forEach(item => {
            if (quadrantCounts.hasOwnProperty(item.quadrantType)) {
                quadrantCounts[item.quadrantType]++;
            }
        });

        return quadrantCounts;
    };

    const getQuadrantName = (type) => {
        const names = {
            inner_experience: '内在体验',
            away_moves: '远离行为',
            values: '重要之事',
            toward_moves: '趋向行为'
        };
        return names[type] || type;
    };

    const handleViewSessionDetails = (session) => {
        setSelectedSession(session);
        setDetailsModalOpen(true);
    };

    const handleSwitchToMatrix = (session) => {
        // 切换到指定的矩阵
        setCurrentMatrix(session.matrixId);
        // 关闭历史记录模态框
        onBack();
    };

    const handleEditHistoryItem = (item) => {
        // 关闭所有模态框，返回首页编辑
        setDetailsModalOpen(false);
        if (onEditItem) {
            onEditItem(item);
        }
        onBack();
    };

    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={onBack}>
                            <IonIcon icon={chevronBack} />
                            返回
                        </IonButton>
                    </IonButtons>
                    <IonTitle>历史记录</IonTitle>
                </IonToolbar>
            </IonHeader>
            
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <IonSpinner name="crescent" />
                        </div>
                    )}

                    {!loading && sessions.length === 0 && (
                        <div className={styles.emptyState}>
                            <IonIcon icon={grid} className={styles.emptyIcon} />
                            <h2>暂无历史记录</h2>
                            <p>开始创建您的第一个ACT矩阵</p>
                            <IonButton onClick={handleCreateNewMatrix}>
                                <IonIcon icon={add} slot="start" />
                                创建新矩阵
                            </IonButton>
                        </div>
                    )}

                    {!loading && sessions.length > 0 && (
                        <div className={styles.sessionsList}>
                            <div className={styles.header}>
                                <h2>您的ACT矩阵历史</h2>
                                <p>共 {sessions.length} 个记录</p>
                            </div>

                            {sessions.map((session) => {
                                const summary = getQuadrantSummary(session.items);
                                return (
                                    <IonCard 
                                        key={session.id} 
                                        className={`${styles.sessionCard} ${session.isCurrentMatrix ? styles.currentMatrix : ''}`}
                                        button={true}
                                        onClick={() => handleSwitchToMatrix(session)}
                                    >
                                        <IonCardHeader>
                                            <IonCardTitle className={styles.sessionTitle}>
                                                <IonIcon icon={time} className={styles.timeIcon} />
                                                {formatDate(session.timestamp)}
                                                {session.isCurrentMatrix && (
                                                    <span className={styles.currentLabel}>当前</span>
                                                )}
                                            </IonCardTitle>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <div className={styles.sessionSummary}>
                                                <IonGrid>
                                                    <IonRow>
                                                        {Object.entries(summary).map(([type, count]) => (
                                                            <IonCol size="6" key={type}>
                                                                <div className={styles.quadrantSummary}>
                                                                    <div className={styles.quadrantName}>
                                                                        {getQuadrantName(type)}
                                                                    </div>
                                                                    <div className={styles.quadrantCount}>
                                                                        {count} 项
                                                                    </div>
                                                                </div>
                                                            </IonCol>
                                                        ))}
                                                    </IonRow>
                                                </IonGrid>
                                            </div>
                                            <div className={styles.sessionActions}>
                                                <IonButton 
                                                    fill="outline" 
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewSessionDetails(session);
                                                    }}
                                                >
                                                    查看详情
                                                </IonButton>
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 浮动新建按钮 */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={handleCreateNewMatrix}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>

            {/* 详情模态框 */}
            <IonModal 
                isOpen={detailsModalOpen} 
                onDidDismiss={() => setDetailsModalOpen(false)}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>
                            {selectedSession && formatDate(selectedSession.timestamp)}
                        </IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setDetailsModalOpen(false)}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className={styles.detailsContent}>
                        {selectedSession && selectedSession.items.map((item) => (
                            <IonCard key={item.id} className={styles.detailItem}>
                                <IonCardHeader>
                                    <IonCardTitle className={styles.detailItemTitle}>
                                        {getQuadrantName(item.quadrantType)}
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <p className={styles.detailItemContent}>{item.content}</p>
                                    <p className={styles.detailItemDate}>{formatDate(item.createdAt)}</p>
                                    <div className={styles.detailItemActions}>
                                        <IonButton 
                                            fill="outline" 
                                            size="small"
                                            onClick={() => handleEditHistoryItem(item)}
                                        >
                                            <IonIcon icon={create} slot="start" />
                                            编辑
                                        </IonButton>
                                    </div>
                                </IonCardContent>
                            </IonCard>
                        ))}
                    </div>
                </IonContent>
            </IonModal>
        </>
    );
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
