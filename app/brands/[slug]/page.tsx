import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopGrid } from "@/components/ShopGrid";
import {
  getAllBrands,
  getBrandBySlug,
  getProductsByBrand,
  roomsFromProducts,
  type GenderNav,
} from "@/lib/catalog";
import { getLookPreviews, looksForBrand } from "@/lib/looks";
import { SPLASH_FIELD, type LookSplash } from "@/lib/looks-data";
import { brandToSlug, isDepartment, isGender, toCard, type Gender, type Product } from "@/lib/products";

export const revalidate = 300;
export const dynamicParams = true;

const SPLASHES: LookSplash[] = [
  "orange",
  "cobalt",
  "violet",
  "ink",
  "vermillion",
  "chartreuse",
];

function brandSplash(slug: string): LookSplash {
  let n = 0;
  for (const char of slug) n += char.charCodeAt(0);
  return SPLASHES[n % SPLASHES.length];
}

function stillForGender(products: Product[], gender: Gender) {
  return products.find((product) => product.gender === gender && product.images[0])?.images[0];
}

export async function generateStaticParams() {
  const brands = await getAllBrands();
  return brands.slice(0, 24).map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return {
    title: brand?.name ?? "Brand",
    alternates: { canonical: `/brands/${slug}` },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gender?: string; room?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const lookDefs = looksForBrand(brand.slug);
  const [products, looks] = await Promise.all([
    getProductsByBrand(brand.name),
    getLookPreviews(lookDefs.map((look) => look.slug)),
  ]);
  const worlds = roomsFromProducts(products);
  const asked = isGender(query.gender ?? "") ? query.gender : undefined;
  const gender = asked ?? (worlds.length === 1 ? worlds[0].gender : undefined);
  const room = query.room?.trim() || undefined;
  const splash = brandSplash(brand.slug);
  const world = gender ? worlds.find((item) => item.gender === gender) : undefined;

  if (!gender || !world) {
    return (
      <BrandHouse
        brand={brand}
        splash={splash}
        worlds={worlds}
        products={products}
        looks={looks}
      />
    );
  }

  const listed = products.filter((product) => {
    if (product.gender !== gender) return false;
    if (!room) return true;
    if (isDepartment(room)) return product.department === room;
    return brandToSlug(product.subcategory) === room;
  });
  const rooms = [
    { slug: "", name: "All" },
    ...world.departments.flatMap((department) => [
      { slug: department.slug, name: department.name },
      ...department.categories,
    ]),
  ];
  const accent = gender === "women" ? "field-vermillion" : "field-ink";
  const floorLooks = looks.filter((look) => look.gender === gender).slice(0, 4);
  const roomName = room
    ? rooms.find((item) => item.slug === room)?.name ?? room.replace(/-/g, " ")
    : "All";

  return (
    <div>
      <span className={`block h-1.5 ${SPLASH_FIELD[splash]}`} />
      <section className="px-5 py-8 md:px-10 md:py-10">
        <p className="eyebrow">
          <Link href="/brands">Brands</Link>
          {" · "}
          <Link href={`/brands/${brand.slug}`}>{brand.name}</Link>
          {" · "}
          {world.label}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-5xl md:text-6xl">{brand.name}</h1>
          <p className="eyebrow">
            {listed.length} {listed.length === 1 ? "piece" : "pieces"}
            {room ? ` · ${roomName}` : ""}
          </p>
        </div>
      </section>

      <div className="bg-ivory px-5 py-6 md:px-10">
        {worlds.length > 1 ? (
          <ul className="mb-5 flex flex-wrap gap-2">
            {worlds.map((item) => {
              const on = item.gender === gender;
              return (
                <li key={item.gender}>
                  <Link
                    href={`/brands/${brand.slug}?gender=${item.gender}`}
                    className={`room-chip ${on ? accent : "bg-white text-ink hover:bg-cobalt hover:text-white"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="eyebrow mb-3">Rooms</p>
        <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {rooms.map((item) => {
            const on = item.slug === (room ?? "");
            return (
              <li key={item.slug || "all"} className="shrink-0">
                <Link
                  href={
                    item.slug
                      ? `/brands/${brand.slug}?gender=${gender}&room=${item.slug}`
                      : `/brands/${brand.slug}?gender=${gender}`
                  }
                  className={`room-chip ${on ? accent : "bg-white text-ink hover:bg-cobalt hover:text-white"}`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {listed.length > 0 ? (
        <ShopGrid products={listed.map(toCard)} dense />
      ) : (
        <p className="px-5 py-10 text-sm md:px-10">Nothing available in this room.</p>
      )}

      <BrandLooks looks={floorLooks} />
    </div>
  );
}

function BrandHouse({
  brand,
  splash,
  worlds,
  products,
  looks,
}: {
  brand: { name: string; slug: string };
  splash: LookSplash;
  worlds: GenderNav[];
  products: Product[];
  looks: Awaited<ReturnType<typeof getLookPreviews>>;
}) {
  const count = products.length;

  return (
    <div>
      <span className={`block h-1.5 ${SPLASH_FIELD[splash]}`} />
      <section className="px-5 py-8 md:px-10 md:py-10">
        <p className="eyebrow">
          <Link href="/brands">Brands</Link>
        </p>
        <h1 className="display mt-3 text-5xl md:text-7xl">{brand.name}</h1>
        <p className="eyebrow mt-5">
          {count} {count === 1 ? "piece" : "pieces"}
          {worlds.length > 1 ? " · Women and men" : worlds[0] ? ` · ${worlds[0].label}` : ""}
        </p>
      </section>

      {worlds.length > 0 ? (
        <section className="card-grid grid-cols-1 md:grid-cols-2">
          {worlds.map((world) => {
            const pieces = products.filter((product) => product.gender === world.gender);
            const still = stillForGender(products, world.gender);
            return (
              <Link
                key={world.gender}
                href={`/brands/${brand.slug}?gender=${world.gender}`}
                className="group grid md:grid-cols-2"
              >
                <div className="packshot">
                  {still ? (
                    <Image
                      src={still}
                      alt={`${brand.name} ${world.label}`}
                      fill
                      priority
                      className="object-contain transition-opacity duration-200 ease-out group-hover:opacity-80"
                      sizes="25vw"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-end px-5 py-8 md:px-8">
                  <p className="eyebrow">
                    {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
                  </p>
                  <p className="display mt-2 text-4xl md:text-5xl">{world.label}</p>
                  <span className="cta-ghost mt-6 self-start">Shop {world.label.toLowerCase()}</span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <p className="px-5 py-10 text-sm md:px-10">Nothing available in this house.</p>
      )}

      <BrandLooks looks={looks.slice(0, 4)} />
    </div>
  );
}

function BrandLooks({
  looks,
}: {
  looks: Awaited<ReturnType<typeof getLookPreviews>>;
}) {
  if (looks.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between px-5 py-8 md:px-10">
        <p className="eyebrow">Shop the look</p>
        <Link href="/looks" className="eyebrow">
          All looks
        </Link>
      </div>
      <ul
        className={`grid ${
          looks.length === 1 ? "" : looks.length === 2 ? "md:grid-cols-2" : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {looks.map((look) => (
          <li key={look.slug}>
            <Link href={`/looks/${look.slug}`} className={`${SPLASH_FIELD[look.splash]} flex h-full flex-col`}>
              <div className="p-4 md:p-5">
                <div className="still">
                  {look.image ? (
                    <Image src={look.image} alt="" fill className="object-contain" sizes="25vw" />
                  ) : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-end px-5 pb-6">
                <p className="eyebrow">
                  {look.gender === "women" ? "Women" : "Men"} · {look.count} pieces
                </p>
                <p className="display mt-2 text-2xl md:text-3xl">{look.title}</p>
                <p className="mt-2 line-clamp-2 max-w-xs text-sm">{look.line}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
