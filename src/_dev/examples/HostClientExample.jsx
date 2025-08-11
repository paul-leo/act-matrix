import React, { useRef, useState, useCallback } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList } from '@ionic/react';
import AppShellIframe from '../components/AppShellIframe.jsx';

/**
 * HostClient 使用示例组件
 * 演示如何使用集成了 HostClient 的 AppShellIframe 组件
 */
export default function HostClientExample() {
    const appShellRef = useRef(null);
    const [hostClient, setHostClient] = useState(null);
    const [capabilities, setCapabilities] = useState({});
    const [callResults, setCallResults] = useState([]);

    // HostClient 准备就绪的回调
    const handleHostClientReady = useCallback((client) => {
        console.log('🎉 HostClient 准备就绪！');
        setHostClient(client);
        setCapabilities(client.getCapabilities());
    }, []);

    // 调用 iframe 中的方法示例
    const callIframeMethod = useCallback(async (method, ...params) => {
        if (!hostClient) {
            alert('HostClient 尚未准备就绪');
            return;
        }

        try {
            console.log(`📤 调用方法: ${method}`, params);
            const result = await hostClient.call(method, ...params);
            console.log(`📥 调用结果:`, result);
            
            // 记录调用结果
            setCallResults(prev => [{
                method,
                params,
                result,
                timestamp: new Date().toLocaleTimeString(),
                success: true
            }, ...prev.slice(0, 9)]); // 保留最近 10 条记录
            
            return result;
        } catch (error) {
            console.error(`❌ 调用失败:`, error);
            
            // 记录错误
            setCallResults(prev => [{
                method,
                params,
                error: error.message,
                timestamp: new Date().toLocaleTimeString(),
                success: false
            }, ...prev.slice(0, 9)]);
            
            alert(`调用失败: ${error.message}`);
        }
    }, [hostClient]);

    // 示例方法调用
    const exampleCalls = [
        {
            name: '获取应用信息',
            method: 'getAppInfo',
            params: []
        },
        {
            name: '获取用户数据',
            method: 'getUserData',
            params: []
        },
        {
            name: '设置主题',
            method: 'setTheme',
            params: ['dark']
        },
        {
            name: '显示提示',
            method: 'showToast',
            params: ['Hello from Host!', 'success']
        },
        {
            name: '获取设备信息',
            method: 'getDeviceInfo',
            params: []
        }
    ];

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 控制面板 */}
            <div style={{ 
                position: 'fixed', 
                top: '20px', 
                left: '20px', 
                zIndex: 1002, 
                width: '400px',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>HostClient 控制面板</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {/* 连接状态 */}
                        <div style={{ marginBottom: '16px' }}>
                            <strong>连接状态: </strong>
                            <span style={{ 
                                color: hostClient ? '#22c55e' : '#ef4444',
                                fontWeight: 'bold'
                            }}>
                                {hostClient ? '已连接' : '未连接'}
                            </span>
                        </div>

                        {/* 可用能力 */}
                        {Object.keys(capabilities).length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <strong>可用能力:</strong>
                                <pre style={{ 
                                    fontSize: '11px', 
                                    background: '#f5f5f5', 
                                    padding: '8px', 
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    maxHeight: '100px'
                                }}>
                                    {JSON.stringify(capabilities, null, 2)}
                                </pre>
                            </div>
                        )}

                        {/* 示例方法调用 */}
                        <div style={{ marginBottom: '16px' }}>
                            <strong>示例方法调用:</strong>
                            <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
                                {exampleCalls.map((call, index) => (
                                    <IonButton
                                        key={index}
                                        size="small"
                                        fill="outline"
                                        disabled={!hostClient}
                                        onClick={() => callIframeMethod(call.method, ...call.params)}
                                    >
                                        {call.name}
                                    </IonButton>
                                ))}
                            </div>
                        </div>

                        {/* 调用历史 */}
                        {callResults.length > 0 && (
                            <div>
                                <strong>调用历史:</strong>
                                <IonList style={{ marginTop: '8px' }}>
                                    {callResults.map((result, index) => (
                                        <IonItem key={index}>
                                            <IonLabel>
                                                <h3 style={{ 
                                                    color: result.success ? '#22c55e' : '#ef4444',
                                                    fontSize: '12px'
                                                }}>
                                                    {result.method}
                                                    <span style={{ 
                                                        color: '#666', 
                                                        fontSize: '10px',
                                                        marginLeft: '8px'
                                                    }}>
                                                        {result.timestamp}
                                                    </span>
                                                </h3>
                                                <pre style={{ 
                                                    fontSize: '10px',
                                                    margin: '4px 0 0 0',
                                                    color: '#666',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {result.success 
                                                        ? `✅ ${JSON.stringify(result.result)}` 
                                                        : `❌ ${result.error}`
                                                    }
                                                </pre>
                                            </IonLabel>
                                        </IonItem>
                                    ))}
                                </IonList>
                            </div>
                        )}

                        {/* 手动操作 */}
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                            <IonButton
                                size="small"
                                fill="clear"
                                onClick={() => {
                                    if (appShellRef.current) {
                                        appShellRef.current.reload();
                                    }
                                }}
                            >
                                重新加载 iframe
                            </IonButton>
                            
                            <IonButton
                                size="small"
                                fill="clear"
                                onClick={() => {
                                    setCallResults([]);
                                }}
                            >
                                清空历史
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>
            </div>

            {/* AppShell Iframe */}
            <AppShellIframe
                ref={appShellRef}
                appId="demo-app"
                isDev={true}
                onHostClientReady={handleHostClientReady}
                onAppLoad={(data) => {
                    console.log('📱 应用加载完成:', data);
                }}
                onAppError={(error) => {
                    console.error('❌ 应用加载错误:', error);
                }}
            />
        </div>
    );
}
