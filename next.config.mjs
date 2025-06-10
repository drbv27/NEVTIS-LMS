/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fvsyjjbxqmxcesqfdlbp.supabase.co", // Tu hostname de Supabase
        port: "",
        pathname: "/storage/v1/object/public/**", // Permite cualquier imagen de tus buckets públicos
      },
    ],
  },
};

export default nextConfig;
