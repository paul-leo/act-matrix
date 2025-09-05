import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
    const [userInfo, setUserInfo] = useState(null);
    const [appInfo, setAppInfo] = useState(null);
    const [appVersion, setAppVersion] = useState('1.0.0');

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

    // 获取用户信息和应用信息
    useEffect(() => {
        if (!hostClientReady || !hostClient) return;

        const fetchUserInfo = async () => {
            try {
                const authStatus = await hostClient?.auth?.getAuthStatus?.();
                const user = await hostClient?.auth?.getUserInfo?.();
                setUserInfo({ authStatus, user });
            } catch (error) {
                console.log('获取用户信息失败:', error);
                setUserInfo({ authStatus: { isAuthenticated: false, isLoading: false }, user: null });
            }
        };

        const fetchAppInfo = async () => {
            try {
                const info = await hostClient?.app?.getAppInfo?.() || await hostClient.call?.('app', 'getInfo');
                setAppInfo(info);
            } catch (error) {
                console.log('获取应用信息失败:', error);
                // 设置默认应用信息
                setAppInfo({
                    title: 'MorphixAI 应用',
                    description: '基于 MorphixAI 平台构建的应用',
                    icon: null,
                    themeColor: '#6366f1'
                });
            }
        };

        fetchUserInfo();
        fetchAppInfo();
    }, [hostClient, hostClientReady]);

    // 复制项目ID
    const handleCopyProjectId = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(appId);
            showToast('项目ID已复制到剪贴板', 'success');
        } catch (e) {
            showToast('复制失败，请手动复制', 'warning');
        }
    }, [appId, showToast]);

    // 登录操作
    const handleLogin = useCallback(async () => {
        if (!hostClientReady || !hostClient) {
            showToast('连接未就绪', 'warning');
            return;
        }

        try {
            const result = await hostClient?.auth?.triggerLogin?.();
            if (result?.success) {
                showToast('登录成功', 'success');
                // 重新获取用户信息
                const authStatus = await hostClient?.auth?.getAuthStatus?.();
                const user = await hostClient?.auth?.getUserInfo?.();
                setUserInfo({ authStatus, user });
            } else {
                showToast('登录失败', 'danger');
            }
        } catch (error) {
            console.error('登录失败:', error);
            showToast('登录过程中发生错误', 'danger');
        }
    }, [hostClient, hostClientReady, showToast]);

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
        <div className="w-full h-full flex flex-col">
            {/* Header with gradient background */}
            <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-lg font-bold text-white">调试控制台</span>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${hostClientReady ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'}` }>
                            <div className={`w-2 h-2 rounded-full ${hostClientReady ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-400 shadow-sm shadow-red-400/50'}`}></div>
                            {hostClientReady ? '已连接' : '未连接'}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyProjectId}
                            className="text-xs text-white/90 font-mono bg-white/15 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-all cursor-pointer"
                            title="点击复制项目ID"
                        >
                            <span className="text-white/70">项目ID:</span> {appId}
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 group cursor-pointer"
                                aria-label="关闭控制面板"
                            >
                                <svg className="w-4 h-4 text-white group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content with glassmorphism effect - flex-1 to fill remaining height */}
            <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-b-2xl border border-white/20 overflow-hidden">
                <div className="h-full p-6 space-y-6 overflow-y-auto">
                    {/* App Info Section */}
                    {appInfo && (
                        <div className="group">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-sm font-semibold text-slate-800">应用信息</h3>
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">v{appVersion}</span>
                            </div>
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-start gap-3">
                                    {appInfo.icon ? (
                                        <img src={appInfo.icon} alt="App Icon" className="w-12 h-12 rounded-lg shadow-sm" />
                                    ) : (
                                        <div 
                                            className="w-12 h-12 rounded-lg shadow-sm flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: appInfo.themeColor || '#6366f1' }}
                                        >
                                            {appInfo.title?.charAt(0) || 'A'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 truncate">{appInfo.title || '未命名应用'}</h4>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{appInfo.description || '暂无描述'}</p>
                                        {appInfo.themeColor && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-slate-500">主题色:</span>
                                                <div 
                                                    className="w-4 h-4 rounded-full border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: appInfo.themeColor }}
                                                ></div>
                                                <span className="text-xs font-mono text-slate-600">{appInfo.themeColor}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Status Section */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-800">用户状态</h3>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                            {userInfo?.authStatus?.isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {userInfo.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800">
                                            {userInfo.user?.email || '已登录用户'}
                                        </p>
                                        <p className="text-xs text-green-600">✓ 已登录</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600">未登录</p>
                                            <p className="text-xs text-slate-500">登录以获得完整功能</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogin}
                                        disabled={!hostClientReady}
                                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${hostClientReady ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        登录
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Upload Section */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-800">应用上传</h3>
                        </div>
                        <button
                            onClick={tryUpload}
                            disabled={!hostClientReady}
                            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 transform whitespace-nowrap ${hostClientReady ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            上传 / 更新应用
                        </button>
                    </div>

                    {/* Share Section */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-800">预览分享</h3>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-600 font-mono bg-white rounded-lg px-3 py-2 truncate border border-slate-200 shadow-sm">
                                        {previewUrl || '预览链接生成中...'}
                                    </div>
                                </div>
                                <button
                                    onClick={handleShare}
                                    disabled={!previewUrl}
                                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${previewUrl ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-md hover:shadow-lg cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    复制链接
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-800">扫码预览</h3>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                {previewUrl ? (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 rounded-2xl"></div>
                                        <div className="relative">
                                            <QRCodeCanvas 
                                                value={previewUrl} 
                                                size={200} 
                                                includeMargin={true}
                                                fgColor="#1e293b"
                                                bgColor="#ffffff"
                                            />
                                        </div>
                                        <div className="text-center mt-3">
                                            <p className="text-xs text-slate-500 font-medium">扫码在手机上预览</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-52 h-52 text-slate-400">
                                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <p className="text-sm font-medium">等待链接生成</p>
                                        <p className="text-xs mt-1">连接成功后显示二维码</p>
                                    </div>
                                )}
                            </div>
                        </div>
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


