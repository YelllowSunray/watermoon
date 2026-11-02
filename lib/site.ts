/**
 * Shop + legal facts. Canonical host is env or the current deploy — never a guessed brand domain.
 */

function read(name: string) {
  return process.env[name]?.trim() ?? "";
}

function isLocalHost(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function resolveSiteUrl() {
  const explicit = read("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  const vercelHost = (read("VERCEL_PROJECT_PRODUCTION_URL") || read("VERCEL_URL"))
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const onVercel = read("VERCEL") === "1" || Boolean(vercelHost);

  if (explicit && !(onVercel && isLocalHost(explicit))) {
    return explicit;
  }
  if (vercelHost) {
    return `https://${vercelHost}`;
  }
  return explicit || "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Watertint";

/** Numeric shop GID. From a CDN path `s/files/1/a/b/c` → abc, or Admin `shop { id }`. */
export const SHOPIFY_STORE_ID =
  read("SHOPIFY_STORE_ID") || read("NEXT_PUBLIC_SHOPIFY_STORE_ID");

export const SHOPIFY_STORE_DOMAIN =
  read("SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, "") ||
  "ii0hwa-eh.myshopify.com";

export const SHOPIFY_ACCOUNT_URL = SHOPIFY_STORE_ID
  ? `https://shopify.com/${SHOPIFY_STORE_ID}/account`
  : `https://${SHOPIFY_STORE_DOMAIN}/account`;

/** Live catalog prices are EUR. */
export const CURRENCY = "EUR";

export const STORE_COUNTRY = (read("SHOPIFY_STORE_COUNTRY") || "NL").toUpperCase();

export const SHOPIFY_API_VERSION = read("SHOPIFY_API_VERSION") || "2026-07";

/** Legal entity behind the shop — Dutch imprint. */
export const COMPANY = {
  legalName: "SamirDev",
  brandName: SITE_NAME,
  streetAddress: "Wilhelminastraat 44",
  postalCode: "1211 GM",
  addressLocality: "Hilversum",
  addressCountry: "NL",
  addressCountryName: "The Netherlands",
  kvk: "99510723",
  vatId: "NL005390534B11",
  email: "info@watertint.com",
  phone: "+31626657125",
  phoneDisplay: "+31 6 26657125",
} as const;

/** Matches the fulfilment 14-day window, counted from delivery. */
export const RETURNS_DAYS = 14;

/** Tracked couriers only — regular post is refused. */
export const SHIP_CARRIERS = "UPS, FedEx, or DHL";

export const SHIPPING = {
  dispatch: "24–48 hours",
  economyEurope: "3–5 business days",
  economyWorld: "5–8 business days",
  expressEurope: "1–3 business days",
  expressWorld: "3–4 business days",
  carriers: SHIP_CARRIERS,
} as const;

export const SHIPS_LINE = `Ships worldwide. Returns within ${RETURNS_DAYS} days.`;

export const CONTACT_TO = read("CONTACT_TO") || COMPANY.email;

export const RESEND_FROM =
  read("RESEND_FROM") || `${SITE_NAME} <${COMPANY.email}>`;

/**
 * Hero is a real catalog still — no film or poster files in /public.
 * Image is loaded from this handle at request time.
 */
export const HERO_STILL_HANDLE = "2476302-blauer-women-blazer";

export function companyAddressLines() {
  return [
    COMPANY.streetAddress,
    `${COMPANY.postalCode} ${COMPANY.addressLocality}`,
    COMPANY.addressCountryName,
  ];
}
