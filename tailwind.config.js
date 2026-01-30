module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
      },
      // 🎯 Official RISA Color Palette
      colors: {
        risa: {
          green: {
            DEFAULT: '#134E15', // Signature RISA Green
            light: '#019106',   // Light Green accent
            dark: '#053306',    // Dark Green accent
          },
          black: '#0B0B0B',     // Rich Black
          grey: '#E6E6E6',      // Warm Light Grey
        },
      },
    },
  },
  plugins: [],
};