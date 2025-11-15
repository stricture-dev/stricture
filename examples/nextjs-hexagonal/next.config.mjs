/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better error detection
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Output standalone for better production deployments
  output: 'standalone',
}

export default nextConfig
