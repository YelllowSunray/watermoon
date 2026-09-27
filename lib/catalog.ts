import "server-only";

import { cache } from "react";
import {
  brandToSlug,
  isDepartment,
  type Department,
  type Gender,
  type Product,
} from "@/lib/products";
import { isShopifyReady, shopifyMissingKeys } from "@/lib/shopify/config";
import {
  mapShopifyProduct,
  resolveDepartment,
  resolveGender,
  resolveSubcategory,
  type ShopifyNavNode,
  type ShopifyProductNode,
} from "@/lib/shopify/map-product";
import {
  HANDLES_PAGE_QUERY,
  NAV_PAGE_QUERY,
  NEWEST_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SEARCHED_PRODUCTS_QUERY,
  VENDOR_PAGE_QUERY,
} from "@/lib/shopify/queries";
import { shopifyStorefrontGraphql } from "@/lib/shopify/storefront";
import {
  SIZE_KEYS,
  isKeptSize,
  sizeKey,
  sortSizeLabels,
  type SizeKey,
} from "@/lib/storage";

export const CATALOG_REVALIDATE_SECONDS = 300;
export const NAV_REVALIDATE_SECONDS = 900;
export const CATALOG_TAG = "shopify-catalog";
export const NAV_TAG = "shopify-nav";

const listingFetch = {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: [CATALOG_TAG],
};

const navFetch = {
  revalidate: NAV_REVALIDATE_SECONDS,
  tags: [NAV_TAG],
};

export type Brand = {
  name: string;
  slug: string;
  count: number;
  image?: string;
};

export const DEPARTMENT_LABEL: Record<Department, string> = {
  clothing: "Clothing",
  shoes: "Shoes",
  accessories: "Accessories",
};

export type NavCategory = {
  slug: string;
  name: string;
  count: number;
};

export type NavDepartment = {
  slug: Department;
  name: string;
  count: number;
  image?: string;
  categories: NavCategory[];
};

export type GenderNav = {
  gender: Gender;
  href: string;
  label: string;
  departments: NavDepartment[];
};

type PaginatedProducts = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ShopifyProductNode[];
  };
};

function tagTerm(tag: string) {
  return `tag:'${tag.replace(/'/g, "\\'")}'`;
}

function vendorTerm(name: string) {
  return `vendor:'${name.replace(/'/g, "\\'")}'`;
}

export function sanitizeSearch(query: string) {
  return query.replace(/[\\'":()]/g, " ").replace(/\s+/g, " ").trim();
}

export function genderClause(gender: Gender) {
  return `(${tagTerm(`Gender_${gender}`)} OR ${tagTerm(`Gender_${gender === "women" ? "Women" : "Men"}`)})`;
}

function mapRenderable(nodes: ShopifyProductNode[]) {
  return nodes
    .map(mapShopifyProduct)
    .filter((product) => product.images.length > 0 && product.variants.length > 0);
}

function mapAvailable(nodes: ShopifyProductNode[]) {
  return mapRenderable(nodes).filter((product) => product.available);
}

async function fetchProductsByQuery(
  query: string,
  options?: { maxPages?: number; first?: number },
) {
  const nodes: ShopifyProductNode[] = [];
  let cursor: string | null = null;
  let pages = 0;
  const maxPages = options?.maxPages ?? 1;
  const first = options?.first ?? 50;

  do {
    const data: PaginatedProducts = await shopifyStorefrontGraphql<PaginatedProducts>(
      SEARCHED_PRODUCTS_QUERY,
      { cursor, query, first },
      listingFetch,
    );
    nodes.push(...data.products.nodes);
    pages += 1;
    cursor =
      pages < maxPages && data.products.pageInfo.hasNextPage
        ? data.products.pageInfo.endCursor
        : null;
  } while (cursor);

  return nodes;
}

export async function queryProducts(
  query: string,
  options?: { maxPages?: number; first?: number; availableOnly?: boolean },
) {
  if (!isShopifyReady() || !query) return [];
  try {
    const nodes = await fetchProductsByQuery(query, options);
    return options?.availableOnly === false
      ? mapRenderable(nodes)
      : mapAvailable(nodes);
  } catch (error) {
    console.error("Shopify query failed", query, error);
    return [];
  }
}

export async function getNewestProducts(limit = 12) {
  if (!isShopifyReady()) return [];
  try {
    const data = await shopifyStorefrontGraphql<{
      products: { nodes: ShopifyProductNode[] };
    }>(NEWEST_PRODUCTS_QUERY, { first: Math.min(48, limit) }, listingFetch);
    return mapAvailable(data.products.nodes).slice(0, limit);
  } catch (error) {
    console.error("Shopify newest unavailable", error);
    return [];
  }
}

export const getProduct = cache(async (slug: string) => {
  if (!isShopifyReady() || !slug) return undefined;
  try {
    const data = await shopifyStorefrontGraphql<{
      product: ShopifyProductNode | null;
    }>(PRODUCT_BY_HANDLE_QUERY, { handle: slug }, listingFetch);
    if (!data.product) return undefined;
    const product = mapShopifyProduct(data.product);
    if (product.images.length === 0 || product.variants.length === 0) {
      return undefined;
    }
    return product;
  } catch (error) {
    console.error("Shopify product unavailable", slug, error);
    return undefined;
  }
});

export async function getProductsByHandles(handles: string[]) {
  const unique = [...new Set(handles.map((handle) => handle.trim()).filter(Boolean))].slice(
    0,
    24,
  );
  if (!isShopifyReady() || unique.length === 0) return [];

  const found = await Promise.all(unique.map((handle) => getProduct(handle)));
  return unique
    .map((handle, index) => found[index]?.slug === handle ? found[index] : undefined)
    .filter((product): product is Product => Boolean(product?.available));
}

export async function getScopedShop({
  gender,
  department,
  subcategory,
}: {
  gender: Gender;
  department?: Department;
  subcategory?: string;
}) {
  const parts = [genderClause(gender)];
  if (department) {
    const label = DEPARTMENT_LABEL[department];
    parts.push(`(${tagTerm(`Category_${label}`)} OR ${tagTerm(`Category_${department}`)})`);
  }
  if (subcategory) {
    parts.push(
      `(${tagTerm(`Subcategory_${subcategory}`)} OR ${tagTerm(`Subcategory_${subcategory.replace(/-/g, " ")}`)})`,
    );
  }

  const products = await queryProducts(parts.join(" AND "), {
    maxPages: subcategory ? 2 : 3,
    first: 50,
  });

  return products.filter((product) => {
    if (product.gender !== gender) return false;
    if (department && product.department !== department) return false;
    if (
      subcategory &&
      brandToSlug(product.subcategory) !== brandToSlug(subcategory) &&
      product.subcategory.toLowerCase() !== subcategory.toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

export async function getSaleProducts(limit = 24) {
  return (
    await queryProducts("compare_at_price:>0", { maxPages: 1, first: 50 })
  )
    .filter((product) => product.compareAtPrice)
    .slice(0, limit);
}

export async function getProductsByBrand(name: string) {
  if (!name) return [];
  return queryProducts(vendorTerm(name), { maxPages: 1, first: 50 });
}

export async function getSizeOptions(): Promise<Record<SizeKey, string[]>> {
  const buckets = Object.fromEntries(SIZE_KEYS.map((key) => [key, new Set<string>()])) as Record<
    SizeKey,
    Set<string>
  >;

  const lists = await Promise.all([
    getScopedShop({ gender: "women", department: "clothing" }),
    getScopedShop({ gender: "men", department: "clothing" }),
    getScopedShop({ gender: "women", department: "shoes" }),
    getScopedShop({ gender: "men", department: "shoes" }),
    getScopedShop({ gender: "women", subcategory: "Jeans" }),
    getScopedShop({ gender: "women", subcategory: "Trousers" }),
    getScopedShop({ gender: "men", subcategory: "Jeans" }),
    getScopedShop({ gender: "men", subcategory: "Trousers" }),
  ]);

  for (const product of lists.flat()) {
    const key = sizeKey(product.gender, product.department, product.subcategory);
    if (!key) continue;
    for (const variant of product.variants) {
      if (variant.available && isKeptSize(variant.size)) buckets[key].add(variant.size);
    }
  }

  return Object.fromEntries(
    SIZE_KEYS.map((key) => [key, [...buckets[key]].sort(sortSizeLabels)]),
  ) as Record<SizeKey, string[]>;
}

export async function searchShopify(query: string) {
  const q = sanitizeSearch(query);
  if (!q) return [];
  return queryProducts(q, { maxPages: 1, first: 50 });
}

type NavCatalog = {
  brands: Brand[];
  houses: Brand[];
  genderNav: GenderNav[];
};

function emptyNav(): NavCatalog {
  return { brands: [], houses: [], genderNav: [] };
}

function buildBrands(items: Array<{ brand: string; image?: string }>): Brand[] {
  const brands = new Map<string, Brand>();
  for (const item of items) {
    if (!item.brand) continue;
    const existing = brands.get(item.brand);
    if (existing) {
      existing.count += 1;
      continue;
    }
    brands.set(item.brand, {
      name: item.brand,
      slug: brandToSlug(item.brand),
      count: 1,
      image: item.image,
    });
  }
  return [...brands.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function buildGenderNav(
  items: Array<{
    gender: Gender;
    department: Department;
    subcategory: string;
    image?: string;
  }>,
): GenderNav[] {
  return (["women", "men"] as const).map((gender) => {
    const genderItems = items.filter((item) => item.gender === gender);
    const byDept = new Map<Department, Map<string, number>>();

    for (const item of genderItems) {
      const name = item.subcategory.trim();
      if (!name) continue;
      const counts = byDept.get(item.department) ?? new Map<string, number>();
      counts.set(name, (counts.get(name) ?? 0) + 1);
      byDept.set(item.department, counts);
    }

    const departments: NavDepartment[] = [];
    const usedImages = new Set<string>();
    for (const slug of ["clothing", "shoes", "accessories"] as Department[]) {
      const counts = byDept.get(slug);
      if (!counts || counts.size === 0) continue;
      const deptItems = genderItems.filter((item) => item.department === slug);
      const image = deptItems
        .map((item) => item.image)
        .find((candidate): candidate is string =>
          Boolean(candidate && !usedImages.has(candidate)),
        );
      if (image) usedImages.add(image);
      departments.push({
        slug,
        name: DEPARTMENT_LABEL[slug],
        count: deptItems.length,
        image,
        categories: [...counts]
          .map(([name, count]) => ({
            slug: brandToSlug(name),
            name,
            count,
          }))
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      });
    }

    return {
      gender,
      href: `/${gender}`,
      label: gender === "women" ? "Women" : "Men",
      departments,
    };
  });
}

export function roomsFromProducts(
  products: Array<{
    gender: Gender;
    department: Department;
    subcategory: string;
    images?: string[];
  }>,
) {
  return buildGenderNav(
    products.map((product) => ({
      gender: product.gender,
      department: product.department,
      subcategory: product.subcategory,
      image: product.images?.[0],
    })),
  ).filter((world) => world.departments.length > 0);
}

const loadNav = cache(async (): Promise<NavCatalog> => {
  if (!isShopifyReady()) {
    console.error(`Shopify is not configured. Missing: ${shopifyMissingKeys().join(", ")}`);
    return emptyNav();
  }

  try {
    const [women, men] = await Promise.all([
      shopifyStorefrontGraphql<{ products: { nodes: ShopifyNavNode[] } }>(
        NAV_PAGE_QUERY,
        { query: genderClause("women") },
        navFetch,
      ),
      shopifyStorefrontGraphql<{ products: { nodes: ShopifyNavNode[] } }>(
        NAV_PAGE_QUERY,
        { query: genderClause("men") },
        navFetch,
      ),
    ]);

    const listed = [...women.products.nodes, ...men.products.nodes]
      .filter((node) => node.availableForSale)
      .map((node) => ({
        gender: resolveGender(node),
        department: resolveDepartment(node),
        subcategory: resolveSubcategory(node),
        brand: node.vendor.trim(),
        image: node.images.nodes[0]?.url,
      }));

    const houses = buildBrands(listed);
    return {
      brands: houses.slice(0, 16),
      houses,
      genderNav: buildGenderNav(listed),
    };
  } catch (error) {
    console.error("Shopify navigation unavailable", error);
    return emptyNav();
  }
});

export async function getGenderNavigation() {
  return (await loadNav()).genderNav;
}

export async function getTopBrands() {
  return (await loadNav()).brands;
}

const loadVendorHarvest = cache(async (): Promise<Brand[]> => {
  if (!isShopifyReady()) return [];

  type VendorNode = {
    vendor: string;
    availableForSale: boolean;
    images: { nodes: Array<{ url: string }> };
  };

  const nodes: VendorNode[] = [];

  async function pull(sortKey: "BEST_SELLING" | "CREATED_AT", reverse: boolean, maxPages: number) {
    let cursor: string | null = null;
    let pages = 0;
    do {
      const data: {
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: VendorNode[];
        };
      } = await shopifyStorefrontGraphql(
        VENDOR_PAGE_QUERY,
        { cursor, sortKey, reverse },
        navFetch,
      );
      nodes.push(...data.products.nodes);
      pages += 1;
      cursor =
        pages < maxPages && data.products.pageInfo.hasNextPage
          ? data.products.pageInfo.endCursor
          : null;
    } while (cursor);
  }

  try {
    await Promise.all([pull("BEST_SELLING", false, 2), pull("CREATED_AT", true, 1)]);
  } catch (error) {
    console.error("Shopify vendor harvest unavailable", error);
    return [];
  }

  return buildBrands(
    nodes
      .filter((node) => node.availableForSale)
      .map((node) => ({
        brand: node.vendor.trim(),
        image: node.images.nodes[0]?.url,
      })),
  );
});

function mergeBrands(...lists: Brand[][]) {
  const bySlug = new Map<string, Brand>();
  for (const brand of lists.flat()) {
    const existing = bySlug.get(brand.slug);
    if (!existing) {
      bySlug.set(brand.slug, brand);
      continue;
    }
    bySlug.set(brand.slug, {
      name: existing.count >= brand.count ? existing.name : brand.name,
      slug: brand.slug,
      count: Math.max(existing.count, brand.count),
      image: existing.image ?? brand.image,
    });
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const loadAllBrands = cache(async (): Promise<Brand[]> => {
  const [harvest, nav] = await Promise.all([loadVendorHarvest(), loadNav()]);
  return mergeBrands(harvest, nav.houses);
});

export async function getAllBrands() {
  return loadAllBrands();
}

async function brandFromProducts(slug: string): Promise<Brand | undefined> {
  if (!slug) return undefined;
  const guess = slug.replace(/-/g, " ");
  const products = await queryProducts(vendorTerm(guess), { maxPages: 1, first: 50 });
  const match = products.find((product) => brandToSlug(product.brand) === slug);
  if (!match) return undefined;
  const ofBrand = products.filter((product) => brandToSlug(product.brand) === slug);
  return {
    name: match.brand,
    slug,
    count: ofBrand.length,
    image: match.images[0],
  };
}

export async function getBrandBySlug(slug: string) {
  const known = (await loadAllBrands()).find((brand) => brand.slug === slug);
  if (known) return known;
  return brandFromProducts(slug);
}

export async function getProductHandles() {
  if (!isShopifyReady()) return [];
  const handles: string[] = [];
  let cursor: string | null = null;
  let pages = 0;

  try {
    do {
      const data: {
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: Array<{ handle: string }>;
        };
      } = await shopifyStorefrontGraphql(HANDLES_PAGE_QUERY, { cursor }, listingFetch);
      for (const node of data.products.nodes) {
        if (node.handle) handles.push(node.handle);
      }
      pages += 1;
      cursor =
        pages < 40 && data.products.pageInfo.hasNextPage
          ? data.products.pageInfo.endCursor
          : null;
    } while (cursor);
  } catch (error) {
    console.error("Shopify sitemap handles unavailable", error);
  }

  return handles;
}

export function resolveShopSlug(slug: string): {
  department?: Department;
  subcategory?: string;
} {
  if (isDepartment(slug)) return { department: slug };
  return { subcategory: slug };
}
