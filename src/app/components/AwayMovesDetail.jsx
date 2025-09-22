import React, { useEffect, useMemo, useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonModal,
    IonRange,
    IonToggle,
    IonItem,
    IonInput,
    IonSpinner,
} from '@ionic/react';
import { chevronBack, add } from 'ionicons/icons';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { useHistory, useParams } from 'react-router-dom';

const COLLECTION_NAME = 'act_matrix_quadrants';

function useQueryParams() {
    return useMemo(() => {
        const qs = window.location.hash.split('?')[1] || '';
        const sp = new URLSearchParams(qs);
        const obj = {};
        for (const [k, v] of sp.entries()) obj[k] = v;
        return obj;
    }, [window.location.hash]);
}

export default function AwayMovesDetail() {
    const { matrixId: midFromPath } = useParams();
    const matrixId = midFromPath || localStorage.getItem('act_matrix_current_id') || '';
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const history = useHistory();
    const [scoreModalOpen, setScoreModalOpen] = useState(false);
    const [presentingEl, setPresentingEl] = useState(null);
    const [activeScoreTarget, setActiveScoreTarget] = useState(null); // { itemId, dimension, currentPrimary, currentSecondary }
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newItemText, setNewItemText] = useState('');

    const loadItems = async () => {
        if (!matrixId) return;
        setLoading(true);
        try {
            const result = await AppSdk.appData.queryData({
                collection: COLLECTION_NAME,
                query: [
                    { key: 'matrixId', operator: 'eq', value: matrixId },
                    { key: 'quadrantType', operator: 'eq', value: 'away_moves' },
                ],
            });
            const list = Array.isArray(result) ? result.slice() : [];
            const hasOrder = list.some(i => typeof i.order === 'number');
            list.sort((a, b) => {
                if (hasOrder) {
                    const ao = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
                    const bo = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
                    return ao - bo;
                }
                return (a.createdAt || 0) - (b.createdAt || 0);
            });
            setItems(list);
        } catch (error) {
            await reportError(error, 'JavaScriptError', { component: 'AwayMovesDetail', action: 'loadItems' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matrixId]);

    const goBack = () => {
        history.goBack();
    };

    const openScoreModal = (itemId, dimension, current) => {
        setActiveScoreTarget({ itemId, dimension, current });
        setScoreModalOpen(true);
    };

    return (
        <IonPage ref={setPresentingEl}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={goBack}>
                            <IonIcon icon={chevronBack} /> 返回
                        </IonButton>
                    </IonButtons>
                    <IonTitle>远离行为详情</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                        <IonSpinner name="crescent" />
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div style={{ padding: 24, color: '#8a837a' }}>
                        暂无远离行为。请返回在首页的左上象限添加条目。
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <div style={{ padding: '12px', overflowX: 'hidden' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '20% 1fr 1fr 1fr',
                            gap: '8px',
                            alignItems: 'center',
                            padding: '8px 6px',
                            borderBottom: '1px solid var(--line-color)',
                            color: 'rgba(0,0,0,0.6)',
                            fontSize: 12,
                            fontWeight: 600
                        }}>
                            <div>远离行为</div>
                            <div style={{ textAlign: 'center' }}>短期</div>
                            <div style={{ textAlign: 'center' }}>长期</div>
                            <div style={{ textAlign: 'center' }}>重要</div>
                        </div>

                        {items.map((it) => {
                            const scores = it.scores || {};
                            const st = scores.shortTerm || {};
                            const lt = scores.longTerm || {};
                            const im = scores.importance || {};
                            return (
                                <div key={it.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '20% 1fr 1fr 1fr',
                                    gap: '8px',
                                    alignItems: 'center',
                                    padding: '10px 6px',
                                    borderBottom: '1px dashed var(--line-color)'
                                }}>
                                    <div style={{ fontSize: 14, color: '#2b2b2b', overflowWrap: 'anywhere', wordWrap: 'break-word', whiteSpace: 'normal' }}>{it.content}</div>
                                    <ScoreCell primary={st.primary} secondary={st.secondary} onClick={() => openScoreModal(it.id, 'shortTerm', st.primary, st.secondary)} />
                                    <ScoreCell primary={lt.primary} secondary={lt.secondary} onClick={() => openScoreModal(it.id, 'longTerm', lt.primary, lt.secondary)} />
                                    <ScoreCell primary={im.primary} secondary={im.secondary} onClick={() => openScoreModal(it.id, 'importance', im.primary, im.secondary)} />
                                </div>
                            );
                        })}

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                            <IonButton onClick={() => setAddModalOpen(true)}>
                                <IonIcon icon={add} slot="start" /> 添加
                            </IonButton>
                        </div>
                    </div>
                )}

                <IonModal
                    isOpen={!!scoreModalOpen}
                    onDidDismiss={() => setScoreModalOpen(false)}
                    presentingElement={presentingEl}
                    canDismiss={true}
                    showBackdrop={true}
                >
                    <ScoreEditor
                        target={activeScoreTarget}
                        onClose={() => setScoreModalOpen(false)}
                        onSave={async ({ primary, secondaryEnabled, secondary }) => {
                            if (!activeScoreTarget) return;
                            const dim = activeScoreTarget.dimension;
                            const itemId = activeScoreTarget.itemId;
                            const baseItem = items.find(x => x.id === itemId) || {};
                            try {
                                // 乐观更新
                                setItems(prev => prev.map(item => {
                                    if (item.id !== itemId) return item;
                                    const nextScores = { ...(item.scores || {}) };
                                    const nextDim = { ...(nextScores[dim] || {}), primary };
                                    if (secondaryEnabled) {
                                        nextDim.secondary = secondary;
                                    } else {
                                        if (nextDim.secondary !== undefined) delete nextDim.secondary;
                                    }
                                    nextScores[dim] = nextDim;
                                    return { ...item, scores: nextScores };
                                }));
                                // 持久化（读-改-写合并）
                                const merged = { ...(baseItem.scores || {}) };
                                const mergedDim = { ...(merged[dim] || {}), primary };
                                if (secondaryEnabled) {
                                    mergedDim.secondary = secondary;
                                } else {
                                    if (mergedDim.secondary !== undefined) delete mergedDim.secondary;
                                }
                                merged[dim] = mergedDim;
                                await AppSdk.appData.updateData({
                                    collection: COLLECTION_NAME,
                                    id: itemId,
                                    data: {
                                        // 发送完整字段，确保兼容替换语义的实现
                                        matrixId: baseItem.matrixId,
                                        quadrantType: baseItem.quadrantType,
                                        content: baseItem.content,
                                        createdAt: baseItem.createdAt,
                                        ...(typeof baseItem.order === 'number' ? { order: baseItem.order } : {}),
                                        scores: merged,
                                    }
                                });
                            } catch (error) {
                                await reportError(error, 'JavaScriptError', { component: 'AwayMovesDetail', action: 'saveScore' });
                            } finally {
                                setScoreModalOpen(false);
                            }
                        }}
                    />
                </IonModal>

                <IonModal
                    isOpen={addModalOpen}
                    onDidDismiss={() => setAddModalOpen(false)}
                    presentingElement={presentingEl}
                    canDismiss={true}
                    showBackdrop={true}
                >
                    <IonPage>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>新增远离行为</IonTitle>
                                <IonButtons slot="end">
                                    <IonButton onClick={() => setAddModalOpen(false)}>关闭</IonButton>
                                </IonButtons>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent>
                            <div style={{ padding: 16 }}>
                                <IonItem>
                                    <IonInput
                                        value={newItemText}
                                        placeholder="例如：刷手机、拖延、找借口"
                                        onIonInput={(e) => setNewItemText(e.detail.value || '')}
                                    />
                                </IonItem>
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <IonButton
                                        onClick={async () => {
                                            const text = (newItemText || '').trim();
                                            if (!text || !matrixId) return;
                                            try {
                                                // 计算 next order（如果已有 order 列）
                                                const itemsWithOrder = items.filter(i => typeof i.order === 'number');
                                                const hasOrder = itemsWithOrder.length > 0;
                                                let nextOrder;
                                                if (hasOrder) {
                                                    const maxOrder = Math.max(...itemsWithOrder.map(i => i.order));
                                                    nextOrder = (isFinite(maxOrder) ? maxOrder : -1) + 1;
                                                }
                                                const data = {
                                                    matrixId,
                                                    quadrantType: 'away_moves',
                                                    content: text,
                                                    createdAt: Date.now(),
                                                    ...(typeof nextOrder === 'number' ? { order: nextOrder } : {}),
                                                };
                                                const created = await AppSdk.appData.createData({
                                                    collection: COLLECTION_NAME,
                                                    data,
                                                });
                                                // 插入并排序
                                                setItems(prev => {
                                                    const updated = [created, ...prev];
                                                    const anyOrder = updated.some(i => typeof i.order === 'number');
                                                    updated.sort((a, b) => {
                                                        if (anyOrder) {
                                                            const ao = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
                                                            const bo = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
                                                            return ao - bo;
                                                        }
                                                        return (a.createdAt || 0) - (b.createdAt || 0);
                                                    });
                                                    return updated;
                                                });
                                                setNewItemText('');
                                                setAddModalOpen(false);
                                            } catch (error) {
                                                await reportError(error, 'JavaScriptError', { component: 'AwayMovesDetail', action: 'createAwayItem' });
                                            }
                                        }}
                                        expand="block"
                                        disabled={!newItemText.trim()}
                                    >
                                        保存
                                    </IonButton>
                                    <IonButton fill="outline" onClick={() => setAddModalOpen(false)} expand="block">取消</IonButton>
                                </div>
                            </div>
                        </IonContent>
                    </IonPage>
                </IonModal>

                {/* 删除功能已移除 */}
            </IonContent>
        </IonPage>
    );
}

function ScoreRow({ label, value, color }) {
    const displayValue = Number.isFinite(value) ? value : 0;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 36px', alignItems: 'center', gap: 8 }}>
            <div style={{ color: '#6b5d52', fontSize: 13 }}>{label}</div>
            <IonRange min={-3} max={3} step={1} snaps={true} ticks={true} pin={true} color={color} value={displayValue} disabled />
            <div style={{ fontSize: 12, color: '#6b5d52', textAlign: 'right' }}>{displayValue}</div>
        </div>
    );
}

function ScoreCell({ primary, secondary, onClick }) {
    const hasPrimary = Number.isFinite(primary);
    const hasSecondary = Number.isFinite(secondary);
    const displayValue = hasPrimary && hasSecondary
        ? `${primary} | ${secondary}`
        : (hasPrimary ? String(primary) : '-');
    return (
        <button
            onClick={onClick}
            style={{
                height: 36,
                border: '1px solid var(--line-color)',
                borderRadius: 8,
                background: '#f6f2ea',
                color: '#2b2b2b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14
            }}
            aria-label="评分"
        >
            {displayValue}
        </button>
    );
}

function ScoreEditor({ target, onClose, onSave }) {
    const [primary, setPrimary] = useState(() => Number.isFinite(target?.currentPrimary) ? target.currentPrimary : 0);
    const [secondaryEnabled, setSecondaryEnabled] = useState(() => Number.isFinite(target?.currentSecondary));
    const [secondary, setSecondary] = useState(() => Number.isFinite(target?.currentSecondary) ? target.currentSecondary : 0);
    useEffect(() => {
        setPrimary(Number.isFinite(target?.currentPrimary) ? target.currentPrimary : 0);
        setSecondaryEnabled(Number.isFinite(target?.currentSecondary));
        setSecondary(Number.isFinite(target?.currentSecondary) ? target.currentSecondary : 0);
    }, [target]);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>设置分数（-3 ~ +3）</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>关闭</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div style={{ padding: 16 }}>
                    <div style={{ marginBottom: 12, color: '#6b5d52' }}>
                        维度：{labelOfDimension(target?.dimension)}
                    </div>
                    <IonRange
                        min={-3}
                        max={3}
                        step={1}
                        snaps={true}
                        ticks={true}
                        pin={true}
                        value={primary}
                        onIonChange={(e) => setPrimary(Number(e.detail.value))}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ color: '#6b5d52', fontSize: 14 }}>添加第二个分数</div>
                        <IonToggle checked={secondaryEnabled} onIonChange={(e) => setSecondaryEnabled(Boolean(e.detail.checked))} />
                    </div>
                    {secondaryEnabled && (
                        <div style={{ marginTop: 8 }}>
                            <IonRange
                                min={-3}
                                max={3}
                                step={1}
                                snaps={true}
                                ticks={true}
                                pin={true}
                                value={secondary}
                                onIonChange={(e) => setSecondary(Number(e.detail.value))}
                            />
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <IonButton onClick={() => onSave?.({ primary, secondaryEnabled, secondary })} expand="block">保存</IonButton>
                        <IonButton fill="outline" onClick={onClose} expand="block">取消</IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}

function labelOfDimension(dim) {
    if (dim === 'shortTerm') return '短期';
    if (dim === 'longTerm') return '长期';
    if (dim === 'importance') return '重要';
    return '';
}

function openScoreModalFor(setActiveScoreTarget, setScoreModalOpen, itemId, dimension, currentPrimary, currentSecondary) {
    setActiveScoreTarget({ itemId, dimension, currentPrimary, currentSecondary });
    setScoreModalOpen(true);
}


