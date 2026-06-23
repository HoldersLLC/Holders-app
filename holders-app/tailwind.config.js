/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4f0',
          100: '#fae4d8',
          200: '#f4c4a8',
          300: '#ec9d72',
          400: '#e37540',
          500: '#c85a22',
          600: '#a8461a',
          700: '#863517',
          800: '#652818',
          900: '#4a1e14',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#171b24',
          border:  '#252b38',
          muted:   '#1e2330',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
