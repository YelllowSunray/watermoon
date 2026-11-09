import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopGrid } from "@/components/ShopGrid";
import { ShopLooks } from "@/components/ShopLooks";
import { ShopRooms } from "@/components/ShopRooms";
import { ShopSkeleton } from "@/components/Skeleton";
import {
  DEPARTMENT_LABEL,
  departmentForShopSlug,
  getGenderNavigation,
  getScopedShop,
  resolveShopSlug,
} from "@/lib/catalog";
import { getLookWithImage, looksForShop } from "@/lib/looks";
import { brandToSlug, isGender, toCard, type Gender, type Product } from "@/lib/products";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const nav = await getGenderNavigation();
  const params: Array<{ gender: string; slug: string }> = [];
  for (const world of nav) {
    for (const department of world.departments) {
      params.push({ gender: world.gender, slug: department.slug });
      for (const category of department.categories) {
        params.push({ gender: world.gender, slug: category.slug });
      }
    }
  }
  return params;
}

const ROOM_FIELD: Record<string, Record<Gender, string>> = {
  clothing: { women: "field-vermillion", men: "field-ink" },
  shoes: { women: "field-orange", men: "field-cobalt" },
  accessories: { women: "field-violet", men: "field-chartreuse" },
};

function roomLine(department?: string, title?: string) {
  const room = (title ?? department ?? "").toLowerCase();
  if (room.includes("sneaker")) return "The pair. Then the rest of the outfit.";
  if (room.includes("boot")) return "The boot that does the walking.";
  if (department === "shoes") return "The pair. Then the walk.";
  if (department === "accessories") return "The last thing you put on.";
  return "The room. Then the pieces.";
}

function stillForRoom(
  products: Product[],
  department?: Product["department"],
  subcategory?: string,
) {
  const match = products.find((product) => {
    if (subcategory) {
      return (
        brandToSlug(product.subcategory) === brandToSlug(subcategory) ||
        product.subcategory.toLowerCase() === subcategory.toLowerCase()
      );
    }
    return department ? product.department === department : false;
  });
  return match?.images[0] ?? products[0]?.images[0];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gender: string; slug: string }>;
}) {
  const { gender, slug } = await params;
  const label = slug.replace(/-/g, " ");
  return {
    title: `${gender === "men" ? "Men" : "Women"} ${label}`,
    alternates: { canonical: `/shop/${gender}/${slug}` },
  };
}

async function ShopRoom({ gender, slug }: { gender: Gender; slug: string }) {
  const resolved = resolveShopSlug(slug);
  const nav = await getGenderNavigation();
  const world = nav.find((item) => item.gender === gender);
  const departmentSlug = resolved.department ?? departmentForShopSlug(world, slug);
  const rooms = departmentSlug
    ? (world?.departments.filter((department) => department.slug === departmentSlug) ?? [])
    : [];
  const department = rooms[0];
  const named = department?.categories.find((category) => category.slug === slug)?.name;
  const title = named ?? (departmentSlug ? DEPARTMENT_LABEL[departmentSlug] : slug.replace(/-/g, " "));
  const defs = looksForShop(gender, slug).slice(0, 4);
  const [products, kits] = await Promise.all([
    getScopedShop({
      gender,
      department: departmentSlug,
      subcategory: named ?? resolved.subcategory,
    }),
    Promise.all(defs.map((look) => getLookWithImage(look))),
  ]);
  const looks = kits
    .filter((kit) => kit.products.length >= 2)
    .slice(0, 2)
    .map((kit) => ({
      slug: kit.look.slug,
      title: kit.look.title,
      line: kit.look.line,
      splash: kit.look.splash,
      count: kit.products.length,
      image:
        stillForRoom(kit.products, departmentSlug ?? department?.slug, named ?? resolved.subcategory) ??
        kit.image,
    }));
  const label = gender === "women" ? "Women" : "Men";
  const field =
    ROOM_FIELD[department?.slug ?? "clothing"]?.[gender] ??
    (gender === "women" ? "field-vermillion" : "field-ink");
  const lookTitle = department?.slug === "shoes" ? "The pair. Then the outfit." : "Start with an outfit.";

  return (
    <div>
      <span className={`block h-1.5 ${field}`} />

      <section className="px-5 py-8 md:px-10 md:py-10 2xl:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">
              <Link href={`/${gender}`}>{label}</Link>
              {department && slug !== department.slug ? (
                <>
                  {" · "}
                  <Link href={`/shop/${gender}/${department.slug}`}>{department.name}</Link>
                </>
              ) : null}
            </p>
            <h1 className="display mt-3 text-5xl md:text-6xl 2xl:text-7xl">{title}</h1>
            <p className="deck mt-3 max-w-md">{roomLine(department?.slug, title)}</p>
          </div>
          <p className="eyebrow">{products.length} pieces</p>
        </div>
      </section>

      <ShopRooms gender={gender} departments={rooms} active={slug} accent={field} />

      <ShopLooks looks={looks} title={lookTitle} />

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-8 md:px-10 2xl:px-16">
          <p className="eyebrow">The pieces</p>
          <p className="eyebrow">{products.length} in this room</p>
        </div>
        <ShopGrid products={products.map(toCard)} dense />
      </section>
    </div>
  );
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ gender: string; slug: string }>;
}) {
  const { gender, slug } = await params;
  if (!isGender(gender)) notFound();

  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopRoom gender={gender} slug={slug} />
    </Suspense>
  );
}
