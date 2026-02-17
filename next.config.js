/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    experimental: {
        turbo: {}
    },
    server: {
        port: 3000,                // Port d’écoute
        host: '0.0.0.0',           // Écoute sur toutes les interfaces réseau (important pour un reverse proxy)
    },
};

module.exports = nextConfig;