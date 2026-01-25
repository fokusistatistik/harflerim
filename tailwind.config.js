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
            },
            fontFamily: {
                sans: ['var(--font-andika)', 'sans-serif'],
                hand: ['var(--font-patrick)', 'cursive'],
            },
        },
    },
    plugins: [],
}
