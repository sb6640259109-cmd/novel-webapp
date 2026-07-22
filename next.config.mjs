/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["172.21.30.46"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
