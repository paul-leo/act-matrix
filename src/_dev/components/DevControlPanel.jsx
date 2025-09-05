import React, { useMemo, useState, useCallback } from 'react';
import { IonToast } from '@ionic/react';
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
    onClose,
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
        <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-800">调试与控制</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${hostClientReady ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}` }>
                            <span className={`w-2 h-2 rounded-full ${hostClientReady ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {hostClientReady ? '已连接' : '未连接'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-[11px] text-slate-500">App ID: {appId}</div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                                aria-label="关闭控制面板"
                            >
                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 bg-white rounded-b-xl shadow-sm border border-slate-200">
                {/* Upload */}
                <div className="">
                    <div className="text-sm font-medium text-slate-700 mb-2">上传应用</div>
                    <button
                        onClick={tryUpload}
                        disabled={!hostClientReady}
                        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition ${hostClientReady ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                    >
                        上传 / 更新 应用
                    </button>
                </div>

                {/* Share */}
                <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">预览链接</div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-slate-600 truncate bg-slate-50 border border-slate-200 rounded-md px-2 py-2">
                                {previewUrl || '—'}
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            disabled={!previewUrl}
                            className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition ${previewUrl ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'}`}
                        >
                            分享 / 复制
                        </button>
                    </div>
                </div>

                {/* QR */}
                <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">扫码预览</div>
                    <div className="inline-block bg-white border border-slate-200 rounded-xl p-3">
                        {previewUrl ? (
                            <QRCodeCanvas value={previewUrl} size={180} includeMargin={true} />
                        ) : (
                            <div className="text-xs text-slate-500">预览链接不可用</div>
                        )}
                    </div>
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
        </div>
    );
}


