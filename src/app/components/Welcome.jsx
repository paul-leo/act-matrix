import React from 'react';
import { IonIcon } from '@ionic/react';
import { downloadOutline, globeOutline, chatbubbleEllipsesOutline, sparklesOutline, deviceMobileOutline } from 'ionicons/icons';
import styles from '../styles/Welcome.module.css';

/**
 * 欢迎组件 - 仅用于演示
 * 
 * 这个组件用于展示 Morphix AI Code 的功能和界面设计
 * 在实际开发中，请删除此组件并创建您自己的应用界面
 * 
 * @component
 * @returns {JSX.Element} 欢迎页面组件
 */
export default function Welcome() {
    const openDownload = () => {
        window.open('https://baibian.app/mobile-download', '_blank');
    };

    const openWebsite = () => {
        window.open('https://baibian.app/', '_blank');
    };

    return (
        <div className={styles.welcomeContainer}>

            {/* 头部 */}
            <div className={styles.header}>
                <div className={styles.logo}>
                    <img
                        src="https://app-shell.focusbe.com/Icon-60@3x.png"
                        alt="Morphix AI Logo"
                        className={styles.logoImage}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className={styles.logoGlow}></div>
                </div>

                <h1 className={styles.title}>
                    <span className={styles.titleGradient}>Morphix AI</span>
                    <span className={styles.titleSubtext}>Code</span>
                </h1>
                <p className={styles.subtitle}>用AI创建自己的专属APP</p>
            </div>

            {/* 三个步骤 */}
            <div className={styles.steps}>
                <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                        <h3>描述想法</h3>
                        <p>告诉 AI 你想要什么样的应用</p>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                        <h3>AI 生成</h3>
                        <p>AI生成并预览APP</p>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                        <h3>立即使用</h3>
                        <p>在百变AI助手中直接使用</p>
                    </div>
                </div>
            </div>

            {/* 行动按钮 */}
            <div className={styles.ctaSection}>
                <button 
                    className={styles.primaryBtn}
                    onClick={openDownload}
                >
                    <IonIcon icon={downloadOutline} />
                    下载百变AI助手
                </button>
                
                <button 
                    className={styles.secondaryBtn}
                    onClick={openWebsite}
                >
                    <IonIcon icon={globeOutline} />
                    访问官网
                </button>
            </div>

            {/* 底部 */}
            <div className={styles.footer}>
                <p>2024 Morphix AI. 让每个人都能创造应用。</p>
            </div>
        </div>
    );
}
