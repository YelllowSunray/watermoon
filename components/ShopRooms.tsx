import Link from "next/link";
import type { NavDepartment } from "@/lib/catalog-types";
import type { Gender } from "@/lib/products";

export function ShopRooms({
  gender,
  departments,
  active,
  accent = "field-ink",
  hrefFor,
}: {
  gender: Gender;
  departments: NavDepartment[];
  active?: string;
  accent?: string;
  hrefFor?: (slug: string) => string;
}) {
  if (departments.length === 0) return null;
  const href = (slug: string) => hrefFor?.(slug) ?? `/shop/${gender}/${slug}`;

  return (
    <div className="space-y-5 bg-ivory px-5 py-6 md:px-10">
      {departments.map((department) => {
        const items = [
          { slug: department.slug, name: `All ${department.name.toLowerCase()}` },
          ...department.categories,
        ];
        return (
          <div key={department.slug}>
            <p className="eyebrow mb-3">{department.name}</p>
            <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {items.map((item) => {
                const on = active === item.slug;
                return (
                  <li key={item.slug} className="shrink-0">
                    <Link
                      href={href(item.slug)}
                      className={`room-chip ${
                        on ? accent : "bg-white text-ink hover:bg-cobalt hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
