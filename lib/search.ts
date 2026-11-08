import type { Gender, Product } from "@/lib/products";
import { brandToSlug } from "@/lib/products";

export type SearchIntent = {
  raw: string;
  gender?: Gender;
  subcategory?: string;
  color?: string;
  size?: string;
  brand?: string;
  remainder: string;
};

const SUBCATEGORIES = [
  "blazer",
  "blazers",
  "jacket",
  "jackets",
  "coat",
  "coats",
  "trousers",
  "pants",
  "jeans",
  "skirt",
  "skirts",
  "dress",
  "dresses",
  "shirt",
  "shirts",
  "t-shirt",
  "t-shirts",
  "tee",
  "knitwear",
  "cardigan",
  "sweater",
  "top",
  "tops",
  "sneakers",
  "boots",
  "sandals",
  "slippers",
  "bag",
  "bags",
  "belt",
  "belts",
  "wallet",
  "wallets",
];

const SUBCATEGORY_CANON: Record<string, string> = {
  blazers: "Blazer",
  blazer: "Blazer",
  jacket: "Jackets",
  jackets: "Jackets",
  coat: "Coats",
  coats: "Coats",
  trousers: "Trousers",
  pants: "Trousers",
  jeans: "Jeans",
  skirt: "Skirt",
  skirts: "Skirt",
  dress: "Dresses",
  dresses: "Dresses",
  shirt: "Shirts",
  shirts: "Shirts",
  "t-shirt": "T-shirts",
  "t-shirts": "T-shirts",
  tee: "T-shirts",
  knitwear: "Knitwear",
  cardigan: "Cardigan",
  sweater: "Knitwear",
  top: "Tops",
  tops: "Tops",
  sneakers: "Sneakers",
  boots: "Boots",
  sandals: "Sandals",
  slippers: "Slippers",
  bag: "Bags",
  bags: "Bags",
  belt: "Belts",
  belts: "Belts",
  wallet: "Wallets",
  wallets: "Wallets",
};

const COLORS = [
  "black",
  "white",
  "navy",
  "blue",
  "beige",
  "brown",
  "grey",
  "gray",
  "green",
  "red",
  "pink",
  "bordeaux",
  "gold",
  "silver",
  "lilac",
  "yellow",
  "orange",
  "fuchsia",
];

const SIZE = /^(xxs|xs|s|m|l|xl|xxl|xxxl|\d{2}|\d{2}\/\d{2})$/i;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, " ")
    .trim();
}

/** "black blazer women 40" → colour, subcategory, gender, size. */
export function parseSearchIntent(raw: string): SearchIntent {
  const tokens = normalize(raw).split(/\s+/).filter(Boolean);
  const used = new Set<number>();
  let gender: Gender | undefined;
  let subcategory: string | undefined;
  let color: string | undefined;
  let size: string | undefined;

  tokens.forEach((token, index) => {
    if (token === "women" || token === "woman" || token === "womens") {
      gender = "women";
      used.add(index);
    }
    if (token === "men" || token === "man" || token === "mens") {
      gender = "men";
      used.add(index);
    }
  });

  tokens.forEach((token, index) => {
    if (used.has(index)) return;
    if (SUBCATEGORIES.includes(token) && !subcategory) {
      subcategory = SUBCATEGORY_CANON[token] ?? token;
      used.add(index);
    }
  });

  tokens.forEach((token, index) => {
    if (used.has(index)) return;
    if (COLORS.includes(token) && !color) {
      color = token === "gray" ? "grey" : token;
      used.add(index);
    }
  });

  tokens.forEach((token, index) => {
    if (used.has(index)) return;
    if (SIZE.test(token) && !size) {
      size = token.toUpperCase();
      used.add(index);
    }
  });

  const remainder = tokens.filter((_, index) => !used.has(index)).join(" ");

  return { raw: raw.trim(), gender, subcategory, color, size, remainder };
}

export function intentToShopifyQuery(intent: SearchIntent) {
  const parts: string[] = [];
  if (intent.gender) {
    parts.push(
      `(tag:'Gender_${intent.gender}' OR tag:'Gender_${intent.gender === "women" ? "Women" : "Men"}' OR tag:'${intent.gender === "women" ? "Women" : "Men"}')`,
    );
  }
  if (intent.subcategory) {
    parts.push(`tag:'Subcategory_${intent.subcategory}'`);
  }
  if (intent.color) parts.push(intent.color);
  if (intent.remainder) parts.push(intent.remainder.replace(/[\\'":()]/g, " ").trim());
  return parts.join(" AND ") || intent.raw.replace(/[\\'":()]/g, " ").trim();
}

export function intentChips(intent: SearchIntent) {
  const chips: Array<{ key: string; label: string }> = [];
  if (intent.gender) {
    chips.push({
      key: "gender",
      label: intent.gender === "women" ? "Women" : "Men",
    });
  }
  if (intent.subcategory) chips.push({ key: "sub", label: intent.subcategory });
  if (intent.color) {
    chips.push({
      key: "color",
      label: intent.color.charAt(0).toUpperCase() + intent.color.slice(1),
    });
  }
  if (intent.size) chips.push({ key: "size", label: `Size ${intent.size}` });
  if (intent.remainder) chips.push({ key: "more", label: intent.remainder });
  return chips;
}

export function rankSearchResults(products: Product[], intent: SearchIntent) {
  const color = intent.color?.toLowerCase();
  const sub = intent.subcategory ? brandToSlug(intent.subcategory) : undefined;

  return [...products]
    .map((product) => {
      let score = 0;
      if (sub && brandToSlug(product.subcategory) === sub) score += 20;
      else if (
        intent.subcategory &&
        product.subcategory.toLowerCase().includes(intent.subcategory.toLowerCase())
      ) {
        score += 12;
      }
      if (intent.gender && product.gender === intent.gender) score += 14;
      if (
        color &&
        product.colors.some((entry) => entry.name.toLowerCase().includes(color))
      ) {
        score += 10;
      }
      if (
        intent.remainder &&
        product.brand.toLowerCase().includes(intent.remainder.toLowerCase())
      ) {
        score += 8;
      }
      if (product.available) score += 6;
      if (
        intent.size &&
        product.sizes.some((size) => size.toLowerCase() === intent.size?.toLowerCase())
      ) {
        score += 5;
      }
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);
}
