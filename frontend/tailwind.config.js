/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050B12',
        'secondary-background': '#07171B',
        'card-background': '#0D1B24',
        border: 'rgba(0,229,255,0.15)',
        primary: '#00E5FF',
        success: '#00FF88',
        warning: '#FFC857',
        danger: '#FF5252',
        'text-primary': '#FFFFFF',
        'text-secondary': 'rgba(255,255,255,0.65)'
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0,229,255,0.08)',
      }
    },
  },
  plugins: [],
};
