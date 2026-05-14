/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
        // Core palette
        'pp-dark':         '#0C0623',
        'pp-dark2':        '#0D131D',
        'pp-navy':         '#26114A',
        'pp-blue':         '#00B8D7',
        'pp-cyan-bright':  '#00FAEF',
        'pp-purple':       '#8137F6',
        'pp-purple-deep':  '#641ABE',
        'pp-purple-bright':'#9000FF',
        'pp-purple-light': '#D1ADFF',
        'pp-purple-mid':   '#8290FF',
        'pp-lavender':     '#D1B6FC',
        // Text gradient stops
        'pp-grad-start':   '#9D6FFA',
        'pp-grad-mid':     '#5D93EA',
        'pp-grad-end':     '#00B4D9',
        // Google brand
        'google-blue':     '#4285F4',
        'google-red':      '#EA4335',
        'google-yellow':   '#FBBC05',
        'google-green':    '#34A853',
      },
    },
  },
  plugins: [],
}
