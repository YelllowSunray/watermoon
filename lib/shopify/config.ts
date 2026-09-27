import "server-only";

import {
  SHOPIFY_API_VERSION,
  SHOPIFY_STORE_DOMAIN,
  STORE_COUNTRY,
} from "@/lib/site";

function read(name: string) {
  return process.env[name]?.trim() ?? "";
}

export type ShopifyConfig = {
  storeDomain: string;
  apiVersion: string;
  adminToken: string;
  storefrontToken: string;
  storefrontPrivateToken: string;
  country: string;
};

export function getShopifyConfig(): ShopifyConfig {
  const storeDomain = read("SHOPIFY_STORE_DOMAIN")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return {
    storeDomain: storeDomain || SHOPIFY_STORE_DOMAIN,
    apiVersion: read("SHOPIFY_API_VERSION") || SHOPIFY_API_VERSION,
    adminToken: read("SHOPIFY_ADMIN_ACCESS_TOKEN"),
    storefrontToken: read("SHOPIFY_STOREFRONT_ACCESS_TOKEN"),
    storefrontPrivateToken: read("SHOPIFY_STOREFRONT_PRIVATE_TOKEN"),
    country: (read("SHOPIFY_STORE_COUNTRY") || STORE_COUNTRY).toUpperCase(),
  };
}

export function shopifyMissingKeys(config: ShopifyConfig = getShopifyConfig()) {
  const missing: string[] = [];
  if (!config.storeDomain) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!config.storefrontToken && !config.storefrontPrivateToken) {
    missing.push(
      "SHOPIFY_STOREFRONT_PRIVATE_TOKEN or SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    );
  }
  return missing;
}

export function isShopifyReady() {
  return shopifyMissingKeys().length === 0;
}

export function shopifyStorefrontGraphqlUrl(
  config: ShopifyConfig = getShopifyConfig(),
) {
  return `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`;
}
