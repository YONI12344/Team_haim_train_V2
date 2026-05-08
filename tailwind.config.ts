import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4A',
          800: '#243A66',
          900: '#0F1C38',
        },
        gold: {
          DEFAULT: '#C9A84C',
          soft: '#F5EBD0',
          dark: '#A88A3A',
        },
      },
      fontFamily: {
        sans: ['Assistant', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 40px -10px rgba(27,42,74,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
