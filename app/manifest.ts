import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Looks, cloth, leather. Edited in Hilversum.",
    start_url: "/",
    display: "browser",
    background_color: "#0a0a0a",
    theme_color: "#ffffff",
    icons: [
      { src: "/favicon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/apple-touch-icon.png", type: "image/png", sizes: "180x180", purpose: "any" },
    ],
  };
}
