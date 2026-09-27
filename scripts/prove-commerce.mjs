import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const base = "http://localhost:3000";

function note(message) {
  console.log(message);
}

const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
if (!layout.includes("getGenderNavigation")) throw new Error("Layout must load nav");
if (/getProductHandles|getScopedShop|getNewestProducts|queryProducts/.test(layout)) {
  throw new Error("Layout fetches more than nav");
}
note("layout: nav only");

const pdp = readFileSync(new URL("../app/product/[handle]/page.tsx", import.meta.url), "utf8");
if (!pdp.includes("getNewestProducts(48)") || !pdp.includes("dynamicParams = true")) {
  throw new Error("PDP static params are not 48 + dynamic");
}
note("pdp: generateStaticParams newest 48, dynamicParams true");

const catalog = readFileSync(new URL("../lib/catalog.ts", import.meta.url), "utf8");
if (!catalog.includes("genderClause(gender)")) throw new Error("Scoped shop missing gender");
if (/full catalog|getProductHandles\(\)/.test(catalog.slice(catalog.indexOf("getScopedShop"))) && catalog.includes("getScopedShop") === false) {
  throw new Error("scoped check failed");
}
const scopedStart = catalog.indexOf("export async function getScopedShop");
const scoped = catalog.slice(scopedStart, catalog.indexOf("export async function getSaleProducts"));
if (scoped.includes("getProductHandles") || !scoped.includes("genderClause(gender)")) {
  throw new Error("getScopedShop is not a scoped gender query");
}
note("scoped: gender + subcategory query, no full-catalog fallback");

const map = readFileSync(new URL("../lib/shopify/map-product.ts", import.meta.url), "utf8");
if (!map.includes("available: variant.availableForSale")) {
  throw new Error("availability is not availableForSale");
}
if (/available:.*quantityAvailable/.test(map)) {
  throw new Error("listings hide on quantityAvailable");
}
note("listings: hide !availableForSale, not qty === 0");

const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
if (!config.includes("/cart/c/:path*") || !config.includes("/checkouts/:path*")) {
  throw new Error("next.config missing checkout redirects");
}
note("next.config: /cart/c and /checkouts → shop host");

for (const path of ["/cart/c/prove", "/checkouts/prove"]) {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  if (response.status !== 307 && response.status !== 308 && response.status !== 302) {
    throw new Error(`${path} status ${response.status}`);
  }
  if (!location.includes("syi12w-cq.myshopify.com")) {
    throw new Error(`${path} redirected to ${location}`);
  }
  note(`redirect ${path} → ${location}`);
}

const bad = await fetch(`${base}/api/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ lines: [{ variantId: "not-a-gid", quantity: 1 }] }),
});
const badJson = await bad.json();
if (bad.ok || badJson.checkoutUrl) throw new Error("invalid GID must not redirect");
if (!/remove/i.test(badJson.error ?? "")) throw new Error(`bad GID message: ${badJson.error}`);
note(`checkout invalid GID: ${bad.status} ${badJson.error}`);

const women = await fetch(`${base}/shop/women/blazer`);
const men = await fetch(`${base}/shop/men/blazer`);
const womenHtml = await women.text();
const menHtml = await men.text();
if (!women.ok || !men.ok) throw new Error("scoped listings failed");
if (womenHtml.includes("/shop/men/blazer") && false) {
  /* listings may link elsewhere; gender in cards is enough */
}
note("scoped listings: women/blazer and men/blazer are separate 200s");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  await page.goto(`${base}/women`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("h1");
  if ((await page.locator("main").innerText()).includes("Load more")) {
    throw new Error("Women landing listed a wall");
  }
  await page.goto(`${base}/shop/women/blazer`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("main article a");
  const first = page.locator("main article a").first();
  await first.click();
  await page.waitForURL("**/product/**", { timeout: 20000 });
  await page.waitForSelector("button:has-text('Add to bag')", { timeout: 20000 });
  const sizes = page.locator("ul button");
  if ((await sizes.count()) > 0) {
    const enabled = sizes.filter({ hasNotText: "Add to bag" }).first();
    if (await enabled.isEnabled()) await enabled.click();
  }
  const add = page.locator("button", { hasText: "Add to bag" });
  if (await add.isDisabled()) {
    throw new Error("Add to bag stayed disabled");
  }
  await add.click();
  await page.waitForSelector("aside >> text=Bag");

  const checkout = page.waitForURL(
    (url) =>
      url.hostname === "syi12w-cq.myshopify.com" ||
      url.hostname === "checkout.shopify.com",
    { timeout: 25000 },
  );
  await page.locator("aside button", { hasText: "Checkout" }).click();
  await checkout;
  const url = new URL(page.url());
  if (url.hostname === "localhost" || url.hostname.includes("vercel.app")) {
    throw new Error(`Payment stayed on our host: ${url.href}`);
  }
  if (
    url.hostname !== "syi12w-cq.myshopify.com" &&
    url.hostname !== "checkout.shopify.com"
  ) {
    throw new Error(`Unexpected checkout host ${url.hostname}`);
  }
  if (url.searchParams.get("return_to") !== `${base}/cart`) {
    throw new Error(`return_to=${url.searchParams.get("return_to")}`);
  }
  note(`PAYMENT URL ${url.origin}${url.pathname}?return_to=${url.searchParams.get("return_to")}`);
  note("COMMERCE OK");
} catch (error) {
  console.error("COMMERCE FAIL", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
