import "server-only";

import { genderClause, queryProducts } from "@/lib/catalog";
import type { Product } from "@/lib/products";

const COMPLEMENTS: Record<string, string[]> = {
  blazer: ["Trousers", "Boots", "Belts", "Shirts", "Sneakers", "Jeans"],
  jackets: ["Trousers", "Boots", "Knitwear", "Belts"],
  coats: ["Trousers", "Boots", "Scarves", "Belts"],
  trousers: ["Blazer", "Boots", "Belts", "Shirts"],
  jeans: ["Blazer", "Sneakers", "Belts", "T-shirts"],
  skirt: ["Blazer", "Boots", "Tops", "Belts"],
  dresses: ["Belts", "Bags", "Boots", "Sneakers"],
  shirts: ["Trousers", "Belts", "Boots", "Jeans"],
  "t-shirts": ["Jeans", "Sneakers", "Jackets"],
  knitwear: ["Trousers", "Boots", "Jeans"],
  cardigan: ["Trousers", "Jeans", "Boots"],
  tops: ["Trousers", "Jeans", "Blazer"],
  sneakers: ["Jeans", "Trousers", "Belts"],
  boots: ["Trousers", "Jeans", "Jackets"],
  bags: ["Belts", "Boots", "Dresses"],
  belts: ["Trousers", "Jeans", "Blazer"],
  sunglasses: ["Bags", "Belts"],
};

const SLOT: Record<string, string> = {
  trousers: "bottom",
  jeans: "bottom",
  skirt: "bottom",
  shorts: "bottom",
  blazer: "outer",
  jackets: "outer",
  coats: "outer",
  shirts: "top",
  "t-shirts": "top",
  tops: "top",
  knitwear: "top",
  cardigan: "top",
  dresses: "dress",
  sneakers: "shoe",
  boots: "shoe",
  sandals: "shoe",
  bags: "bag",
  belts: "belt",
  sunglasses: "eye",
  scarves: "neck",
};

function keyOf(subcategory: string) {
  return subcategory.toLowerCase().replace(/\s+/g, "-");
}

function slotOf(subcategory: string) {
  return SLOT[keyOf(subcategory)] ?? keyOf(subcategory);
}

function priceFits(product: Product, base: number) {
  if (!base) return true;
  return product.price >= base * 0.5 && product.price <= base * 1.8;
}

export async function getCompleteTheLook(product: Product, limit = 3) {
  const complements =
    COMPLEMENTS[keyOf(product.subcategory)] ??
    COMPLEMENTS[product.subcategory.toLowerCase()] ??
    [];
  if (complements.length === 0) return [];

  const tags = complements.map((name) => `tag:'Subcategory_${name}'`).join(" OR ");
  const query = `${genderClause(product.gender)} AND (${tags})`;
  const pool = await queryProducts(query, { maxPages: 1, first: 50 });

  const picked: Product[] = [];
  const usedSlots = new Set<string>([slotOf(product.subcategory)]);

  for (const name of complements) {
    if (picked.length >= limit) break;
    const wanted = keyOf(name);
    const candidate = pool.find((entry) => {
      if (entry.id === product.id) return false;
      if (entry.gender !== product.gender) return false;
      if (!priceFits(entry, product.price)) return false;
      if (keyOf(entry.subcategory) !== wanted) return false;
      if (usedSlots.has(slotOf(entry.subcategory))) return false;
      return true;
    });
    if (!candidate) continue;
    usedSlots.add(slotOf(candidate.subcategory));
    picked.push(candidate);
  }

  return picked;
}

export async function getSimilarProducts(product: Product, limit = 4) {
  const query = `${genderClause(product.gender)} AND tag:'Subcategory_${product.subcategory}'`;
  const pool = await queryProducts(query, { maxPages: 1, first: 50 });

  return pool
    .filter((candidate) => candidate.id !== product.id)
    .filter((candidate) => candidate.gender === product.gender)
    .filter((candidate) => priceFits(candidate, product.price))
    .slice(0, limit);
}
