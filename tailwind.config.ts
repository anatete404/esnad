import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#0d7a3e',
          dark: '#0a0f0d',
          gold: '#c89a2c',
        },
      },
    },
  },
  plugins: [],
}

export default config
