import { SaleFilters } from "@/components/SaleFilters";
import { ShopGrid } from "@/components/ShopGrid";
import { DEPARTMENT_LABEL, getSaleProducts } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/site";
import {
  brandToSlug,
  isDepartment,
  isGender,
  type Department,
  type Gender,
  type Product,
} from "@/lib/products";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sale",
  description: `The cut at ${SITE_NAME} — marked pieces, still the house.`,
};

type SaleQuery = {
  gender?: string | string[];
  room?: string | string[];
  sort?: string | string[];
};

type SaleSort = "cut" | "price-asc" | "price-desc";

const DEPARTMENTS: Department[] = ["clothing", "accessories", "shoes"];
const WORLDS: { gender: Gender; label: string }[] = [
  { gender: "women", label: "Women" },
  { gender: "men", label: "Men" },
];
const ROOMS = DEPARTMENTS.map((slug) => ({ slug, name: DEPARTMENT_LABEL[slug] }));

function param(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

function isSaleSort(value: string): value is SaleSort {
  return value === "cut" || value === "price-asc" || value === "price-desc";
}

function discountRatio(product: Product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return (product.compareAtPrice - product.price) / product.compareAtPrice;
}

function sortSale(products: Product[], sort: SaleSort) {
  return [...products].sort((left, right) => {
    const byName = left.name.localeCompare(right.name);
    if (sort === "price-asc") return left.price - right.price || byName;
    if (sort === "price-desc") return right.price - left.price || byName;
    const cut = discountRatio(right) - discountRatio(left);
    return cut || byName;
  });
}

function presentCategories(products: Product[], department: Department, gender?: Gender) {
  const names = new Map<string, string>();
  for (const product of products) {
    if (gender && product.gender !== gender) continue;
    if (product.department !== department) continue;
    const slug = brandToSlug(product.subcategory);
    if (!slug || names.has(slug)) continue;
    names.set(slug, product.subcategory);
  }
  return [...names.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<SaleQuery>;
}) {
  const query = await searchParams;
  const products = await getSaleProducts(100);
  const askedGender = param(query.gender) ?? "";
  const gender = isGender(askedGender) ? askedGender : undefined;
  const room = param(query.room);
  const askedSort = param(query.sort) ?? "";
  const sort: SaleSort = isSaleSort(askedSort) ? askedSort : "cut";
  const world = gender ? products.filter((product) => product.gender === gender) : products;
  const scoped = world.filter((product) => {
    if (!room) return true;
    if (isDepartment(room)) return product.department === room;
    return brandToSlug(product.subcategory) === room;
  });
  const listed = sortSale(scoped, sort);
  const activeDepartment = room
    ? isDepartment(room)
      ? room
      : listed[0]?.department ?? scoped[0]?.department
    : undefined;
  const categories = activeDepartment
    ? presentCategories(products, activeDepartment, gender)
    : [];

  return (
    <div>
      <section className="field-vermillion px-5 py-10 md:px-10 md:py-14">
        <p className="eyebrow">
          <Link href="/sale">Sale</Link>
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h1 className="display max-w-3xl text-5xl md:text-7xl">The cut.</h1>
          <p className="eyebrow">
            {listed.length} {listed.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </section>

      {products.length > 0 ? (
        <SaleFilters
          worlds={WORLDS}
          rooms={ROOMS}
          categories={categories}
          selected={{ gender, room, sort }}
        />
      ) : null}

      <section className="px-5 py-12 md:px-10 md:py-16">
        {listed.length > 0 ? (
          <ShopGrid products={listed} dense />
        ) : products.length > 0 ? (
          <p className="text-sm">
            Nothing in this cut.{" "}
            <Link href="/sale" className="underline">
              All sale
            </Link>
          </p>
        ) : (
          <p className="text-sm">No marked pieces in the house yet.</p>
        )}
      </section>
    </div>
  );
}
