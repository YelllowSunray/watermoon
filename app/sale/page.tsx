import Link from "next/link";
import { ShopGrid } from "@/components/ShopGrid";
import { getSaleProducts, roomsFromProducts } from "@/lib/catalog";
import { brandToSlug, isDepartment, isGender, toCard, type Gender } from "@/lib/products";

export const revalidate = 300;

export const metadata = {
  title: "Sale",
  description: "Pieces with a second price.",
  alternates: { canonical: "/sale" },
};

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; room?: string }>;
}) {
  const query = await searchParams;
  const rawGender = query.gender ?? "";
  const gender = isGender(rawGender) ? rawGender : undefined;
  const room = query.room?.trim() || undefined;
  const products = await getSaleProducts(48);
  const worlds = roomsFromProducts(products);
  const shownWorlds = gender ? worlds.filter((world) => world.gender === gender) : worlds;
  const listed = products.filter((product) => {
    if (gender && product.gender !== gender) return false;
    if (!room) return true;
    if (isDepartment(room)) return product.department === room;
    return brandToSlug(product.subcategory) === room;
  });

  return (
    <div>
      <section className="field-vermillion px-5 py-12 md:px-10 md:py-16">
        <p className="eyebrow">Sale</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">The cut. Still edited.</h1>
        <p className="mt-4 max-w-md text-sm leading-6">
          {listed.length} {listed.length === 1 ? "piece" : "pieces"}
          {gender ? ` · ${gender === "women" ? "Women" : "Men"}` : ""}
          {room ? ` · ${room.replace(/-/g, " ")}` : ""}. A second price. Same cloth.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {gender || room ? (
            <Link
              href="/sale"
              className="inline-flex min-h-12 items-center border border-white px-5 text-xs tracking-[0.08em] uppercase"
            >
              All sale
            </Link>
          ) : null}
          {worlds.map((world) => {
            const on = gender === world.gender && !room;
            return (
              <Link
                key={world.gender}
                href={`/sale?gender=${world.gender}`}
                className={`inline-flex min-h-12 items-center px-5 text-xs tracking-[0.08em] uppercase ${
                  on ? "field-ink" : "border border-white"
                }`}
              >
                {world.label}
              </Link>
            );
          })}
        </div>
      </section>

      {shownWorlds.map((world) => (
        <SaleRooms key={world.gender} world={world} gender={gender} room={room} />
      ))}

      <section>
        <div className="px-5 py-8 md:px-10">
          <p className="eyebrow">The pieces</p>
        </div>
        <ShopGrid products={listed.map(toCard)} dense />
      </section>
    </div>
  );
}

function SaleRooms({
  world,
  gender,
  room,
}: {
  world: { gender: Gender; label: string; departments: Array<{ slug: string; name: string; categories: Array<{ slug: string; name: string }> }> };
  gender?: Gender;
  room?: string;
}) {
  const her = world.gender === "women";
  const href = (next: string) => `/sale?gender=${world.gender}&room=${next}`;

  return (
    <section className="bg-ivory px-5 py-6 md:px-10">
      <p className={`display mb-4 text-3xl ${her ? "text-vermillion" : ""}`}>{world.label}</p>
      {world.departments.map((department) => (
        <div key={department.slug} className="mb-5 last:mb-0">
          <p className="eyebrow mb-3">
            {world.label} · {department.name}
          </p>
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            <li className="shrink-0">
              <Link
                href={href(department.slug)}
                className={`room-chip ${
                  gender === world.gender && room === department.slug
                    ? her
                      ? "field-vermillion"
                      : "field-ink"
                    : "bg-white text-ink hover:bg-cobalt hover:text-white"
                }`}
              >
                All {department.name.toLowerCase()}
              </Link>
            </li>
            {department.categories.map((category) => (
              <li key={category.slug} className="shrink-0">
                <Link
                  href={href(category.slug)}
                  className={`room-chip ${
                    gender === world.gender && room === category.slug
                      ? her
                        ? "field-vermillion"
                        : "field-ink"
                      : "bg-white text-ink hover:bg-cobalt hover:text-white"
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
