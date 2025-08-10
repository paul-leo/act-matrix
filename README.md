# MorphixAI Code - 开源开发框架

> 🚀 **快速开发 MorphixAI 应用的完整开发框架**

这是一个开源的 MorphixAI 应用开发框架，提供完整的开发环境、规范和工具链，让开发者能够快速创建符合 MorphixAI 平台规范的应用。

## 🎯 项目特点

- 👶 **零门槛开发** - 前端小白也能快速开发专业级移动应用
- 🚀 **无需上架** - 开发完成即可直接使用，无需应用商店审核
- 🤖 **AI 智能助手** - 告诉 AI 你想要什么功能，自动生成完整代码
- 📱 **原生体验** - 一次开发，跨平台运行，媲美原生应用性能
- ⚡ **极速上手** - 3 分钟搭建开发环境，30 分钟完成第一个应用

## 📁 项目结构

```
morphixai-code/
├── .cursor/rules/              # 🤖 AI 智能开发规范
│   ├── morphixai-app-development.md
│   ├── file-protection.md
│   ├── docs-context.md
│   └── README.md
├── docs/                      # 📚 项目文档（AI 上下文）
│   ├── requirements/          # 需求文档
│   ├── design/               # 设计文档
│   ├── technical/            # 技术文档
│   ├── context/              # 上下文文档
│   └── notes/                # 开发笔记
├── src/app/                    # 🎯 开发区域（唯一允许修改的目录）
│   ├── app.jsx                # 应用入口文件
│   ├── components/            # React 组件
│   └── styles/               # CSS 模块样式
├── src/_dev/                  # 🔒 开发辅助文件（受保护）
├── scripts/                   # 🔒 构建脚本（受保护）
├── package.json              # 🔒 项目配置（受保护）
└── vite.config.js            # 🔒 构建配置（受保护）
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/morphixai/morphixai-code.git
cd morphixai-code
```

### 2. 安装依赖
```bash
npm install
```

### 3. 开始智能开发

#### 🤖 AI 驱动开发体验
本项目内置智能开发规则，支持主流 AI 代码编辑器：

1. **使用支持的 AI 编辑器打开项目**
   - 推荐使用支持 AI 对话的现代化编辑器
   - 项目已预配置完整的 AI 开发规范

2. **AI 智能开发特性**
   - 🧠 **自然语言编程** - 用中文描述需求，AI 自动生成代码
   - 🛡️ **智能保护** - 自动防止修改系统文件，确保项目稳定
   - 📋 **规范遵循** - 自动应用 MorphixAI 开发规范和最佳实践
   - 🚫 **错误预防** - 实时检测并预防常见开发错误

3. **智能开发流程**
   - 在 `src/app/` 目录下与 AI 对话
   - 描述你想要的功能："创建一个用户卡片组件"
   - AI 自动生成完整的组件代码和样式
   - 无需手动配置，开箱即用

#### 💡 AI 开发示例
```
你：创建一个显示用户信息的卡片组件，包含头像、姓名和关注按钮

AI：我来为你创建一个用户卡片组件...
- 自动创建 src/app/components/UserCard.jsx
- 自动创建 src/app/styles/UserCard.module.css  
- 使用现代化 UI 组件和 MorphixAI 规范
- 包含响应式设计和最佳实践
```

### 4. 启动开发服务器
```bash
npm run dev
```

现在你可以在浏览器中查看应用，同时享受 AI 智能开发体验！

## 🎯 开发约束

### ⚠️ 重要：开发限制
**只能在 `src/app/` 目录下进行开发！**

✅ **允许修改：**
- `src/app/app.jsx` - 应用入口文件
- `src/app/components/` - 所有组件文件
- `src/app/styles/` - 所有样式文件
- `src/app/` 下的任何新文件和目录

❌ **严禁修改：**
- `package.json` - 项目配置
- `vite.config.js` - 构建配置
- `src/_dev/` - 开发辅助文件
- 任何根目录配置文件

### 🤖 AI 智能开发优势

框架内置的 AI 规则让你享受：

1. **零学习成本** - 无需学习复杂的技术规范，用自然语言即可开发
2. **智能代码生成** - AI 自动生成高质量、符合规范的完整代码
3. **实时质量保证** - 自动避免常见错误，确保代码质量
4. **最佳实践内置** - 自动应用行业最佳实践和性能优化

## 🛠 核心技术栈

### 核心技术
- **React** - 世界上最流行的前端框架
- **现代化 UI 组件** - 丰富的移动端界面组件
- **快速构建工具** - 秒级热重载，极速开发体验
- **跨平台支持** - 一套代码，多端运行

### MorphixAI 生态
- **官方组件库** - 开箱即用的精美组件
- **原生能力 SDK** - 相机、位置、存储等原生功能
- **智能开发工具** - AI 驱动的代码生成和优化

## 🤖 AI 智能开发示例

### 自然语言编程
通过与 AI 对话，你可以用中文描述需求来开发应用：

#### 示例对话 1：创建组件
```
你：帮我创建一个用户资料卡片组件，包含头像、姓名、简介和关注按钮

AI：我来为你创建一个用户资料卡片组件：

1. 创建 src/app/components/UserProfile.jsx
2. 创建 src/app/styles/UserProfile.module.css
3. 使用现代化 UI 组件和 MorphixAI 规范
4. 包含响应式设计和精美动画
```

#### 示例对话 2：添加功能
```
你：在用户卡片中添加点赞功能，并保存到本地存储

AI：我来为用户卡片添加点赞功能：

1. 使用 useState 管理点赞状态
2. 集成 StorageAPI 进行本地存储
3. 添加点赞动画效果
4. 包含错误处理
```

#### 示例对话 3：样式调整
```
你：让卡片更加现代化，添加阴影效果和圆角

AI：我来优化卡片样式：

1. 更新 CSS Module 样式
2. 添加现代化阴影效果
3. 优化圆角和间距
4. 确保移动端适配
```

### AI 自动生成的代码特点

✅ **专业级代码** - 自动生成符合行业标准的高质量代码
✅ **移动端优化** - 自动适配各种屏幕尺寸和设备
✅ **智能错误处理** - 自动添加异常处理和用户提示
✅ **性能优化** - 自动应用最佳实践，确保应用流畅运行
✅ **安全可靠** - 自动添加数据验证和安全检查

## 📱 运行环境

此模板设计为在 **MorphixAI App Runner** 中运行：

1. **开发环境**：在 App Shell 中预览
2. **生产环境**：通过 RemoteAppRunner 加载
3. **编译输出**：支持预编译和实时编译两种模式

## 🔗 相关文档

- [应用开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)
- [App SDK API 文档](https://app-shell.focusbe.com/docs/app-sdk-api.md)
- [图标使用规范](https://app-shell.focusbe.com/docs/icon-specification.md)

## 🔧 开发工具

### 文件监控与同步

项目提供了便捷的文件监控和同步工具：

#### 监控文件变化
```bash
npm run watch-apps
```
- 监控 `src/app/` 目录下的所有文件
- 自动生成 `public/app-files.json`
- 支持热重载和实时更新

#### 还原文件
```bash
npm run restore-apps        # 从 app-files.json 还原文件
npm run restore-apps help   # 显示帮助信息
```
- 从 `app-files.json` 还原文件到 `src/app/` 目录
- 自动创建目录结构
- 保持文件内容同步

**工作流程：**
1. 正向：`src/app/` → `app-files.json` (watch-apps)
2. 逆向：`app-files.json` → `src/app/` (restore-apps)

这对于文件备份、版本管理和团队协作非常有用。

## 💡 最佳实践

### AI 智能开发建议
1. **使用自然语言** - 用清晰的中文描述你要实现的功能
2. **逐步迭代** - 先创建基础功能，再逐步完善
3. **信任 AI 智能** - AI 会自动应用行业最佳实践
4. **及时预览** - 每次生成代码后及时在浏览器中查看效果

### 开发效率提升
- 🚀 **比传统开发快 3-5 倍** - AI 智能生成，告别重复劳动
- 🎯 **零技术门槛** - 前端小白也能开发专业应用
- 🛡️ **零错误风险** - AI 自动避免常见编程错误
- 📱 **完美体验** - 自动优化移动端性能和交互

---

## 🛠 手动开发指南（传统方式）

如果你不使用 AI 编辑器，也可以手动开发：

### 项目结构要求
```
src/app/
├── app.jsx              # 应用入口文件（必需）
├── components/          # 组件目录
└── styles/             # CSS 模块样式
```

### 手动创建组件示例
```jsx
// src/app/components/UserCard.jsx
import React from 'react';
import { IonCard, IonCardContent, IonButton } from '@ionic/react';
import styles from '../styles/UserCard.module.css';

export default function UserCard({ user, onFollow }) {
    return (
        <IonCard className={styles.userCard}>
            <IonCardContent>
                <h3>{user.name}</h3>
                <p>{user.bio}</p>
                <IonButton onClick={() => onFollow(user.id)}>
                    关注
                </IonButton>
            </IonCardContent>
        </IonCard>
    );
}
```

### 手动创建样式文件
```css
/* src/app/styles/UserCard.module.css */
.userCard {
    margin: 16px 0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.userCard h3 {
    color: var(--ion-color-primary);
    margin: 0 0 8px 0;
}
```

### 手动开发命令
```bash
# 创建新组件
mkdir src/app/components/FeatureName
touch src/app/components/FeatureName/FeatureName.jsx

# 创建样式文件
touch src/app/styles/FeatureName.module.css

# 创建工具函数
mkdir src/app/utils
touch src/app/utils/helpers.js
```

**注意**：手动开发需要严格遵循 [MorphixAI 开发规范](https://app-shell.focusbe.com/docs/app-development-specification.md)，建议使用 AI 智能开发获得更好的开发体验。

---

**推荐使用 AI 智能开发，让编程变得简单有趣！** 🚀
