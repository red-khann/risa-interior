module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    // Deleted the ./apps/web and ./pages lines as they are no longer needed
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
      },
      // You can add your luxury brand colors here later if needed (e.g., #B89B5E)
    },
  },
  plugins: [],
};