import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CardGrid } from "@/components/CardGrid";
import { LinedShot } from "@/components/LinedShot";
import { ShopGrid } from "@/components/ShopGrid";
import { ShopLooks } from "@/components/ShopLooks";
import { ShopRooms } from "@/components/ShopRooms";
import { ShopSkeleton } from "@/components/Skeleton";
import {
  DEPARTMENT_LABEL,
  getGenderNavigation,
  getScopedShop,
  resolveShopSlug,
} from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
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
  const named = world?.departments
    .flatMap((department) => department.categories)
    .find((category) => category.slug === slug)?.name;
  const rooms = resolved.department
    ? (world?.departments.filter((department) => department.slug === resolved.department) ?? [])
    : (world?.departments.filter((department) =>
        department.categories.some((category) => category.slug === slug),
      ) ?? []);
  const department = rooms[0];
  const title = named ?? (resolved.department ? DEPARTMENT_LABEL[resolved.department] : slug.replace(/-/g, " "));
  const defs = looksForShop(gender, slug).slice(0, 4);
  const [products, kits] = await Promise.all([
    getScopedShop({
      gender,
      department: resolved.department,
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
        stillForRoom(kit.products, resolved.department ?? department?.slug, named ?? resolved.subcategory) ??
        kit.image,
    }));
  const featured = products.filter((product) => product.available && product.images[0]).slice(0, 4);
  const label = gender === "women" ? "Women" : "Men";
  const field =
    ROOM_FIELD[department?.slug ?? "clothing"]?.[gender] ??
    (gender === "women" ? "field-vermillion" : "field-ink");
  const lookTitle = department?.slug === "shoes" ? "The pair. Then the outfit." : "Start with an outfit.";

  return (
    <div>
      <span className={`block h-1.5 ${field}`} />

      <section className="px-5 py-8 md:px-10 md:py-10">
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
            <h1 className="display mt-3 text-5xl md:text-6xl">{title}</h1>
            <p className="mt-3 max-w-md text-sm leading-6">{roomLine(department?.slug, title)}</p>
          </div>
          <p className="eyebrow">{products.length} pieces</p>
        </div>
      </section>

      <ShopRooms gender={gender} departments={rooms} active={slug} accent={field} />

      {featured.length > 0 ? (
        <section>
          <div className="flex items-end justify-between px-5 pt-8 pb-4 md:px-10">
            <p className="eyebrow">In this room</p>
            <p className="eyebrow">{featured.length} of {products.length}</p>
          </div>
          <CardGrid cols="four">
            {featured.map((product) => (
              <LinedShot
                key={product.id}
                href={`/product/${product.slug}`}
                image={product.images[0]}
                alt={`${product.brand} ${product.name}`}
                kicker={product.brand}
                title={product.name}
                meta={formatMoney(product.price)}
                priority
              />
            ))}
          </CardGrid>
        </section>
      ) : department?.image ? (
        <div className="packshot max-w-md">
          <Image
            src={department.image}
            alt={`${label} ${title}`}
            fill
            priority
            className="object-contain"
            sizes="50vw"
          />
        </div>
      ) : null}

      <ShopLooks looks={looks} title={lookTitle} />

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-8 md:px-10">
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
