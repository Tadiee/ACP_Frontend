/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './pages/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './app/**/*.{js,jsx}',
    ],
    theme: {
      extend: {
        colors: {
          // Custom colors
          'black':'#000000',
          'light-white':'#E8F9FF',
          'blue': '#168df5',
          'orange': '#f5640a',
          'green': '#98eb09',
        }
      },
    },
    plugins: [],
  }