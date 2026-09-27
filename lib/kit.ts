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

export function defaultSize(product: Sized, color?: string, preferred?: string) {
  const sizes = buyableSizes(product, color);
  if (preferred && sizes.includes(preferred)) return preferred;
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
