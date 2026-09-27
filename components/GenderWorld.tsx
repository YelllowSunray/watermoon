import Image from "next/image";
import Link from "next/link";
import { LookBand } from "@/components/LookBand";
import { ShopGrid } from "@/components/ShopGrid";
import type { NavDepartment } from "@/lib/catalog-types";
import { SPLASH_FIELD, type LookDefinition, type LookSplash } from "@/lib/looks-data";
import { toCard, type Gender, type Product } from "@/lib/products";
import { RETURNS_DAYS } from "@/lib/site";
import type { StoryPreview } from "@/lib/stories-data";

export type GenderLook = {
  slug: string;
  title: string;
  line: string;
  splash: LookSplash;
  count: number;
  image?: string;
};

export type GenderKit = {
  look: LookDefinition;
  products: Product[];
  image?: string;
};

const DOOR_SPLASH: Record<Gender, LookSplash[]> = {
  women: ["vermillion", "cobalt", "ink"],
  men: ["ink", "cobalt", "orange"],
};

function streetCols(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-3";
  if (count === 5) return "grid-cols-5";
  if (count === 6) return "grid-cols-3";
  if (count === 9) return "grid-cols-3";
  if (count === 10) return "grid-cols-5";
  return "grid-cols-2 md:grid-cols-4";
}

export function GenderWorld({
  gender,
  headline,
  departments,
  kits,
  stories,
  products,
}: {
  gender: Gender;
  headline: string;
  departments: NavDepartment[];
  kits: GenderKit[];
  stories: StoryPreview[];
  products: Product[];
}) {
  const her = gender === "women";
  const label = her ? "Women" : "Men";
  const splash = her ? "field-vermillion" : "field-ink";
  const kit = kits[0];
  const looks: GenderLook[] = kits.slice(1).map((item) => ({
    slug: item.look.slug,
    title: item.look.title,
    line: item.look.line,
    splash: item.look.splash,
    count: item.products.length,
    image: item.image,
  }));
  const clothing = departments.find((department) => department.slug === "clothing");
  const shown = products.filter((product) => product.available).slice(0, 8);

  return (
    <div>
      {kit ? (
        <LookBand
          look={kit.look}
          products={kit.products}
          image={kit.image}
          kicker={`${label} · Shop the look`}
          headline={headline}
          line={`${kit.look.title}. ${kit.look.line}`}
          hero
        />
      ) : (
        <section className={`${splash} px-5 py-8 md:px-10 md:py-16`}>
          <p className="eyebrow">{label}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl md:text-7xl">{headline}</h1>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/looks" className="cta-splash">
              Shop the look
            </Link>
            {clothing ? (
              <Link
                href={`/shop/${gender}/clothing`}
                className="inline-flex min-h-12 items-center border border-white px-5 text-xs tracking-[0.08em] uppercase"
              >
                Shop clothing
              </Link>
            ) : null}
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6">
            Ships to the Netherlands. Returns within {RETURNS_DAYS} days.
          </p>
        </section>
      )}

      {looks.length > 0 ? (
        <section>
          <div className="flex items-end justify-between px-5 py-8 md:px-10">
            <p className="eyebrow">{label} · More looks</p>
            <Link href="/looks" className="eyebrow">
              All looks
            </Link>
          </div>
          {looks.length === 1 ? (
            <LookTile look={looks[0]} gender={gender} wide />
          ) : (
            <ul className={`grid ${streetCols(looks.length)}`}>
              {looks.map((look) => (
                <li key={look.slug} className="min-h-0">
                  <LookTile look={look} gender={gender} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {departments.length > 0 ? (
        <section>
          <div className="px-5 py-8 md:px-10">
            <h2 className="display text-3xl md:text-5xl">The doors</h2>
          </div>
          <ul className="grid md:grid-cols-3">
            {departments.slice(0, 3).map((department, index) => {
              const field = SPLASH_FIELD[DOOR_SPLASH[gender][index] ?? "ink"];
              return (
                <li key={department.slug}>
                  <Link href={`/shop/${gender}/${department.slug}`} className="group block">
                    <div className={`${field} p-5 md:p-8`}>
                      <div className="still">
                        {department.image ? (
                          <Image
                            src={department.image}
                            alt={`${label} ${department.name}`}
                            fill
                            className="object-contain"
                            sizes="33vw"
                          />
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={`${field} flex min-h-[18vh] flex-col justify-end px-5 py-6 md:min-h-[24vh] md:px-8`}
                    >
                      <p className="eyebrow">{label}</p>
                      <p className="display mt-2 text-3xl md:text-5xl">{department.name}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {departments.some((department) => department.categories.length > 0) ? (
        <section className="field-ink px-5 py-12 md:px-10 md:py-16">
          <h2 className="display text-3xl md:text-5xl">The rooms</h2>
          <div className="mt-10 grid gap-12 md:grid-cols-3">
            {departments.map((department) => (
              <div key={department.slug}>
                <p className="eyebrow mb-4">
                  <Link href={`/shop/${gender}/${department.slug}`}>
                    {label} · {department.name}
                  </Link>
                </p>
                <ul className="space-y-3">
                  {department.categories.map((category) => (
                    <li key={category.slug}>
                      <Link href={`/shop/${gender}/${category.slug}`} className="display text-3xl md:text-4xl">
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {stories.length > 0 ? (
        <section>
          <div className="flex items-end justify-between px-5 py-8 md:px-10">
            <p className="eyebrow">{label} · The edit</p>
            <Link href="/stories" className="eyebrow">
              All rooms
            </Link>
          </div>
          <ul className={`grid ${streetCols(stories.length)}`}>
            {stories.map((story) => (
              <li key={story.slug} className="min-h-0">
                <Link href={`/stories/${story.slug}`} className={`${SPLASH_FIELD[story.splash]} flex h-full flex-col`}>
                  <div className="p-4 md:p-5">
                    <div className="still">
                      {story.image ? (
                        <Image src={story.image} alt="" fill className="object-contain" sizes="25vw" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-end px-5 pb-6">
                    <p className="display text-2xl md:text-3xl">{story.title}</p>
                    <p className="mt-1 line-clamp-2 max-w-xs text-sm">{story.line}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {shown.length > 0 ? (
        <section>
          <div className="flex items-end justify-between px-5 py-8 md:px-10">
            <p className="eyebrow">{label} · The pieces</p>
            {clothing ? (
              <Link href={`/shop/${gender}/clothing`} className="eyebrow">
                More {label.toLowerCase()}
              </Link>
            ) : null}
          </div>
          <ShopGrid products={shown.map(toCard)} dense />
        </section>
      ) : null}

      <Link
        href={`/sale?gender=${gender}`}
        className="field-vermillion flex items-center justify-between gap-6 px-5 py-8 md:px-10"
      >
        <div>
          <p className="eyebrow">Sale</p>
          <p className="display mt-2 text-3xl md:text-5xl">The cut.</p>
        </div>
        <span className="cta-splash shrink-0">Shop sale</span>
      </Link>
    </div>
  );
}

function LookTile({
  look,
  gender,
  wide = false,
}: {
  look: GenderLook;
  gender: Gender;
  wide?: boolean;
}) {
  const label = gender === "women" ? "Women" : "Men";
  const field = SPLASH_FIELD[look.splash];

  if (wide) {
    return (
      <Link href={`/looks/${look.slug}`} className={`group grid md:grid-cols-2 ${field}`}>
        <div className="p-5 md:p-8">
          <div className="still">
            {look.image ? (
              <Image src={look.image} alt="" fill className="object-contain" sizes="50vw" />
            ) : null}
          </div>
        </div>
        <div className="flex min-h-[28vh] flex-col justify-end px-5 py-8 md:px-10">
          <p className="eyebrow">
            {label} · {look.count} pieces
          </p>
          <p className="display mt-3 text-4xl md:text-6xl">{look.title}</p>
          <p className="mt-3 max-w-md text-sm leading-6">{look.line}</p>
          <span className="cta-splash mt-6 self-start">Shop this look</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/looks/${look.slug}`} className={`${field} flex h-full flex-col`}>
      <div className="p-4 md:p-5">
        <div className="still">
          {look.image ? (
            <Image src={look.image} alt="" fill className="object-contain" sizes="25vw" />
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end px-5 pb-6">
        <p className="eyebrow">{look.count} pieces</p>
        <p className="display mt-2 text-2xl md:text-3xl">{look.title}</p>
      </div>
    </Link>
  );
}
