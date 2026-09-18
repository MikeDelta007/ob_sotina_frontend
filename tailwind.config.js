/** @type {import('tailwindcss').Config} */
module.exports = {
  // Préfixe "tw-" et preflight désactivé : évite tout conflit avec les classes
  // utilitaires de PrimeFlex (flex, grid, p-2, m-2, text-center...) déjà utilisées
  // partout dans l'application, et avec les styles de base de PrimeReact.
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './layout/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
