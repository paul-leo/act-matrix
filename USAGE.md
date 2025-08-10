# morphixai Simple Template - Apps 监听系统使用指南

## 🚀 快速开始

### 方式一：完整开发环境（推荐）
```bash
npm run dev
```
这会同时启动：
- 📁 文件监听器（监听 `apps/` 文件夹变化）  
- 🔧 Vite 开发服务器（端口 3000）

### 方式二：分别启动
```bash
# 终端 1：启动文件监听
npm run watch-apps

# 终端 2：启动开发服务器  
npm run dev:vite
```

## 🌐 访问地址

- **应用页面**: http://localhost:3000
- **JSON API**: http://localhost:3000/app-files.json

## 📁 工作原理

1. **文件监听**: 监听 `apps/` 文件夹的所有变化
2. **自动转换**: 将文件内容转换为 JSON 格式
3. **实时更新**: 保存到 `public/app-files.json`
4. **API 访问**: 通过 Vite 开发服务器提供 HTTP 接口

## 🔧 命令说明

| 命令 | 功能 | 说明 |
|------|------|------|
| `npm run dev` | 启动完整开发环境 | 文件监听 + 开发服务器（推荐） |
| `npm run dev:vite` | 启动 Vite 开发服务器 | 仅启动前端服务 |
| `npm run watch-apps` | 启动文件监听器 | 仅监听文件变化 |
| `npm run build` | 构建生产版本 | 构建静态文件 |

## ⚠️ 注意事项

1. **默认完整环境**: `npm run dev` 现在默认包含文件监听功能
2. **文件编码**: 确保所有文件使用 UTF-8 编码
3. **端口占用**: 默认使用 3000 端口，确保端口未被占用
4. **依赖安装**: 首次使用需要安装依赖 `npm install`

## 🐛 故障排除

### 无限循环问题
如果遇到脚本循环调用，检查 `package.json` 中的脚本配置：
```json
{
  "scripts": {
    "dev": "node scripts/dev-with-watch.js",      // ✅ 正确：启动完整环境
    "dev:vite": "vite"                           // ✅ 正确：仅启动 Vite
  }
}
```

### 端口占用
```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 停止进程
kill -9 <PID>
```

### 文件监听不工作
1. 检查 `apps/` 目录是否存在
2. 确认 `chokidar` 依赖已安装
3. 查看控制台错误信息

## 📊 JSON API 格式

生成的 `/app-files.json` 格式：
```json
{
  "app.jsx": "import React from 'react';\n// 文件内容...",
  "components/SimpleCounter.jsx": "// 组件内容...",
  "styles/App.module.css": "/* 样式内容... */",
  "styles/SimpleCounter.module.css": "/* 样式内容... */"
}
```

## 🔗 相关文件

- `scripts/watch-apps.js` - 文件监听脚本
- `scripts/dev-with-watch.js` - 开发环境启动脚本  
- `src/components/AppShellIframe.jsx` - 使用 JSON API 的组件
- `public/app-files.json` - 自动生成的文件内容
- `docs/APPS_WATCH_SYSTEM.md` - 详细技术文档
