module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        synchrony: {
          navy: '#002D72',
          blue: '#0072CE',
          gold: '#FFC72C',
          gray: '#F4F4F4',
          darkGray: '#333333',
          lightBlue: '#E6F2FF',
          accent: '#00A9E0',
        }
      },
      fontFamily: {
        sans: ['"Open Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
