import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const shopifyStore =
  process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    "",
  ) || "syi12w-cq.myshopify.com";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/cart/c/") || pathname.startsWith("/checkouts/")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = shopifyStore;
    url.port = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart/c/:path*", "/checkouts/:path*"],
};
