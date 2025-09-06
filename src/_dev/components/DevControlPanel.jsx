import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { IonToast } from '@ionic/react';
import { QRCodeCanvas } from 'qrcode.react';
import { APP_SHELL_CONFIG } from '../config/appShellConfig.js';
import initialAppFiles from '../app-files.js';
import AppIcon, { AVAILABLE_ICONS, THEME_COLORS } from './AppIcon.jsx';

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
    // 需求更新：用户信息仅展示，不支持编辑
    const [appInfo, setAppInfo] = useState(null);
    const [appVersion, setAppVersion] = useState('1.0.0');
    const [isPublishing, setIsPublishing] = useState(false);
    const [appFiles, setAppFiles] = useState(initialAppFiles);
    const [remoteAppId, setRemoteAppId] = useState('');
    const [globalLoading, setGlobalLoading] = useState(false);
    const [isEditingApp, setIsEditingApp] = useState(false);
    const [editingAppInfo, setEditingAppInfo] = useState({
        title: '',
        description: '',
        icon: '',
        themeColor: '#6366f1'
    });

    const previewUrl = useMemo(() => {
        // 仅使用远端 appId 构建链接；未解析到时返回空
        if (!remoteAppId) return '';
        const baseUrl = isDev ? APP_SHELL_CONFIG.devBaseUrl : APP_SHELL_CONFIG.baseUrl;
        return `${baseUrl}/app/${remoteAppId}?t=${Date.now()}`;
    }, [remoteAppId, isDev]);

    const showToast = useCallback((message, color = 'primary') => {
        setToast({ open: true, message, color });
    }, []);

    const closeToast = useCallback(() => setToast(prev => ({ ...prev, open: false })), []);

    // HMR: 监听 app-files 变化
    useEffect(() => {
        let dispose;
        if (import.meta?.hot) {
            dispose = import.meta.hot.accept('../app-files.js', (newModule) => {
                setAppFiles(newModule?.default ?? initialAppFiles);
            });
        }
        return () => dispose?.();
    }, []);

    // 获取用户信息和应用信息 + 远端应用版本
    useEffect(() => {
        if (!hostClientReady || !hostClient) return;

        const fetchUserInfo = async () => {
            try {
                const authStatus = await hostClient?.auth?.getAuthStatus?.();
                const user = await hostClient?.auth?.getUserInfo?.();
                setUserInfo({ authStatus, user });
                // 展示用，不做编辑
            } catch (error) {
                console.log('Failed to get user info:', error);
                setUserInfo({ authStatus: { isAuthenticated: false, isLoading: false }, user: null });
            }
        };

        const fetchAppInfo = async () => {
            try {
                // Get app info by unique_id
                const response = await hostClient?.apps?.getAppByUniqueId?.(appId);
                if (response?.success === false) {
                    console.log('Failed to get app info:', response.message);
                    // App may not exist; treat as normal without error toast
                    return;
                }
                if (response?.data) {
                    const app = response.data;
                    const info = {
                        title: app.name || '',
                        description: app.desc || '',
                        icon: app.icon || '',
                        themeColor: app.color || '#6366f1'
                    };
                    setAppInfo(info);
                    setEditingAppInfo(info);
                }
            } catch (error) {
                console.log('Failed to get app info:', error);
                showToast(`Failed to get app info: ${error.message}`, 'danger');
            }
        };

        fetchUserInfo();
        fetchAppInfo();
        // 读取远端应用版本（若存在）
        (async () => {
            try {
                const response = await hostClient?.apps?.getAppByUniqueId?.(appId);
                if (response?.success !== false && response?.data) {
                    const remoteVersion = response.data.version;
                    const rid = response.data.id;
                    if (remoteVersion) {
                        setAppVersion(remoteVersion);
                    }
                    if (rid) setRemoteAppId(rid);
                }
            } catch {}
        })();
    }, [hostClient, hostClientReady]);

    // 复制项目ID
    const handleCopyProjectId = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(appId);
            showToast('Project ID copied to clipboard', 'success');
        } catch (e) {
            showToast('Copy failed, please copy manually', 'warning');
        }
    }, [appId, showToast]);

    // 登录操作
    const handleLogin = useCallback(async () => {
        if (!hostClientReady || !hostClient) {
            showToast('Connection not ready', 'warning');
            return;
        }

        try {
            const result = await hostClient?.auth?.triggerLogin?.();
            if (result?.success) {
                showToast('Login successful', 'success');
                // 重新获取用户信息
                const authStatus = await hostClient?.auth?.getAuthStatus?.();
                const user = await hostClient?.auth?.getUserInfo?.();
                setUserInfo({ authStatus, user });
            } else {
                showToast('Login failed', 'danger');
            }
        } catch (error) {
            console.error('Login failed:', error);
            showToast('An error occurred during login', 'danger');
        }
    }, [hostClient, hostClientReady, showToast]);

    // 开始编辑应用信息
    const handleStartEditApp = useCallback(() => {
        if (!appInfo) {
            // 如果没有应用信息，设置默认值
            setEditingAppInfo({
                title: '',
                description: '',
                icon: '',
                themeColor: '#6366f1'
            });
        }
        setIsEditingApp(true);
    }, [appInfo]);

    // 取消编辑
    const handleCancelEditApp = useCallback(() => {
        if (appInfo) {
            setEditingAppInfo({
                title: appInfo.title || '',
                description: appInfo.description || '',
                icon: appInfo.icon || '',
                themeColor: appInfo.themeColor || '#6366f1'
            });
        }
        setIsEditingApp(false);
    }, [appInfo]);

    // 保存应用信息
    const handleSaveAppInfo = useCallback(async () => {
        if (!hostClientReady || !hostClient) {
            showToast('Connection not ready', 'warning');
            return;
        }

        try {
            setGlobalLoading(true);
            
            // Get current app info first
            const currentApp = await hostClient?.apps?.getAppByUniqueId?.(appId);
            console.log('currentApp', currentApp);
            // Check if app exists and fetch succeeded
            if (currentApp?.success === false || !currentApp?.data?.id) {
                // App does not exist or fetch failed, create new app
                showToast('App does not exist, creating...', 'primary');
                
                const initialVersion = '0.1.0';
                const code = JSON.stringify(appFiles);
                const createReq = {
                    name: editingAppInfo.title || `App ${appId}`,
                    code,
                    version: initialVersion,
                    unique_id: appId,
                    desc: editingAppInfo.description,
                    visible: true,
                    icon: editingAppInfo.icon,
                    color: editingAppInfo.themeColor,
                };
                
                const createRes = await hostClient?.apps?.createApp?.(createReq);
                console.log('createRes', createRes);
                if (createRes?.success === false) {
                    showToast(`Failed to create app: ${createRes?.message || 'Unknown error'}`, 'danger');
                    return;
                }
                
                // 创建成功后更新状态
                setAppInfo(editingAppInfo);
                setAppVersion(initialVersion);
                setRemoteAppId(createRes?.data?.id || '');
                setIsEditingApp(false);
                showToast('App created and saved', 'success');
            } else {
                // 应用存在，更新应用信息
                const updateRequest = {
                    name: editingAppInfo.title,
                    desc: editingAppInfo.description,
                    icon: editingAppInfo.icon,
                    color: editingAppInfo.themeColor,
                };
                
                const result = await hostClient?.apps?.updateApp?.(currentApp.data.id, updateRequest);
                
                if (result?.success === false) {
                    showToast(`Save failed: ${result?.message || 'Unknown error'}`, 'danger');
                } else {
                    setAppInfo(editingAppInfo);
                    setIsEditingApp(false);
                    showToast('App info saved', 'success');
                }
            }
        } catch (error) {
            console.error('Failed to save app info:', error);
            showToast(`Save failed: ${error.message}`, 'danger');
        } finally {
            setGlobalLoading(false);
        }
    }, [hostClient, hostClientReady, editingAppInfo, showToast, appId, appFiles]);

    // 更新编辑中的应用信息
    const handleUpdateEditingApp = useCallback((field, value) => {
        setEditingAppInfo(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // 版本号 Patch 递增
    const bumpPatch = useCallback((v) => {
        const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)$/);
        if (!m) return String((Number(v) || 0) + 1);
        const major = Number(m[1]);
        const minor = Number(m[2]);
        const patch = Number(m[3]);
        return `${major}.${minor}.${patch + 1}`;
    }, []);

    // 发布/更新应用
    const handlePublishApp = useCallback(async () => {
        if (!hostClientReady || !hostClient) {
            showToast('HostClient not ready', 'warning');
            return;
        }

        // 检查应用信息是否完整
        if (!appInfo?.title || !appInfo?.icon) {
            showToast('Please complete app info (name and icon) first', 'warning');
            setIsEditingApp(true);
            return;
        }

        try {
            setIsPublishing(true);
            setGlobalLoading(true);
            showToast('Publishing app...', 'primary');

            // 将 appFiles 序列化为字符串
            const code = JSON.stringify(appFiles);

            // 1) 查询远端应用是否存在（按 unique_id）
            let appResponse = await hostClient?.apps?.getAppByUniqueId?.(appId);
            let remoteApp = (appResponse?.success !== false) ? appResponse?.data : null;

            // 2) 如果不存在则创建
            if (!remoteApp) {
                const initialVersion = '0.1.0';
                const createReq = {
                    name: (appInfo?.title || `App ${appId}`),
                    code,
                    version: initialVersion,
                    unique_id: appId,
                    desc: appInfo?.description,
                    visible: true,
                    icon: appInfo?.icon,
                    color: appInfo?.themeColor,
                };
                const createRes = await hostClient?.apps?.createApp?.(createReq);
                if (createRes?.success === false) throw new Error(createRes?.message || 'Failed to create app');
                remoteApp = createRes?.data;
                setAppVersion(initialVersion);
                showToast('App created, preparing to publish new version...', 'success');
            }

            // 3) 计算新版本并更新代码
            const currentVersion = remoteApp?.version || appVersion || '0.1.0';
            const nextVersion = bumpPatch(currentVersion);
            const updateReq = {
                code,
                version: nextVersion,
                desc: appInfo?.description,
                visible: true,
                icon: appInfo?.icon,
                color: appInfo?.themeColor,
            };
            const updateRes = await hostClient?.apps?.updateApp?.(remoteApp.id, updateReq);
            if (updateRes?.success === false) throw new Error(updateRes?.message || 'Failed to update app');

            setAppVersion(nextVersion);
            showToast(`Published: v${nextVersion}`, 'success');
        } catch (err) {
            // 并发下创建冲突的兜底：重查 unique_id 后重试更新
            try {
                const retry = await hostClient?.apps?.getAppByUniqueId?.(appId);
                if (retry?.success !== false && retry?.data?.id) {
                    const currentVersion = retry?.data?.version || appVersion || '0.1.0';
                    const nextVersion = bumpPatch(currentVersion);
                    const code = JSON.stringify(appFiles);
                    const updateRes = await hostClient?.apps?.updateApp?.(retry.data.id, { code, version: nextVersion, desc: appInfo?.description, visible: true, icon: appInfo?.icon, color: appInfo?.themeColor });
                    if (updateRes?.success !== false) {
                        setAppVersion(nextVersion);
                        showToast(`Published: v${nextVersion}`, 'success');
                        setIsPublishing(false);
                        return;
                    }
                }
            } catch {}
            console.error('Publish failed:', err);
            showToast(err?.message || 'Publish failed, please try again', 'danger');
        } finally {
            setIsPublishing(false);
            setGlobalLoading(false);
        }
    }, [hostClient, hostClientReady, showToast, appId, appInfo, appFiles, appVersion, bumpPatch]);

    const handleShare = useCallback(async () => {
        if (!previewUrl) {
            showToast('Preview link unavailable', 'warning');
            return;
        }

        try {
            if (navigator.share) {
                await navigator.share({ title: 'Morphix App Preview', text: 'Preview link', url: previewUrl });
                return;
            }
        } catch {}

        try {
            await navigator.clipboard.writeText(previewUrl);
            showToast('Preview link copied to clipboard', 'success');
        } catch (e) {
            showToast('Unable to copy to clipboard, please copy manually', 'warning');
        }
    }, [previewUrl, showToast]);

    // 用户信息不支持编辑，移除相关逻辑

    return (
        <div className="w-full h-full max-h-screen flex flex-col relative">
            {/* Header with gradient background */}
            <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-lg font-bold text-white no-wrap">Console</span>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${hostClientReady ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'}` }>
                            <div className={`no-wrap w-2 h-2 rounded-full ${hostClientReady ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-400 shadow-sm shadow-red-400/50'}`}></div>
                            {hostClientReady ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyProjectId}
                            className="text-xs text-white/90 font-mono bg-white/15 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-all cursor-pointer"
                            title="Click to copy Project ID"
                        >
                            <span className="text-white/70">Project ID:</span> {appId}
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 group cursor-pointer"
                                aria-label="Close control panel"
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
            <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-b-2xl border border-white/20 overflow-hidden min-h-0">
                <div className="h-full p-6 space-y-6 overflow-y-auto max-h-full">
                    {/* App Info Section */}
                    <div className="group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-sm font-semibold text-slate-800">App Info</h3>
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">v{appVersion}</span>
                            </div>
                            {!isEditingApp ? (
                                <button
                                    onClick={handleStartEditApp}
                                    className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer font-medium"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveAppInfo}
                                        className="text-xs text-green-600 hover:text-green-700 cursor-pointer font-medium"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancelEditApp}
                                        className="text-xs text-slate-500 hover:text-slate-600 cursor-pointer font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                            {isEditingApp ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">App Name</label>
                                        <input
                                            type="text"
                                            value={editingAppInfo.title}
                                            onChange={(e) => handleUpdateEditingApp('title', e.target.value)}
                                            placeholder="Enter app name"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">App Description</label>
                                        <textarea
                                            value={editingAppInfo.description}
                                            onChange={(e) => handleUpdateEditingApp('description', e.target.value)}
                                            placeholder="Enter app description"
                                            rows={2}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">App Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_ICONS.map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => handleUpdateEditingApp('icon', icon)}
                                                    className={`flex-shrink-0 p-2 rounded-lg border ${editingAppInfo.icon === icon ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-200'} cursor-pointer bg-transparent`}
                                                >
                                                    <AppIcon
                                                        name={icon}
                                                        color={editingAppInfo.icon === icon ? (editingAppInfo.themeColor || '#6366f1') : '#ccc'}
                                                        size={36}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Theme Color</label>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {THEME_COLORS.map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => handleUpdateEditingApp('themeColor', c)}
                                                    className={`w-7 h-7 rounded-full border ${editingAppInfo.themeColor === c ? 'border-purple-600 ring-2 ring-purple-200' : 'border-slate-300'} cursor-pointer`}
                                                    style={{ backgroundColor: c }}
                                                    aria-label={c}
                                                />
                                            ))}
                                            <input
                                                type="text"
                                                value={editingAppInfo.themeColor}
                                                onChange={(e) => handleUpdateEditingApp('themeColor', e.target.value)}
                                                placeholder="#6366f1"
                                                className="px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                style={{ width: 120 }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Form footer save button */}
                                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                                        <button
                                            onClick={handleSaveAppInfo}
                                            disabled={globalLoading}
                                            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${globalLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEditApp}
                                            disabled={globalLoading}
                                            className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${globalLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'}`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <AppIcon name={appInfo?.icon || 'apps'} color={appInfo?.themeColor || '#6366f1'} size={48} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 truncate">{appInfo?.title || 'Untitled App'}</h4>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{appInfo?.description || 'No description'}</p>
                                        {appInfo?.themeColor && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-slate-500">Theme Color:</span>
                                                <div 
                                                    className="w-4 h-4 rounded-full border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: appInfo?.themeColor }}
                                                ></div>
                                                <span className="text-xs font-mono text-slate-600">{appInfo?.themeColor}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Status Section */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-800">User Status</h3>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                            <div className="space-y-3">
                                {userInfo?.authStatus?.isAuthenticated ? (
                                    <div className="flex items-center gap-3">
                                        {userInfo.user?.avatar ? (
                                            <img 
                                                src={userInfo.user.avatar} 
                                                alt="User Avatar" 
                                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {userInfo.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">
                                                {userInfo.user?.email || 'Signed-in User'}
                                            </p>
                                            <p className="text-xs text-green-600">✓ Signed in</p>
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
                                                <p className="text-sm text-slate-600">Not signed in</p>
                                                <p className="text-xs text-slate-500">Sign in to access full features</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogin}
                                            disabled={!hostClientReady}
                                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${hostClientReady ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                        >Sign In</button>
                                    </div>
                                )}

                                {/* 用户信息不可编辑 */}
                            </div>
                        </div>
                    </div>
                    {/* Upload Section */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-800">Upload App</h3>
                        </div>
                        <button
                            onClick={handlePublishApp}
                            disabled={!hostClientReady || isPublishing}
                            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 transform whitespace-nowrap ${hostClientReady && !isPublishing ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {isPublishing ? 'Publishing...' : 'Upload / Update App'}
                        </button>
                    </div>

                    {/* Share Section */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-800">Share Preview</h3>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-600 font-mono bg-white rounded-lg px-3 py-2 truncate border border-slate-200 shadow-sm">
                                        {previewUrl || 'Generating preview link...'}
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
                                    Copy link
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
                            <h3 className="text-sm font-semibold text-slate-800">Scan to Preview</h3>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                {previewUrl ? (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 rounded-2xl"></div>
                                        <div className="relative">
                                            <QRCodeCanvas 
                                                value={previewUrl} 
                                                size={160} 
                                                includeMargin={true}
                                                fgColor="#1e293b"
                                                bgColor="#ffffff"
                                            />
                                        </div>
                                        <div className="text-center mt-3">
                                            <p className="text-xs text-slate-500 font-medium">Scan to preview on mobile</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-52 h-52 text-slate-400">
                                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <p className="text-sm font-medium">Waiting for link</p>
                                        <p className="text-xs mt-1">QR code will appear after connection is ready</p>
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

            {/* 全局 Loading 遮罩 */}
            {globalLoading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                    <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-600 font-medium">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
}


