import { chromium } from "playwright";

const base = "http://localhost:3000";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const log = [];

function note(message) {
  log.push(message);
  console.log(message);
}

try {
  await page.goto(`${base}/women`, { waitUntil: "networkidle", timeout: 30000 });
  const womenText = await page.locator("main").innerText();
  if (!womenText.includes("Cloth first")) throw new Error("Women manifesto missing");
  if (!womenText.includes("Clothing") || !womenText.includes("Shoes")) {
    throw new Error("Department doors missing");
  }
  if (!womenText.toLowerCase().includes("blazer")) throw new Error("Women missing subcategories");
  const pieces = await page.locator("main article").count();
  if (pieces < 4) throw new Error(`Expected items under rooms, got ${pieces}`);
  note(`women: editorial landing, rooms, ${pieces} pieces`);

  await page.locator('a[href="/shop/women/blazer"]').first().click();
  await page.waitForURL("**/shop/women/blazer", { timeout: 20000 });
  await page.waitForSelector("main article");
  const cards = await page.locator("main article").count();
  const loadMore = await page.locator("button", { hasText: "Load more" }).count();
  if (cards !== 12) throw new Error(`First viewport should be 12 cards, got ${cards}`);
  if (!loadMore) throw new Error("Load more missing on subcategory");
  const lookLinks = await page.locator('main a[href^="/looks/"]').count();
  if (!lookLinks) throw new Error("Shop listing missing looks");
  if (!(await page.locator("main").innerText()).toLowerCase().includes("shop this look")) {
    throw new Error("Shop listing missing Shop this look");
  }
  note(`shop/women/blazer: ${cards} cards, Load more, ${lookLinks} looks`);

  const firstCard = page.locator("main article a").first();
  const href = await firstCard.getAttribute("href");
  await firstCard.click();
  await page.waitForURL("**/product/**", { timeout: 20000 });
  await page.waitForSelector("h1");
  await page.waitForSelector("button:has-text('Add to bag')", { timeout: 20000 });
  await page.waitForSelector("text=Shop the look", { timeout: 25000 });
  await page.waitForSelector("text=Similar", { timeout: 10000 });
  const heart = await page.locator('button[aria-label*="wishlist" i]').count();
  if (!heart) throw new Error("Wishlist heart missing");
  note(`pdp ${href}: gallery/buy, look/similar, heart`);

  const size = page.locator("button", { hasText: /^[A-Z0-9].*$/ }).filter({
    hasNotText: "Add to bag",
  });
  const sizeButtons = page.locator("ul button").filter({ hasNotText: "Add to bag" });
  if ((await sizeButtons.count()) > 0) {
    const enabled = sizeButtons.first();
    await enabled.click();
  }
  await page.locator("button", { hasText: "Add to bag" }).first().click();
  await page.waitForSelector("aside >> text=Bag");
  note("bag drawer opened");

  const arrived = page.waitForURL(
    (url) =>
      url.hostname === "syi12w-cq.myshopify.com" ||
      url.hostname.includes("checkout.shopify.com"),
    { timeout: 25000 },
  );
  await page.locator("aside button", { hasText: "Checkout" }).click();
  await arrived;
  const url = new URL(page.url());
  if (url.hostname !== "syi12w-cq.myshopify.com") {
    throw new Error(`Checkout host was ${url.hostname}`);
  }
  if (url.searchParams.get("return_to") !== `${base}/cart`) {
    throw new Error(`return_to was ${url.searchParams.get("return_to")}`);
  }
  note(`checkout host=${url.hostname} return_to=${url.searchParams.get("return_to")}`);
  note("PATH OK");
} catch (error) {
  console.error("PATH FAIL", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
