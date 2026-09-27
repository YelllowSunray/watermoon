import { chromium } from "playwright";

const base = "http://localhost:3000";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

function note(message) {
  console.log(message);
}

try {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("h1");
  const home = await page.locator("main").innerText();
  if (/best.?sellers|on sale|new arrivals/i.test(home)) {
    throw new Error("Home has a catalog rail stack");
  }
  const storyHrefs = await page.locator('main a[href^="/stories/"]').evaluateAll((nodes) =>
    [...new Set(nodes.map((node) => node.getAttribute("href")))],
  );
  if (storyHrefs.length !== 2) {
    throw new Error(`Home should show exactly two stories, got ${storyHrefs.join(", ")}`);
  }
  if (!storyHrefs.includes("/stories/city-tailoring") || !storyHrefs.includes("/stories/italian-leather")) {
    throw new Error(`Home stories were ${storyHrefs.join(", ")}`);
  }
  if (home.includes("Continue")) throw new Error("First-time home showed Continue");
  note(`home: two huge stories ${storyHrefs.join(" · ")}, first-time New row`);

  await page.goto(`${base}/stories`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector('a[href="/stories/city-tailoring"]', { timeout: 30000 });
  const index = await page.locator("main").innerText();
  const indexFold = index.toLowerCase();
  for (const title of [
    "City tailoring",
    "Italian leather",
    "After midnight",
    "White shirt",
    "Blue jeans",
    "Rains",
    "Timberlands",
    "Dark glasses",
  ]) {
    if (!indexFold.includes(title.toLowerCase())) throw new Error(`Stories index missing ${title}`);
  }
  if (index.includes("Weekend linen") || index.includes("City black") || index.includes("Under €150")) {
    throw new Error("Deleted mixed-dump stories still on the index");
  }
  const tiles = await page.locator('main a[href^="/stories/"]').count();
  if (tiles !== 8) throw new Error(`Expected 8 story tiles, got ${tiles}`);
  const firstH = await page.locator('main a[href^="/stories/"]').first().evaluate((node) => node.offsetHeight);
  if (firstH < 400) throw new Error(`Story tiles are too small (${firstH}px)`);
  note(`stories index: 8 large tiles, first ${firstH}px`);

  await page.goto(`${base}/stories/city-tailoring`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("text=A jacket first", { timeout: 30000 });
  const story = await page.locator("main").innerText();
  if (!story.toLowerCase().includes("a jacket first")) throw new Error("City tailoring manifesto missing");
  const cards = await page.locator("main article").count();
  if (cards < 4 || cards > 12) throw new Error(`Story should show up to 12 products, got ${cards}`);
  if (!story.toLowerCase().includes("view the full story")) throw new Error("View the full story missing");
  note(`city-tailoring: manifesto + ${cards} products + full-story link`);

  await page.goto(`${base}/product/2476302-blauer-women-blazer`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForSelector("h1");
  await page.waitForSelector("text=Complete the look", { timeout: 25000 });
  await page.waitForSelector("text=Similar", { timeout: 15000 });
  const look = await page.locator("section").filter({ hasText: "Complete the look" }).locator("article").count();
  const similar = await page.locator("section").filter({ hasText: "Similar" }).locator("article").count();
  if (look < 1 || look > 3) throw new Error(`Look rail should be 1–3, got ${look}`);
  if (similar < 1 || similar > 4) throw new Error(`Similar should be 1–4, got ${similar}`);
  note(`pdp look=${look} similar=${similar}`);

  await page.locator('button[aria-label*="wishlist" i]').first().click();
  await page.goto(`${base}/wishlist`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1");
  await page.waitForSelector("main article", { timeout: 15000 });
  const wish = (await page.locator("main").innerText()).toLowerCase();
  if (!wish.includes("kept")) throw new Error("Wishlist heading missing");
  if (!wish.includes("back in stock")) throw new Error("Restock email missing");
  note("wishlist: heart persisted + restock note");

  await page.goto(`${base}/search?q=black+blazer+women+40`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForSelector("h1");
  const search = (await page.locator("main").innerText()).toLowerCase();
  for (const chip of ["Women", "Blazer", "Black", "Size 40"]) {
    if (!search.includes(chip.toLowerCase())) throw new Error(`Search missing chip ${chip}`);
  }
  const results = await page.locator("main article").count();
  if (results < 1) throw new Error("Search returned no products");
  note(`search: chips + ${results} ranked results`);

  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1");
  await page.waitForSelector("text=Continue", { timeout: 15000 });
  note("home return: Continue from viewed/wishlist");

  await page.goto(`${base}/stories/weekend-linen`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1", { timeout: 15000 });
  const empty = await page.locator("main").innerText();
  if (!empty.includes("This room is empty")) {
    throw new Error("Deleted linen dump should 404");
  }

  note("EDIT OK");
} catch (error) {
  console.error("EDIT FAIL", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
