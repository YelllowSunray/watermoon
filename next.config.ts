import type { NextConfig } from "next";

const shopifyStore =
  process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    "",
  ) || "ii0hwa-eh.myshopify.com";

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    loader: "custom",
    loaderFile: "./lib/shopify-image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/cart/c/:path*",
        destination: `https://${shopifyStore}/cart/c/:path*`,
        permanent: false,
      },
      {
        source: "/checkouts/:path*",
        destination: `https://${shopifyStore}/checkouts/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
