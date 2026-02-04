/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                dark: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#030712',
                },
            },
            backgroundImage: {
                'gradient-dark-1': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                'gradient-dark-2': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
                'gradient-dark-3': 'linear-gradient(135deg, #0c4a6e 0%, #082f49 50%, #0c4a6e 100%)',
                'gradient-neon-cyan': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                'gradient-neon-purple': 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                'gradient-neon-pink': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            },
            boxShadow: {
                'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.2)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.2)',
                'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.2)',
            },
            fontFamily: {
                sans: ['Poppins', 'Google Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
