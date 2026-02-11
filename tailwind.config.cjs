/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chanukaBlue: '#0057A5',
        chanukaOrange: '#F7941D',
        chanukaLight: '#FFF9F1',
      },
    },
  },
  plugins: [],
}
