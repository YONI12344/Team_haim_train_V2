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
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        muted: 'hsl(var(--muted))',
        destructive: 'hsl(var(--destructive))',
        navy: {
          DEFAULT: 'hsl(var(--primary))',
          800: 'hsl(var(--primary-soft))',
          900: 'hsl(220 50% 14%)',
        },
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          soft: 'hsl(var(--gold-soft))',
          dark: 'hsl(43 50% 43%)',
        },
      },
      fontFamily: {
        sans: ['Heebo', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
      boxShadow: {
        premium: '0 16px 42px -28px hsl(220 45% 20% / 0.45)',
      },
    },
  },
  plugins: [],
}

export default config
