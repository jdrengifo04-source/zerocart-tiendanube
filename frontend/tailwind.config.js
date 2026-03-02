/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'zerocart-primary': '#00bfa5', // Color temático sugerido
            }
        },
    },
    plugins: [],
}
