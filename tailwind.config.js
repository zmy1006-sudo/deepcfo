/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#00696f',
					light: '#00f2ff',
					dark: '#004d52',
					foreground: 'hsl(var(--primary-foreground))',
				},
				accent: {
					DEFAULT: '#00f2ff',
					foreground: 'hsl(var(--accent-foreground))',
				},
				secondary: {
					DEFAULT: '#4A90E2',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// Sprint 8: 科技青绿色系
				brand: '#00f2ff',
				success: '#006947',
				'success-light': '#D1FAE5',
				warning: '#705d00',
				'warning-light': '#ffe173',
				danger: '#ba1a1a',
				'danger-light': '#fee2e2',
				// 背景色系
				surface: '#f7f9fb',
				'surface-container': '#eceef0',
				'surface-container-low': '#f2f4f6',
				'surface-container-lowest': '#ffffff',
				'surface-dim': '#d8dadc',
				// 文字色系
				'on-surface': '#191c1e',
				'on-surface-variant': '#3a494b',
				// 边框
				'outline-variant': '#b9cacb',
				// 兼容旧色（保留但不推荐使用）
				page: '#f7f9fb',
				'text-p': '#191c1e',
				'text-s': '#3a494b',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'float-bounce': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.08)' },
				},
				'slide-up': {
					from: { transform: 'translateY(100%)', opacity: 0 },
					to: { transform: 'translateY(0)', opacity: 1 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float-bounce': 'float-bounce 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.3s ease-out',
			},
			fontFamily: {
				sans: ['Noto Sans SC', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
				serif: ['Noto Serif SC', 'Songti SC', 'SimSun', 'Georgia', 'serif'],
				'display': ['Space Grotesk', 'Inter', 'sans-serif'],
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
