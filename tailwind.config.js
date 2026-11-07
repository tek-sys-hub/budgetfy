/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        planner: {
          bg: '#F5F3F8',
          card: '#FFFFFF',
          cardMuted: '#EDE9F2',
          cardBorder: '#E4DFEC',
          plum: '#241930',
          plumLight: '#39284D',
          plumHover: '#4B3666',
          purpleAccent: '#5A3E7B',
          textMain: '#241930',
          textMuted: '#6B5E7B',
          textLight: '#9487A5',
        },
        tabs: {
          jan: '#E8C8C8',
          feb: '#E5C5B5',
          mar: '#BBD5C4',
          apr: '#B9D8DC',
          may: '#E4DAA8',
          jun: '#E3BACB',
          jul: '#C1D6E2',
          aug: '#BEDAD2',
          sep: '#A7D4C2',
          oct: '#E0B693',
          nov: '#4A3561',
          dec: '#96B0BC',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
