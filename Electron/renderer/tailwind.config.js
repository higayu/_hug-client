/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'modal-slide-in': 'modalSlideIn 0.3s ease-out',
      },
      keyframes: {
        modalSlideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-50px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}

