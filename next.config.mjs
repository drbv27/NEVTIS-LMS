/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        /* hostname: "fvsyjjbxqmxcesqfdlbp.supabase.co", */
        hostname: "mvncncvfiuhjeocgmbng.supabase.co", // Tu hostname de Supabase
        port: "",
        pathname: "/storage/v1/object/public/**", // Permite cualquier imagen de tus buckets públicos
      },
      {
        protocol: "https",
        /* hostname: "fvsyjjbxqmxcesqfdlbp.supabase.co", */
        hostname: "placehold.co", // Tu hostname de Supabase
        port: "",
        pathname: "/", // Permite cualquier imagen de tus buckets públicos
      },
    ],
  },
};

export default nextConfig;
