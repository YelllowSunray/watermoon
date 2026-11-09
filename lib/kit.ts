import type { Product, ProductCard, ProductVariant } from "@/lib/products";

type Sized = {
  variants: ProductVariant[];
};

export function pieceRole(product: Pick<Product, "subcategory" | "department">) {
  return product.subcategory || product.department;
}

export function kitIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function kitTotal(products: Array<Pick<Product, "price">>) {
  return products.reduce((sum, product) => sum + product.price, 0);
}

export function kitPieces<T extends Product | ProductCard>(products: T[]) {
  return products.map((product, index) => ({
    product,
    index: kitIndex(index),
    role: pieceRole(product),
  }));
}

export function buyableSizes(product: Sized, color?: string) {
  return [
    ...new Set(
      product.variants
        .filter((variant) => variant.available && (!color || variant.color === color))
        .map((variant) => variant.size),
    ),
  ];
}

export function sizeLabel(size: string) {
  const compact = size.replace(/\s+/g, " ").trim();
  const euUs = compact.match(/^EU\s*(\d+(?:\.\d+)?)\s*\/\s*US\s*(\d+(?:\.\d+)?)$/i);
  if (euUs) return { primary: euUs[1], secondary: `US ${euUs[2]}` };
  return { primary: compact };
}

export function sizeLine(size?: string) {
  if (!size || size.toLowerCase() === "one size") return "";
  const label = sizeLabel(size);
  return [label.primary, label.secondary].filter(Boolean).join(" · ");
}

export function sizeMatches(size: string, pref?: string) {
  if (!pref) return false;
  if (size === pref) return true;
  if (sizeLabel(size).primary === sizeLabel(pref).primary) return true;
  return size.replace(/\s+/g, "").toLowerCase() === pref.replace(/\s+/g, "").toLowerCase();
}

export function needsSizeChoice(sizes: string[]) {
  return sizes.some((size) => size && size.toLowerCase() !== "one size");
}

export function defaultSize(product: Sized, color?: string, preferred?: string) {
  const sizes = buyableSizes(product, color);
  const match = sizes.find((size) => sizeMatches(size, preferred));
  if (match) return match;
  return sizes.length === 1 ? sizes[0] : "";
}

export function pickVariant(product: Sized, size?: string, color?: string) {
  return product.variants.find(
    (variant) =>
      variant.available &&
      (!size || variant.size === size) &&
      (!color || variant.color === color),
  );
}
