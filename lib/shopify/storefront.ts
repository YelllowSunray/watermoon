import "server-only";

import {
  getShopifyConfig,
  shopifyStorefrontGraphqlUrl,
  type ShopifyConfig,
} from "@/lib/shopify/config";

export class ShopifyStorefrontError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ShopifyStorefrontError";
  }
}

export type StorefrontFetchOptions = {
  revalidate?: number;
  tags?: string[];
  config?: ShopifyConfig;
};

export async function shopifyStorefrontGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: StorefrontFetchOptions = {},
): Promise<T> {
  const { config = getShopifyConfig() } = options;

  if (!config.storeDomain) {
    throw new ShopifyStorefrontError(
      "Shopify Storefront API is not configured. Set SHOPIFY_STORE_DOMAIN.",
    );
  }

  if (!config.storefrontPrivateToken && !config.storefrontToken) {
    throw new ShopifyStorefrontError(
      "Set SHOPIFY_STOREFRONT_PRIVATE_TOKEN or SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.storefrontPrivateToken) {
    headers["Shopify-Storefront-Private-Token"] = config.storefrontPrivateToken;
  } else {
    headers["X-Shopify-Storefront-Access-Token"] = config.storefrontToken;
  }

  const cached = options.revalidate != null;
  const request = {
    method: "POST" as const,
    headers,
    body: JSON.stringify({ query, variables }),
    ...(cached
      ? { next: { revalidate: options.revalidate, tags: options.tags } }
      : { cache: "no-store" as const }),
  };

  let response = await fetch(shopifyStorefrontGraphqlUrl(config), request);
  if (response.status === 503) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    response = await fetch(shopifyStorefrontGraphqlUrl(config), request);
  }

  if (!response.ok) {
    throw new ShopifyStorefrontError(
      `Shopify Storefront API HTTP ${response.status}`,
      response.status,
    );
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: Array<{
      message: string;
      extensions?: { code?: string; requiredAccess?: string };
    }>;
  };

  const blocking = json.errors?.filter((error) => !isInventoryScopeError(error));
  if (blocking?.length) {
    throw new ShopifyStorefrontError(
      blocking.map((error) => error.message).join("; "),
    );
  }

  if (!json.data) {
    throw new ShopifyStorefrontError("Shopify Storefront API returned no data");
  }

  return json.data;
}

function isInventoryScopeError(error: {
  message: string;
  extensions?: { code?: string; requiredAccess?: string };
}) {
  if (error.extensions?.code !== "ACCESS_DENIED") return false;
  return /quantityAvailable|totalInventory|product_inventory/i.test(
    `${error.message} ${error.extensions.requiredAccess ?? ""}`,
  );
}
