/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan:    '#27e8ff',
          magenta: '#ff2bd6',
          violet:  '#8b5cff',
          mint:    '#00ffa3',
          amber:   '#ffb627',
          orange:  '#ff6b35',
          red:     '#ff3366',
          ink:     '#03060f',
        },
        cat: {
          general:       '#27e8ff',
          technology:    '#8b5cff',
          science:       '#00ffa3',
          business:      '#ffb627',
          health:        '#ff2bd6',
          sports:        '#ff6b35',
          entertainment: '#ff3366',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        neon:       '0 0 20px rgba(39,232,255,0.45), 0 0 60px rgba(255,43,214,0.25)',
        'neon-sm':  '0 0 8px rgba(39,232,255,0.6)',
        'neon-mag': '0 0 20px rgba(255,43,214,0.5)',
      },
      keyframes: {
        'corner-breathe': {
          '0%, 100%': { opacity: '0.45' },
          '50%':      { opacity: '1' },
        },
        'flicker': {
          '0%,89%,91%,93%,100%': { opacity: '1' },
          '90%': { opacity: '0.3' },
          '92%': { opacity: '0.7' },
        },
        'slide-up': {
          from: { transform: 'translateY(6px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        'scan-h': {
          '0%':   { transform: 'translateY(0%)',    opacity: '0' },
          '5%':   { opacity: '1' },
          '95%':  { opacity: '0.5' },
          '100%': { transform: 'translateY(700%)',  opacity: '0' },
        },
        'dot-blink': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.2' },
        },
      },
      animation: {
        'corner-breathe': 'corner-breathe 3s ease-in-out infinite',
        'flicker':        'flicker 9s ease-in-out infinite',
        'slide-up':       'slide-up 0.4s ease-out forwards',
        'scan-h':         'scan-h 5s linear infinite',
        'dot-blink':      'dot-blink 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
