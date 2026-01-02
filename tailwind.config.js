/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5C7DA6',
        accent: '#D98C75',
        success: '#84A98C',
        paper: '#FDFCF8'
      }
    }
  },
  plugins: []
};
