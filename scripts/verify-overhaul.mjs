import { chromium } from "playwright";

const base = "http://localhost:3000";
const browser = await chromium.launch({ headless: true });
const log = [];

function note(message) {
  log.push(message);
  console.log(message);
}

function must(text, needle, label) {
  if (!text.includes(needle)) throw new Error(`${label}: missing ${needle}`);
}

function mustNot(text, needle, label) {
  if (text.includes(needle)) throw new Error(`${label}: still has ${needle}`);
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await desktop.waitForSelector("text=Shop the look. Not the dump.", { timeout: 20000 });
  const home = await desktop.locator("main").innerText();
  must(home, "Shop the look", "home");
  must(home, "The edit", "home");
  must(home, "Looks", "home");
  must(home, "01", "home");
  if (!home.toLowerCase().includes("brands")) throw new Error("home: missing Brands");
  if (!home.toLowerCase().includes("the doors")) throw new Error("home: missing The doors");
  if (!home.toLowerCase().includes("shop this look")) throw new Error("home: missing Shop this look");
  mustNot(home, "City tailoring", "home");
  mustNot(home, "Italian leather", "home");
  const paper = await desktop.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (paper !== "rgb(255, 255, 255)") throw new Error(`body is still ${paper}, not white`);
  mustNot(home, "Best sellers", "home");
  mustNot(home, "Bestsellers", "home");
  mustNot(home, "Why shop", "home");
  note("home: magazine hero, no Skyvano stack");

  const nav = await desktop.locator("header nav").innerText();
  for (const item of ["WOMEN", "MEN", "LOOKS", "THE EDIT", "BRANDS", "SALE"]) {
    must(nav, item, "nav");
  }
  await desktop.locator('header a[href="/looks"]').first().hover();
  await desktop.waitForSelector('header a[href^="/looks/"]');
  const lookLinks = await desktop.locator('header a[href^="/looks/"]').count();
  if (lookLinks < 8) throw new Error(`Looks panel only listed ${lookLinks}`);
  const lookWomen = await desktop.locator("header .mega").getByText("Women", { exact: true }).count();
  const lookMen = await desktop.locator("header .mega").getByText("Men", { exact: true }).count();
  if (!lookWomen || !lookMen) throw new Error("Looks panel missing a world");
  await desktop.locator('header a[href="/stories"]').first().hover();
  const storyLinks = await desktop.locator('header a[href^="/stories/"]').count();
  if (storyLinks < 8) throw new Error(`Edit panel only listed ${storyLinks}`);
  await desktop.locator('header a[href="/women"]').first().hover();
  await desktop.waitForSelector('header a[href="/shop/women/clothing"]');
  note(`nav: fleshed panels, ${lookLinks} looks, ${storyLinks} stories`);

  await desktop.goto(`${base}/looks`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await desktop.waitForSelector("text=The outfit. Then the pieces.", { timeout: 20000 });
  const looks = await desktop.locator("main").innerText();
  must(looks, "The outfit. Then the pieces.", "looks");
  must(looks, "The desk jacket", "looks");
  note("looks index: manifesto + tiles");

  await desktop.goto(`${base}/looks/desk-jacket`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await desktop.waitForSelector("text=The desk jacket");
  const cards = await desktop.locator("main article").count();
  if (cards < 2) throw new Error(`desk-jacket only ${cards} pieces`);
  const lookText = await desktop.locator("main").innerText();
  if (!lookText.includes("01")) throw new Error("look kit missing 01");
  note(`look desk-jacket: ${cards} shoppable pieces, numbered kit`);

  await desktop.goto(`${base}/women`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await desktop.waitForSelector("text=Cloth first", { timeout: 20000 });
  const women = await desktop.locator("main").innerText();
  must(women, "Cloth first", "women");
  if (!women.toLowerCase().includes("shop the look")) throw new Error("women: missing Shop the look");
  note("women: color manifesto + looks");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await mobile.waitForSelector("text=Shop the look. Not the dump.", { timeout: 20000 });
  await mobile.locator("header button", { hasText: /^Menu$/i }).click();
  await mobile.locator('header a[href="/women"]').locator("visible=true").first().waitFor();
  const menu = await mobile.locator("header").innerText();
  for (const item of ["Women", "Men", "Looks", "The edit", "Brands", "Sale"]) {
    if (!menu.toLowerCase().includes(item.toLowerCase())) {
      throw new Error(`mobile: missing ${item}`);
    }
  }
  note("mobile: six display links");

  note("OVERHAUL OK");
} catch (error) {
  console.error("OVERHAUL FAIL", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
