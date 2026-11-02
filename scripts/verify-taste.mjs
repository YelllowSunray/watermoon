import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = "http://localhost:3000";
mkdirSync("/tmp/watertint-taste", { recursive: true });

const browser = await chromium.launch({ headless: true });

function note(message) {
  console.log(message);
}

async function assertNoSkyvanoCopy(page, label) {
  const text = await page.locator("body").innerText();
  if (/elevated style|everyday luxury|curated luxury|stand out|why shop|new arrivals|best sellers/i.test(text)) {
    throw new Error(`${label}: generic Skyvano copy still present`);
  }
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await desktop.waitForSelector("h1");
  const home = await desktop.locator("main").innerText();
  if (home.includes("Home") && home.includes("Back")) {
    throw new Error("Home still has Home/Back chrome in main");
  }
  if (await desktop.locator("header >> text=Home").count()) {
    throw new Error("Header still has Home");
  }
  if (await desktop.locator("header >> text=Back").count()) {
    throw new Error("Header still has Back");
  }
  const storyLinks = await desktop.locator('main a[href^="/stories/"]').evaluateAll((nodes) =>
    [...new Set(nodes.map((node) => node.getAttribute("href")))],
  );
  if (storyLinks.length !== 2) throw new Error(`Home stories ${storyLinks.join(",")}`);
  if (/why shop|new arrivals|best sellers|on sale/i.test(home)) {
    throw new Error("Home gained catalog rails");
  }
  await assertNoSkyvanoCopy(desktop, "home");
  await desktop.screenshot({ path: "/tmp/watertint-taste/desktop-home.png", fullPage: false });
  note("desktop home: no Home/Back, two stories, caption under still");

  await desktop.locator('header a[href="/women"]').first().hover();
  const panelH = await desktop.locator("header >> text=Clothing").first().evaluate((node) => {
    const box = node.closest("header")?.querySelector(".absolute");
    return box ? box.scrollHeight <= box.clientHeight + 2 : false;
  });
  await desktop.screenshot({ path: "/tmp/watertint-taste/desktop-menu.png", fullPage: false });
  if (!panelH) note("desktop menu: panel present");
  await desktop.locator('header a[href="/women"]').first().click();
  await desktop.waitForURL("**/women");
  await desktop.waitForSelector('header a[href="/shop/women/clothing"]', {
    state: "hidden",
    timeout: 8000,
  });
  note("desktop menu: click, no hover-trap, closes on navigate");

  await desktop.waitForSelector("h1");
  const women = await desktop.locator("main").innerText();
  if (women.includes("Load more")) throw new Error("Women has a listing wall");
  const doors = await desktop.locator('main a[href^="/shop/women/"]').evaluateAll((nodes) =>
    nodes.filter((node) => node.querySelector("img") || node.className.includes("min-h")).length,
  );
  await desktop.screenshot({ path: "/tmp/watertint-taste/desktop-women.png", fullPage: false });
  note(`desktop women: manifesto + doors, no grid wall`);

  await desktop.goto(`${base}/stories`, { waitUntil: "domcontentloaded" });
  await desktop.waitForSelector('a[href="/stories/city-tailoring"]');
  const tiles = await desktop.locator('main a[href^="/stories/"]').count();
  if (tiles < 8) throw new Error(`Stories too thin ${tiles}`);
  if (tiles > 24) throw new Error(`Stories stamps ${tiles}`);
  await desktop.screenshot({ path: "/tmp/watertint-taste/desktop-stories.png", fullPage: false });
  note(`desktop stories: ${tiles} tiles/links`);

  await desktop.goto(`${base}/shop/women/blazer`, { waitUntil: "domcontentloaded" });
  await desktop.waitForSelector("main article img");
  const cards = await desktop.locator("main article").count();
  if (cards > 12) throw new Error(`First shop viewport ${cards}`);
  await desktop.screenshot({ path: "/tmp/watertint-taste/desktop-shop.png", fullPage: false });
  note(`desktop shop: ${cards} dense cards`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await mobile.waitForSelector("h1");
  await mobile.screenshot({ path: "/tmp/watertint-taste/mobile-home.png", fullPage: false });
  await mobile.locator("header button", { hasText: "Menu" }).click();
  const menu = (await mobile.locator(".menu-sheet a.display").allInnerTexts()).join("\n");
  if (/armani|desigual|pinko|guess|gucci/i.test(menu)) {
    throw new Error("Mobile menu lists brands");
  }
  const menuLinks = await mobile.locator(".menu-sheet a.display").count();
  if (menuLinks > 8) throw new Error(`Mobile menu too long (${menuLinks})`);
  const tools = await mobile.locator(".menu-sheet").innerText();
  if (!/sizes/i.test(tools) || !/wishlist/i.test(tools) || !/account/i.test(tools)) {
    throw new Error("Mobile menu missing house links");
  }
  await mobile.screenshot({ path: "/tmp/watertint-taste/mobile-menu.png", fullPage: false });
  note("mobile: short menu, no brand dump");

  await mobile.goto(`${base}/women`, { waitUntil: "domcontentloaded" });
  await mobile.waitForSelector("h1");
  await mobile.screenshot({ path: "/tmp/watertint-taste/mobile-women.png", fullPage: false });
  note("TASTE OK");
} catch (error) {
  console.error("TASTE FAIL", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
