import { NextResponse } from "next/server";
import { createShopifyCheckout, type CheckoutLine } from "@/lib/shopify/cart";

function requestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : undefined;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lines = (payload as { lines?: unknown } | null)?.lines;
  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }

  const parsed: CheckoutLine[] = [];
  for (const line of lines) {
    const { variantId, quantity } = (line ?? {}) as {
      variantId?: unknown;
      quantity?: unknown;
    };
    if (typeof variantId !== "string" || typeof quantity !== "number") {
      return NextResponse.json({ error: "Invalid bag contents." }, { status: 400 });
    }
    parsed.push({ variantId, quantity });
  }

  try {
    const result = await createShopifyCheckout(parsed, requestOrigin(request));

    if (result.ok) {
      return NextResponse.json({ checkoutUrl: result.checkoutUrl });
    }

    return NextResponse.json(
      result.reason === "unavailable"
        ? { error: result.message, variantIds: result.variantIds }
        : { error: result.message },
      { status: result.reason === "unavailable" ? 409 : 400 },
    );
  } catch (error) {
    console.error("Shopify checkout failed", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }
}
