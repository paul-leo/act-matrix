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
    IonList,
    IonItem,
    IonLabel,
    IonRange,
    IonSpinner,
} from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
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

    return (
        <IonPage>
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
                    <IonList>
                        {items.map((it) => {
                            const scores = it.scores || {};
                            const st = scores.shortTerm || {};
                            const lt = scores.longTerm || {};
                            const im = scores.importance || {};
                            return (
                                <IonItem key={it.id} style={{ alignItems: 'stretch' }}>
                                    <IonLabel>
                                        <div style={{ fontWeight: 600, marginBottom: 8 }}>{it.content}</div>
                                        <div style={{ display: 'grid', gap: 8 }}>
                                            <ScoreRow label="短期" value={st.primary} color="tertiary" />
                                            <ScoreRow label="长期" value={lt.primary} color="warning" />
                                            <ScoreRow label="重要" value={im.primary} color="danger" />
                                        </div>
                                    </IonLabel>
                                </IonItem>
                            );
                        })}
                    </IonList>
                )}
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


