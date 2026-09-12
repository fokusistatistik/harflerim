/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                cream: '#FFFDF0', // Updated background
                softIndigo: '#4F46E5', // Primary
                emerald: '#10B981', // Success
                beige: '#F5F5DC',
                pastelMint: '#98D8C8',
                lightPink: '#FFB6C1',
                darkBlueGray: '#2C3E50',
                skyBlue: '#87CEEB',
                // Papatya tasarım tokenleri — src/app/globals.css içindeki CSS
                // değişkenlerinden beslenir; açık/koyu mod otomatik geçer.
                papatya: {
                    cream: 'var(--papatya-cream)',
                    surface: 'var(--papatya-surface)',
                    ink: 'var(--papatya-ink)',
                    'ink-soft': 'var(--papatya-ink-soft)',
                    petal: 'var(--papatya-petal)',
                    'petal-deep': 'var(--papatya-petal-deep)',
                    leaf: 'var(--papatya-leaf)',
                    sky: 'var(--papatya-sky)',
                    rose: 'var(--papatya-rose)',
                    rule: 'var(--papatya-rule)',
                },
            },
            spacing: {
                'p1': 'var(--papatya-space-1)',
                'p2': 'var(--papatya-space-2)',
                'p3': 'var(--papatya-space-3)',
                'p4': 'var(--papatya-space-4)',
                'p5': 'var(--papatya-space-5)',
            },
            borderRadius: {
                'p-sm': 'var(--papatya-radius-sm)',
                'p-md': 'var(--papatya-radius-md)',
                'p-lg': 'var(--papatya-radius-lg)',
            },
            transitionDuration: {
                'p-fast': 'var(--papatya-duration-fast)',
                'p-base': 'var(--papatya-duration-base)',
                'p-slow': 'var(--papatya-duration-slow)',
            },
            fontFamily: {
                sans: ['var(--font-andika)', 'sans-serif'],
                hand: ['var(--font-patrick)', 'cursive'],
            },
            // Akışkan tipografi (Faz 1.7): telefon-tablet-PC arasında clamp()
            // ile sürekli ölçeklenir — md:/lg:/xl: basamak basamak yerine.
            fontSize: {
                'p-sm': 'var(--papatya-text-sm)',
                'p-base': 'var(--papatya-text-base)',
                'p-lg': 'var(--papatya-text-lg)',
                'p-xl': 'var(--papatya-text-xl)',
                'p-2xl': 'var(--papatya-text-2xl)',
                'p-3xl': 'var(--papatya-text-3xl)',
            },
            // Dokunma hedefi asgari boyutu (Faz 1.7 / GENEL-KURALLAR md.4).
            minWidth: {
                tap: 'var(--papatya-tap-min)',
            },
            minHeight: {
                tap: 'var(--papatya-tap-min)',
            },
        },
    },
    plugins: [],
}
