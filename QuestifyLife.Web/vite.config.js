import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    
    VitePWA({
      registerType: 'autoUpdate',
      // Önbelleğe alınacak statik dosyalar
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'Happy_Fox_BF.png'],
      manifest: {
        name: 'QuestifyLife',
        short_name: 'QuestifyLife',
        description: 'Hayatını oyunlaştır, görevleri tamamla ve seviye atla!',
        theme_color: '#3498db',
        background_color: '#ffffff', // Açılış ekranı arka planı
        display: 'standalone',       // Tarayıcı çubuğunu gizler, uygulama gibi açılır
        orientation: 'portrait',     // Mobilde dik modu zorlar (isteğe bağlı)
        start_url: '/',              // Uygulama açıldığında başlayacağı sayfa
        icons: [
          {
            src: '/Happy_Fox_BF.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Happy_Fox_BF.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Happy_Fox_BF.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Android adaptif ikon desteği için
          }
        ]
      }
    })
  ],
  server: {
    host: true, // Docker için gerekli
    port: 5173,
  },
  build: {
    target: 'es2022' // import.meta ve top-level await desteği için hedef yükseltildi
  },
  esbuild: {
    target: 'es2022' // Geliştirme ortamı için esbuild hedefi
  }
});