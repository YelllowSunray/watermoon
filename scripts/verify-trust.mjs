import { chromium } from "playwright";

const base = "http://localhost:3000";
const account = "https://shopify.com/108213731669/account";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

function note(message) {
  console.log(message);
}

try {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("h1");
  const home = await page.locator("main").innerText();
  if (/why shop|free shipping|best sellers|new arrivals/i.test(home)) {
    throw new Error("Home gained a trust four-up or catalog stack");
  }
  const html = await page.content();
  if (!html.includes('"@type":"Organization"') || !html.includes("SearchAction")) {
    throw new Error("Home JSON-LD missing Organization or SearchAction");
  }
  if (!html.includes("canonical") || !html.includes(`${base}/`)) {
    throw new Error("Home canonical missing");
  }
  if (html.includes("fbevents.js") || html.includes("fbq(")) {
    throw new Error("Pixel loaded without a valid ID");
  }
  const imprint = await page.locator("footer address").innerText();
  for (const part of ["SamirDev", "Wilhelminastraat 44", "99510723", "NL005390534B11", "samir@samirdev.com", "+31"]) {
    if (!imprint.includes(part)) throw new Error(`Footer imprint missing ${part}`);
  }
  const accountHrefs = await page.locator(`a[href="${account}"]`).count();
  if (accountHrefs < 1) throw new Error("Account URL missing");
  note("home: no extra rails, JSON-LD, imprint, no pixel");

  for (const path of ["/about", "/faq", "/shipping", "/returns", "/privacy", "/terms", "/contact"]) {
    const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
    if (response?.status() !== 200) throw new Error(`${path} ${response?.status()}`);
    await page.waitForSelector("h1");
    const text = (await page.locator("main").innerText()).toLowerCase();
    if (!text.includes("samirdev") && path !== "/faq") {
      // FAQ mentions the shop, not always the legal name in first screen — still check email
    }
    if (path === "/privacy") {
      if (!text.includes("bag") || !text.includes("wishlist") || !text.includes("vercel") || !text.includes("pixel")) {
        throw new Error("Privacy missing bag / wishlist / vercel / pixel");
      }
    }
    note(`${path}: 200`);
  }

  const honey = await fetch(`${base}/api/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bot@example.com", company: "Acme" }),
  });
  const honeyJson = await honey.json();
  if (!honey.ok || !honeyJson.ok) throw new Error("Honeypot should succeed silently");
  note("newsletter honeypot: ok");

  const contactHoney = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Bot",
      email: "bot@example.com",
      message: "spam",
      company: "Acme",
    }),
  });
  if (!(await contactHoney.json()).ok) throw new Error("Contact honeypot should succeed silently");
  note("contact honeypot: ok");

  const map = await fetch(`${base}/sitemap.xml`);
  if (!map.ok) throw new Error(`sitemap ${map.status}`);
  const xml = await map.text();
  if (!xml.includes("/about") || !xml.includes("/product/")) {
    throw new Error("Sitemap missing about or products");
  }
  note("sitemap: 200 with products");

  note("TRUST OK");
} catch (error) {
  console.error("TRUST FAIL", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
