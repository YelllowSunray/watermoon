export type Gender = "women" | "men";
export type Department = "clothing" | "shoes" | "accessories";
export type ProductTag = "new" | "sale";

export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductVariant = {
  id: string;
  color: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  quantity?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  gender: Gender;
  department: Department;
  subcategory: string;
  season?: string;
  tags: ProductTag[];
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  variants: ProductVariant[];
  description: string;
  details: string[];
  available: boolean;
};

export type ProductCard = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "brand"
  | "price"
  | "compareAtPrice"
  | "images"
  | "available"
  | "gender"
  | "department"
  | "subcategory"
  | "variants"
  | "colors"
  | "sizes"
>;

export function toCard(product: Product): ProductCard {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images,
    available: product.available,
    gender: product.gender,
    department: product.department,
    subcategory: product.subcategory,
    variants: product.variants,
    colors: product.colors,
    sizes: product.sizes,
  };
}

export function brandToSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isGender(value: string): value is Gender {
  return value === "women" || value === "men";
}

export function isDepartment(value: string): value is Department {
  return value === "clothing" || value === "shoes" || value === "accessories";
}
