/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/speed-code/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0052FF",
                "background-light": "#fcfcfd",
                "background-dark": "#0f1115",
                "card-light": "#ffffff",
                "card-dark": "#16191f",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "8px",
            },
        },
    },
    plugins: [],
}
