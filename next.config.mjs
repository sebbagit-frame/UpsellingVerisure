/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Sin caché del router en el cliente: cada navegación trae datos frescos.
    // El sitio se administra desde /admin y los operadores deben ver los
    // cambios al instante, sin recargar la página a mano.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
