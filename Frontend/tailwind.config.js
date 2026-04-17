/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',
        'primary-light': '#60a5fa',
        'primary-dark': '#2563eb',
        'primary-50': '#eff6ff',
        'primary-900': '#1e3a5f',
        'secondary': '#06b6d4',
        'surface': '#111827',
        'surface-dark': '#0a0e1a',
        'surface-card': 'rgba(17, 24, 39, 0.7)',
        'surface-glass': 'rgba(255, 255, 255, 0.04)',
        'surface-glass-hover': 'rgba(255, 255, 255, 0.08)',
        'surface-input': 'rgba(255, 255, 255, 0.06)',
        'border': 'rgba(255, 255, 255, 0.06)',
        'border-hover': 'rgba(59, 130, 246, 0.3)',
        'border-active': 'rgba(59, 130, 246, 0.6)',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        'accent-amber': '#f59e0b',
        'accent-pink': '#ec4899',
        'accent-purple': '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59,130,246,0.15)',
        'glow-strong': '0 0 40px rgba(59,130,246,0.25)',
        'glow-xl': '0 0 60px rgba(59,130,246,0.35)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 600ms ease-out both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'bg-pulse': 'bgPulse 12s ease-in-out infinite alternate',
        'hero-glow': 'heroGlow 8s ease-in-out infinite alternate',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        bgPulse: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.7' },
        },
        heroGlow: {
          '0%': { transform: 'translateX(-50%) scale(1)', opacity: '0.7' },
          '100%': { transform: 'translateX(-50%) scale(1.15)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
