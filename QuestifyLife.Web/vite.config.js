import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'QuestifyLife',
        short_name: 'Questify',
        description: 'Hayatını Oyunlaştır!',
        theme_color: '#3498db',
        icons: [
          {
            src: '/Happy_Fox_BF.png', // Bu ikonları public klasörüne koymalısın
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Happy_Fox_BF.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
