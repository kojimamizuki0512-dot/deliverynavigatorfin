/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        basebg: '#1A1A1A',
        surface: '#0F1115',
        card: '#14171C',
        brand: '#2A7FFF',
        accent: '#18C67A',
        gold: '#F4C430',
        line: 'rgba(255,255,255,0.06)'
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.45)',
        card: '0 12px 28px rgba(0,0,0,0.45)'
      },
      borderRadius: { xl2: '1.1rem' }
    }
  },
  plugins: []
}
