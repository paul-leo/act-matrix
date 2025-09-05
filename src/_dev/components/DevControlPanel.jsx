import React, { useMemo, useState, useCallback } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList, IonToast } from '@ionic/react';
import { QRCodeCanvas } from 'qrcode.react';

/**
 * DevControlPanel - 调试与控制面板
 *
 * 通过 HostClient 与 iframe 交互：
 * - 上传应用（调用 HostSDK 提供的上传能力）
 * - 分享应用（复制 / 系统分享预览链接）
 * - 动态二维码（基于预览链接生成）
 */
export default function DevControlPanel({
    appId,
    isDev,
    hostClient,
    hostClientReady,
    getPreviewUrl,
}) {
    const [toast, setToast] = useState({ open: false, message: '', color: 'primary' });

    const previewUrl = useMemo(() => {
        try {
            const url = getPreviewUrl?.();
            return url || '';
        } catch (e) {
            return '';
        }
    }, [getPreviewUrl, appId, isDev]);

    const showToast = useCallback((message, color = 'primary') => {
        setToast({ open: true, message, color });
    }, []);

    const closeToast = useCallback(() => setToast(prev => ({ ...prev, open: false })), []);

    // 尝试以多种方式调用上传能力，以适配不同的 HostSDK 实现
    const tryUpload = useCallback(async () => {
        if (!hostClientReady || !hostClient) {
            showToast('HostClient 未就绪', 'warning');
            return;
        }

        const tryCalls = [
            async () => hostClient?.dev?.openUploadDialog?.(),
            async () => hostClient?.dev?.uploadApp?.(),
            async () => hostClient.call?.('dev', 'openUploadDialog'),
            async () => hostClient.call?.('dev', 'uploadApp'),
            async () => hostClient.call?.('app', 'upload'),
        ];

        for (const fn of tryCalls) {
            try {
                const result = await fn?.();
                showToast('已请求打开上传/更新功能', 'success');
                return result;
            } catch (e) {
                // 继续尝试下一种调用方式
            }
        }

        showToast('未找到可用的上传能力，请确认 iframe HostSDK 实现', 'danger');
    }, [hostClient, hostClientReady, showToast]);

    const handleShare = useCallback(async () => {
        if (!previewUrl) {
            showToast('预览链接不可用', 'warning');
            return;
        }

        try {
            if (navigator.share) {
                await navigator.share({ title: 'Morphix App Preview', text: '预览链接', url: previewUrl });
                return;
            }
        } catch {}

        try {
            await navigator.clipboard.writeText(previewUrl);
            showToast('已复制预览链接到剪贴板', 'success');
        } catch (e) {
            showToast('无法复制到剪贴板，请手动复制', 'warning');
        }
    }, [previewUrl, showToast]);

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>调试与控制</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                {/* 连接状态 */}
                <div style={{ marginBottom: '12px' }}>
                    <strong>连接状态: </strong>
                    <span style={{ color: hostClientReady ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                        {hostClientReady ? '已连接' : '未连接'}
                    </span>
                </div>

                {/* 上传应用 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <IonButton size="default" onClick={tryUpload} disabled={!hostClientReady}>
                        上传 / 更新 应用
                    </IonButton>
                </div>

                {/* 分享应用 */}
                <div style={{ margin: '12px 0' }}>
                    <strong>预览链接</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <code style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '60%' }}>
                            {previewUrl || '—'}
                        </code>
                        <IonButton size="small" fill="outline" onClick={handleShare} disabled={!previewUrl}>
                            分享 / 复制
                        </IonButton>
                    </div>
                </div>

                {/* 二维码 */}
                <div style={{ marginTop: '12px' }}>
                    <strong>扫码预览</strong>
                    <div style={{ marginTop: '8px', background: '#fff', padding: '8px', display: 'inline-block', borderRadius: '8px' }}>
                        {previewUrl ? (
                            <QRCodeCanvas value={previewUrl} size={160} includeMargin={true} />
                        ) : (
                            <div style={{ fontSize: '12px', color: '#666' }}>预览链接不可用</div>
                        )}
                    </div>
                </div>

                <IonToast
                    isOpen={toast.open}
                    message={toast.message}
                    duration={2000}
                    color={toast.color}
                    onDidDismiss={closeToast}
                    position="top"
                />
            </IonCardContent>
        </IonCard>
    );
}


