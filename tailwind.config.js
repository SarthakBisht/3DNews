/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#27e8ff',
          magenta: '#ff2bd6',
          violet: '#8b5cff',
          ink: '#03060f',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(39,232,255,0.45), 0 0 60px rgba(255,43,214,0.25)',
      },
    },
  },
  plugins: [],
};
