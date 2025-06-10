/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sens-serif'],
        poppins: ['Poppins', 'sens-serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        main: "#02076C" //#0167CC
      },
      opacity: {
        10: '0.1',
        20: '0.2',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        80: '0.8',
        90: '0.9',
      },
      animation: {
        'custom-bounce': 'bounce-in-parent 2s infinite'
      },
      keyframes: {
        'bounce-in-parent': {
          '0%, 100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-5px)' } 
        }
      }
    },
  },
  plugins: [],
}