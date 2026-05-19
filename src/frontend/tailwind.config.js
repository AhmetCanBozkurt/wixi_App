/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/CiktiTasarlamaPage/**/*.{ts,tsx}',
  ],
  corePlugins: {
    preflight: false, // Mevcut glassmorphism stillerini korumak için reset devre dışı
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
