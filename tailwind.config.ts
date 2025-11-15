import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        ring: 'var(--ring)',
        input: 'var(--input)',

        // Custom base colors
        'app-background': '#F8FAFC',
        surface: '#FFFFFF',
        'surface-sub': '#F1F5F9',

        // Text colors
        'text-primary': '#0F172A',
        'text-secondary': '#475569',

        // Borders
        border: '#E2E8F0',

        // Brand & Primary
        brand: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          active: '#1D4ED8',
          subtle: '#EFF6FF',
        },

        // Neutral CTA
        neutral: {
          DEFAULT: '#334155',
          hover: '#1F2937',
        },

        // Module accents
        module: {
          appointments: {
            bg: '#E8F8EF',
            accent: '#16A34A',
            border: '#CDECDC',
          },
          meds: {
            bg: '#FEF6DC',
            accent: '#F59E0B',
            border: '#F6E7B6',
          },
          labs: {
            bg: '#FFEBDC',
            accent: '#F97316',
            border: '#FFD2B8',
          },
        },

        // Status colors
        success: {
          DEFAULT: '#16A34A',
          subtle: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#EAB308',
          subtle: '#FEFCE8',
        },
        error: {
          DEFAULT: '#DC2626',
          subtle: '#FEF2F2',
        },
        info: {
          DEFAULT: '#3B82F6',
          subtle: '#EFF6FF',
        },

        // Severity badges (DSM-light)
        severity: {
          low: {
            bg: '#E5E7EB',
            text: '#374151',
          },
          medium: {
            bg: '#FEF3C7',
            text: '#92400E',
          },
          high: {
            bg: '#FEE2E2',
            text: '#991B1B',
          },
        },

        // Form elements
        field: {
          bg: '#FFFFFF',
          text: '#0F172A',
          placeholder: '#94A3B8',
          border: '#CBD5E1',
          'border-hover': '#94A3B8',
          focus: '#3B82F6',
          disabled: {
            bg: '#F1F5F9',
            text: '#94A3B8',
            border: '#E2E8F0',
          },
        },
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(15,23,42,0.06)',
        'md': '0 2px 6px rgba(15,23,42,0.08)',
        'lg': '0 8px 20px rgba(15,23,42,0.10)',
      },
      ringColor: {
        DEFAULT: '#3B82F6',
      },
      ringWidth: {
        DEFAULT: '2px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

