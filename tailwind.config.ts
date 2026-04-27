import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Inter Tight', 'Inter', 'sans-serif'],
        sora: ['Inter Tight', 'Inter', 'sans-serif'],
        tight: ['Inter Tight', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '1.04', letterSpacing: '-0.02em',  fontWeight: '600' }],
        h2: ['32px', { lineHeight: '1.1',  letterSpacing: '-0.015em', fontWeight: '600' }],
        h3: ['22px', { lineHeight: '1.25', letterSpacing: '-0.01em',  fontWeight: '600' }],
        h4: ['17px', { lineHeight: '1.35', fontWeight: '500' }],
        body: ['15px', { lineHeight: '1.55', fontWeight: '400' }],
        label: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      maxWidth: {
        content: '1200px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
          hover: "hsl(var(--accent-hover))",
        },
        amber: {
          DEFAULT: "hsl(var(--amber))",
          foreground: "hsl(var(--amber-foreground))",
          hover: "hsl(var(--amber-hover))",
          active: "hsl(var(--amber-active))",
          soft: "hsl(var(--amber-soft))",
          "soft-foreground": "hsl(var(--amber-soft-foreground))",
          border: "hsl(var(--amber-border))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          hover: "hsl(var(--card-hover))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
        },
        "border-strong": "hsl(var(--border-strong))",
        surface: {
          elevated: "hsl(var(--surface-elevated))",
          glass: "hsl(var(--surface-glass))",
        },
        "text-secondary": "hsl(var(--text-secondary))",
        "text-tertiary": "hsl(var(--text-tertiary))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        full: "999px",
      },
      boxShadow: {
        none: "none",
        sm: "0 1px 2px rgba(14,26,26,0.04), 0 1px 3px rgba(14,26,26,0.04)",
        md: "0 4px 12px -2px rgba(14,26,26,0.06), 0 2px 4px -2px rgba(14,26,26,0.04)",
        card: "none",
        "card-hover": "0 4px 12px -2px rgba(14,26,26,0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "section-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "section-in": "section-in 0.4s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
