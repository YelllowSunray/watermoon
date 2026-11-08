import { getAllBrands } from "@/lib/catalog";
import Link from "next/link";

export const revalidate = 900;

export const metadata = {
  title: "Brands",
  description: "Vendors in this shop.",
  alternates: { canonical: "/brands" },
};

function groupByLetter(brands: Awaited<ReturnType<typeof getAllBrands>>) {
  const groups = new Map<string, typeof brands>();
  for (const brand of brands) {
    const letter = (brand.name[0] ?? "#").toLocaleUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    const list = groups.get(key) ?? [];
    list.push(brand);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default async function BrandsPage() {
  const brands = await getAllBrands();
  const letters = groupByLetter(brands);

  return (
    <div>
      <section className="field-orange px-5 py-16 md:px-10 md:py-24">
        <p className="eyebrow">Brands</p>
        <h1 className="display mt-4 max-w-3xl text-5xl md:text-7xl">The names on the cloth.</h1>
      </section>

      {letters.length > 0 ? (
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="grid gap-12 md:grid-cols-3">
            {letters.map(([letter, named]) => (
              <div key={letter}>
                <p className="eyebrow mb-4">{letter}</p>
                <ul className="space-y-3">
                  {named.map((brand) => (
                    <li key={brand.slug}>
                      <Link href={`/brands/${brand.slug}`} className="display text-3xl md:text-4xl">
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="px-5 py-16 md:px-10">
          <p className="text-sm">No brands in this shop yet.</p>
        </section>
      )}
    </div>
  );
}
