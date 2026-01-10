/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',   // Questify Mavisi
        secondary: '#2ecc71', // Başarı Yeşili
        danger: '#e74c3c',    // Hata Kırmızısı
        dark: '#2c3e50',      // Koyu Tema
        light: '#ecf0f1'      // Açık Zemin
      }
    },
    animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
  },
  plugins: [],
}