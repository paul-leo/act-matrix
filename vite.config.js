import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      '@': '/src/_dev',
      '@components': '/src/_dev/components',
      '@styles': '/src/_dev/styles',
      '@utils': '/src/_dev/utils',
    },
  },
  // 确保静态资源可以被访问
  publicDir: 'public',
  // 配置开发服务器
  server: {
    port: 3000,
    open: true,
    // 允许访问 public 目录下的文件
    // 监听 src/_dev 目录下的 app-files.json 文件变化
    watch: {
      // 监听 src/_dev 目录下的 JSON 文件
      include: ['src/_dev/**/*.json'],
      // 排除一些不需要监听的文件
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  },
});
