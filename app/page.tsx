import Image from "next/image";
import Link from "next/link";
import { ContinueRow } from "@/components/ContinueRow";
import { JsonLd } from "@/components/JsonLd";
import { LookBand } from "@/components/LookBand";
import { NewsletterForm } from "@/components/NewsletterForm";
import { StoryTiles } from "@/components/StoryTiles";
import { getGenderNavigation, getTopBrands } from "@/lib/catalog";
import { getHomeKits, homeLooks } from "@/lib/looks";
import { SPLASH_FIELD, type LookSplash } from "@/lib/looks-data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getStoryPreviews, homeStories } from "@/lib/stories";
import { SITE_NAME } from "@/lib/site";

const DOOR_SPLASH: LookSplash[] = [
  "vermillion",
  "cobalt",
  "violet",
  "ink",
  "orange",
  "chartreuse",
];

export const revalidate = 300;

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const featuredLooks = homeLooks();
  const usedHandles = new Set(featuredLooks.map((look) => look.heroHandle));
  const storyDefs = homeStories().filter((story) => !usedHandles.has(story.heroHandle));

  const [stories, brands, nav, kits] = await Promise.all([
    getStoryPreviews(storyDefs.map((story) => story.slug)),
    getTopBrands(),
    getGenderNavigation(),
    getHomeKits(3),
  ]);

  const first = kits[0];
  const second = kits[1];
  const third = kits[2];
  const street = brands;
  const womenDoors = nav.find((item) => item.gender === "women")?.departments.slice(0, 3) ?? [];
  const menDoors = nav.find((item) => item.gender === "men")?.departments.slice(0, 3) ?? [];
  const doors = [
    ...womenDoors.map((department) => ({ ...department, gender: "women" as const })),
    ...menDoors.map((department) => ({ ...department, gender: "men" as const })),
  ];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      {first ? (
        <LookBand
          look={first.look}
          products={first.products}
          image={first.image}
          kicker={`${SITE_NAME} · Look 01`}
          headline="Shop the look. Not the dump."
          line={`${first.look.title}. ${first.look.line}`}
          hero
        />
      ) : null}

      <section>
        <div className="px-5 py-10 md:px-10">
          <p className="eyebrow">The edit</p>
        </div>
        <StoryTiles stories={stories} large />
      </section>

      {second ? (
        <LookBand
          look={second.look}
          products={second.products}
          image={second.image}
          kicker="Look 02"
        />
      ) : null}

      {street.length > 0 ? (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 field-orange px-5 py-8 md:px-10">
            <div>
              <p className="eyebrow">Brands</p>
              <p className="display mt-2 text-4xl md:text-6xl">The names on the cloth.</p>
            </div>
            <Link href="/brands" className="cta shrink-0">
              All brands
            </Link>
          </div>
          <ul className="field-ink flex flex-wrap gap-x-8 gap-y-4 px-5 py-12 md:px-10">
            {street.map((brand) => (
              <li key={brand.slug}>
                <Link href={`/brands/${brand.slug}`} className="display text-3xl md:text-5xl">
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {third ? (
        <LookBand
          look={third.look}
          products={third.products}
          image={third.image}
          kicker="Look 03 · Men"
        />
      ) : null}

      <section className="grid md:grid-cols-4">
        <Link href="/women" className="field-vermillion flex min-h-[28vh] flex-col justify-end px-6 py-10">
          <p className="eyebrow">World</p>
          <p className="display mt-3 text-4xl md:text-5xl">Women</p>
        </Link>
        <Link href="/men" className="field-ink flex min-h-[28vh] flex-col justify-end px-6 py-10">
          <p className="eyebrow">World</p>
          <p className="display mt-3 text-4xl md:text-5xl">Men</p>
        </Link>
        <Link href="/looks" className="field-chartreuse flex min-h-[28vh] flex-col justify-end px-6 py-10">
          <p className="eyebrow">Shop the look</p>
          <p className="display mt-3 text-4xl md:text-5xl">Looks</p>
        </Link>
        <Link href="/stories" className="field-violet flex min-h-[28vh] flex-col justify-end px-6 py-10">
          <p className="eyebrow">World</p>
          <p className="display mt-3 text-4xl md:text-5xl">The edit</p>
        </Link>
      </section>

      {doors.length > 0 ? (
        <section>
          <div className="px-5 py-10 md:px-10">
            <h2 className="display text-3xl md:text-5xl">The doors</h2>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {doors.map((department, index) => {
              const field = SPLASH_FIELD[DOOR_SPLASH[index] ?? "ink"];
              const label = department.gender === "women" ? "Women" : "Men";
              return (
                <li key={`${department.gender}-${department.slug}`}>
                  <Link href={`/shop/${department.gender}/${department.slug}`} className={`group flex h-full flex-col ${field}`}>
                    <div className="p-4 md:p-5">
                      <div className="still">
                        {department.image ? (
                          <Image
                            src={department.image}
                            alt={`${label} ${department.name}`}
                            fill
                            className="object-contain"
                            sizes="16vw"
                          />
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-end px-4 pb-5">
                      <p className="eyebrow">{label}</p>
                      <p className="display mt-1 text-2xl md:text-3xl">{department.name}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <Link
        href="/sale"
        className="field-vermillion flex items-center justify-between gap-6 px-5 py-8 md:px-10"
      >
        <div>
          <p className="eyebrow">Sale</p>
          <p className="display mt-2 text-3xl md:text-5xl">The cut.</p>
        </div>
        <span className="cta-splash shrink-0">Shop sale</span>
      </Link>

      <ContinueRow />

      <section className="field-cobalt px-5 py-16 md:px-10">
        <p className="eyebrow">Notes</p>
        <p className="display mt-3 mb-8 max-w-lg text-4xl">Leave an address. We write rarely.</p>
        <NewsletterForm />
      </section>
    </>
  );
}
