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
      '@': '/src',
      '@components': '/src/components',
      '@styles': '/src/styles',
      '@utils': '/src/utils',
    },
  },
  // 确保静态资源可以被访问
  publicDir: 'public',
  // 配置开发服务器
  server: {
    port: 3000,
    open: true,
    // 允许访问 public 目录下的文件
    fs: {
      strict: false,
      allow: ['..']
    }
  },
});
