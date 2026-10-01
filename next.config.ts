import type { NextConfig } from "next";

// Images uploaded by staff live in the public Supabase Storage bucket "site-images".
const supabaseUrl = process.env.SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(supabaseUrl).hostname,
            pathname: "/storage/v1/object/public/site-images/**",
          },
        ]
      : [],
  },
  experimental: {
    // Image uploads from the staff editors (images are limited to 5 MB).
    serverActions: { bodySizeLimit: "6mb" },
  },
  poweredByHeader: false,
};

export default nextConfig;
