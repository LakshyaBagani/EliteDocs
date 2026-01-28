/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0f172a',
                'bg-secondary': '#1e293b',
                'bg-tertiary': '#334155',
                'bg-card': '#1e293b',
                'primary': '#3b82f6',
                'primary-hover': '#2563eb',
                'secondary': '#8b5cf6',
                'success': '#10b981',
                'warning': '#f59e0b',
                'error': '#ef4444',
                'text-primary': '#f8fafc',
                'text-secondary': '#94a3b8',
                'text-muted': '#64748b',
                'border': '#334155',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
