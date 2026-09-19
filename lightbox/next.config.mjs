/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mtzy2.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.mtzy2.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
