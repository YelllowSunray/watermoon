type LoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function shopifyImageLoader({ src, width, quality }: LoaderProps) {
  if (src.startsWith("/") || src.startsWith("data:")) return src;

  try {
    const url = new URL(src);
    const host = url.hostname;
    if (host === "cdn.shopify.com" || host.endsWith(".shopify.com")) {
      url.searchParams.set("width", String(Math.min(Math.max(width, 1), 1600)));
      url.searchParams.set("format", "webp");
      if (quality) url.searchParams.set("quality", String(quality));
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}
