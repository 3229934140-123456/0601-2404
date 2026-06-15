/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        pixel: {
          gold: '#fbbf24',
          goldDark: '#92400e',
          'brown-dark': '#3D2914',
          'brown': '#5D4037',
          'tan': '#C4A35A',
          'tan-light': '#D4B36A',
          'blue': '#4A90D9',
          'blue-light': '#5AA0E9',
          'red': '#E74C3C',
          'red-light': '#F75C4C',
          'green': '#2ECC71',
          'green-light': '#3EDC81',
          'gray': '#7F8C8D',
          'gray-light': '#95A5A6',
          'cream': '#F5E6C8',
          'dark': '#1A1A2E',
          stone: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
            950: '#0c0a09',
          },
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'pixel': '4px 4px 0 0 #3D2914',
        'pixel-sm': '2px 2px 0 0 #3D2914',
        'pixel-lg': '6px 6px 0 0 #3D2914',
        'pixel-inset': 'inset 2px 2px 0 0 rgba(0,0,0,0.3), inset -2px -2px 0 0 rgba(255,255,255,0.2)',
        'pixel-glow': '0 0 10px currentColor, 0 0 20px currentColor',
      },
      animation: {
        'scanline': 'scanline-flicker 0.15s infinite',
        'pixel-press': 'pixelPress 0.1s ease-in-out',
        'pixel-bounce': 'pixelBounce 0.5s ease-in-out infinite',
        'pixel-shake': 'pixelShake 0.3s ease-in-out',
        'pixel-fade-in': 'pixelFadeIn 0.2s ease-out',
        'pixel-slide-up': 'pixelSlideUp 0.3s ease-out',
        'pixel-progress': 'pixelProgress 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'scanline-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
        pixelPress: {
          '0%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(2px, 2px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pixelShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        pixelFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pixelSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pixelProgress: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '20px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
