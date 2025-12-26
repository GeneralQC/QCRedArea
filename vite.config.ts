import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      // 1. เพิ่ม base เพื่อให้ไฟล์ CSS/JS อ้างอิง Path บน GitHub Pages ได้ถูกต้อง
      base: '/QCRedArea/', 

      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // 2. แนะนำให้เพิ่มส่วนนี้เพื่อให้แน่ใจว่าไฟล์ที่ Build ออกมาจะอยู่ในโฟลเดอร์ dist
      build: {
        outDir: 'dist',
      }
    };
});
