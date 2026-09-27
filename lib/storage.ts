import { brandToSlug, type Department, type Gender } from "@/lib/products";

export const STORAGE_KEYS = {
  bag: "wm.bag",
  wishlist: "wm.wishlist",
  viewed: "wm.viewed",
  sizes: "wm.sizes",
} as const;

export type SizeRoom = "clothing" | "trousers" | "shoes";
export type SizeKey = `${Gender}-${SizeRoom}`;
export type SizePrefs = Partial<Record<SizeKey, string>>;

export const SIZE_KEYS: SizeKey[] = [
  "women-clothing",
  "women-trousers",
  "women-shoes",
  "men-clothing",
  "men-trousers",
  "men-shoes",
];

const TROUSER_SLUGS = new Set([
  "jeans",
  "trousers",
  "pants",
  "shorts",
  "chinos",
  "chino",
]);

export function sizeRoomFor(
  department: Department,
  subcategory?: string,
): SizeRoom | undefined {
  if (department === "shoes") return "shoes";
  if (department !== "clothing") return undefined;
  const slug = brandToSlug(subcategory ?? "");
  if (
    TROUSER_SLUGS.has(slug) ||
    slug.includes("jean") ||
    slug.includes("trouser") ||
    slug.includes("pant") ||
    slug.includes("chino")
  ) {
    return "trousers";
  }
  return "clothing";
}

export function sizeKey(
  gender: Gender,
  department: Department,
  subcategory?: string,
): SizeKey | undefined {
  const room = sizeRoomFor(department, subcategory);
  return room ? `${gender}-${room}` : undefined;
}

export function isKeptSize(value: string) {
  const size = value.trim();
  if (!size) return false;
  if (size.toLowerCase() === "one size") return false;
  return size.length <= 24;
}

export function sortSizeLabels(a: string, b: string) {
  const letters = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const ia = letters.indexOf(a.toUpperCase());
  const ib = letters.indexOf(b.toUpperCase());
  if (ia >= 0 && ib >= 0) return ia - ib;
  const wa = a.match(/W\s*(\d+)/i);
  const wb = b.match(/W\s*(\d+)/i);
  if (wa && wb) {
    const waist = Number(wa[1]) - Number(wb[1]);
    if (waist) return waist;
    const la = a.match(/L\s*(\d+)/i);
    const lb = b.match(/L\s*(\d+)/i);
    return Number(la?.[1] ?? 0) - Number(lb?.[1] ?? 0);
  }
  const na = Number.parseFloat(a);
  const nb = Number.parseFloat(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b, undefined, { numeric: true });
}

export function parseSizePrefs(value: unknown): SizePrefs {
  if (!value || typeof value !== "object") return {};
  const next: SizePrefs = {};
  for (const key of SIZE_KEYS) {
    const raw = (value as Record<string, unknown>)[key];
    if (typeof raw === "string" && isKeptSize(raw)) next[key] = raw.trim();
  }
  return next;
}

export type BagLine = {
  variantId: string;
  quantity: number;
  handle: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  color?: string;
  size?: string;
};

export function isBagVariantId(value?: string) {
  return /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(value ?? "");
}

export type WishlistItem = {
  handle: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
};

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
