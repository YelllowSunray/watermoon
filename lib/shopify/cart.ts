import "server-only";

import { SHOPIFY_STORE_DOMAIN } from "@/lib/site";
import { getShopifyConfig } from "@/lib/shopify/config";
import { CART_CREATE_MUTATION } from "@/lib/shopify/queries";
import {
  ShopifyStorefrontError,
  shopifyStorefrontGraphql,
} from "@/lib/shopify/storefront";

export type CheckoutLine = {
  variantId: string;
  quantity: number;
};

export type CheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; reason: "invalid"; message: string }
  | { ok: false; reason: "unavailable"; message: string; variantIds: string[] };

const VARIANT_GID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const MAX_QUANTITY_PER_LINE = 50;

type CartCreateResponse = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
      totalQuantity: number;
      lines: {
        nodes: Array<{
          quantity: number;
          merchandise: { id?: string };
        }>;
      };
    } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

export async function createShopifyCheckout(
  lines: CheckoutLine[],
  returnOrigin?: string,
): Promise<CheckoutResult> {
  const requested = new Map<string, number>();

  for (const line of lines) {
    if (!VARIANT_GID.test(line.variantId)) {
      return {
        ok: false,
        reason: "invalid",
        message: "Remove that line and add the piece again.",
      };
    }
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > MAX_QUANTITY_PER_LINE
    ) {
      return { ok: false, reason: "invalid", message: "Invalid quantity." };
    }
    requested.set(
      line.variantId,
      (requested.get(line.variantId) ?? 0) + line.quantity,
    );
  }

  if (requested.size === 0) {
    return { ok: false, reason: "invalid", message: "Your bag is empty." };
  }

  const country = getShopifyConfig().country;
  const data = await cartCreate({
    lines: [...requested].map(([merchandiseId, quantity]) => ({
      merchandiseId,
      quantity,
    })),
    buyerIdentity: country ? { countryCode: country } : undefined,
  });

  const { cart, userErrors } = data.cartCreate;

  if (userErrors.length > 0) {
    return { ok: false, reason: "invalid", message: userErrors[0].message };
  }
  if (!cart) {
    return {
      ok: false,
      reason: "invalid",
      message: "Shopify did not return a bag.",
    };
  }

  const accepted = new Map<string, number>();
  for (const node of cart.lines.nodes) {
    const id = node.merchandise?.id;
    if (id) accepted.set(id, (accepted.get(id) ?? 0) + node.quantity);
  }

  const short = [...requested].filter(
    ([variantId, quantity]) => (accepted.get(variantId) ?? 0) < quantity,
  );

  if (short.length > 0) {
    return {
      ok: false,
      reason: "unavailable",
      message:
        "These pieces could not be reserved. Stock may sit at a warehouse that does not fulfil web orders, or shipping does not cover this address.",
      variantIds: short.map(([variantId]) => variantId),
    };
  }

  return {
    ok: true,
    checkoutUrl: hostedCheckoutUrl(cart.checkoutUrl, returnOrigin),
  };
}

function isThrottled(error: unknown) {
  return (
    error instanceof ShopifyStorefrontError && /throttled/i.test(error.message)
  );
}

async function cartCreate(input: {
  lines: Array<{ merchandiseId: string; quantity: number }>;
  buyerIdentity?: { countryCode: string };
}) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await shopifyStorefrontGraphql<CartCreateResponse>(
        CART_CREATE_MUTATION,
        { input },
      );
    } catch (error) {
      lastError = error;
      if (!isThrottled(error) || attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
    }
  }
  throw lastError;
}

function hostedCheckoutUrl(checkoutUrl: string, origin?: string) {
  try {
    const url = new URL(checkoutUrl);
    const store = getShopifyConfig().storeDomain || SHOPIFY_STORE_DOMAIN;
    if (url.hostname !== "checkout.shopify.com" && store) {
      url.protocol = "https:";
      url.hostname = store;
      url.port = "";
    }
    if (origin) url.searchParams.set("return_to", `${origin}/cart`);
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}
