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

export const SITE_NAME = "Watermoon";

/** Confirmed from this shop's Storefront CDN path and hosted accounts. */
export const SHOPIFY_STORE_ID =
  read("SHOPIFY_STORE_ID") || read("NEXT_PUBLIC_SHOPIFY_STORE_ID") || "108213731669";

export const SHOPIFY_STORE_DOMAIN =
  read("SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, "") ||
  "syi12w-cq.myshopify.com";

export const SHOPIFY_ACCOUNT_URL = `https://shopify.com/${SHOPIFY_STORE_ID}/account`;

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
  email: "samir@samirdev.com",
  phone: "+31687343078",
  phoneDisplay: "+31 687343078",
} as const;

/** Dutch distance-selling withdrawal period. */
export const RETURNS_DAYS = 14;

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
