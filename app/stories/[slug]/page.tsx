import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardGrid } from "@/components/CardGrid";
import { ProductCard } from "@/components/ProductCard";
import { QuickBuy } from "@/components/QuickBuy";
import { LOOKS, SPLASH_FIELD } from "@/lib/looks-data";
import { getLookPreviews } from "@/lib/looks";
import { toCard, type Product } from "@/lib/products";
import { getStory, getStoryPreviews, getStoryWithImage, STORIES } from "@/lib/stories";

export const revalidate = 300;

export function generateStaticParams() {
  return STORIES.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return { title: "Story" };
  return {
    title: story.title,
    description: story.line,
    alternates: { canonical: `/stories/${slug}` },
  };
}

function looksForStory(products: Product[]) {
  const handles = new Set(products.map((product) => product.slug));
  return LOOKS.filter(
    (look) => handles.has(look.heroHandle) || look.handles.some((handle) => handles.has(handle)),
  ).slice(0, 2);
}

function worldLabel(products: Product[]) {
  const worlds = [...new Set(products.map((product) => product.gender))];
  if (worlds.length === 1) return worlds[0] === "women" ? "Women" : "Men";
  return null;
}

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ all?: string }>;
}) {
  const { slug } = await params;
  const { all } = await searchParams;
  const story = getStory(slug);
  if (!story) notFound();

  const { products, image, hero } = await getStoryWithImage(story);
  const otherSlugs = STORIES.filter((item) => item.slug !== story.slug)
    .slice(0, 4)
    .map((item) => item.slug);
  const [lookPreviews, others] = await Promise.all([
    getLookPreviews(looksForStory(products).map((look) => look.slug)),
    getStoryPreviews(otherSlugs),
  ]);
  const showAll = all === "1";
  const featured = products.slice(0, 4);
  const rest = showAll ? products.slice(4) : products.slice(4, 12);
  const world = worldLabel(products);

  return (
    <div>
      <section className={SPLASH_FIELD[story.splash]}>
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-between px-5 py-10 md:px-10 md:py-14">
            <div>
              <p className="eyebrow">The edit · {story.title}</p>
              <h1 className="display mt-3 max-w-xl text-4xl md:text-6xl">{story.line}</h1>
              <p className="deck mt-5 max-w-sm">
                {products.length} {products.length === 1 ? "piece" : "pieces"}
                {world ? ` · ${world}` : ""}. A room from this shop. Not a feed.
              </p>
            </div>
            {hero ? (
              <div className="mt-10 flex flex-wrap gap-2">
                <Link href={`/product/${hero.slug}`} className="cta-splash">
                  Shop {hero.brand}
                </Link>
                <a
                  href="#room"
                  className="inline-flex min-h-12 items-center border border-white px-5 text-xs tracking-[0.08em] uppercase"
                >
                  The room
                </a>
              </div>
            ) : null}
          </div>
          {image ? (
            <div className="relative bg-white md:min-h-[28rem]">
              {hero ? (
                <>
                  <Link href={`/product/${hero.slug}`} className="block h-full">
                    <div className="relative aspect-square overflow-hidden bg-white md:absolute md:inset-0 md:aspect-auto">
                      <Image
                        src={image}
                        alt={`${hero.brand} ${hero.name}`}
                        fill
                        priority
                        className="object-contain"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  </Link>
                  <QuickBuy product={hero} className="absolute inset-x-3 bottom-3 z-10" />
                </>
              ) : (
                <div className="relative aspect-square overflow-hidden bg-white">
                  <Image src={image} alt="" fill priority className="object-contain" sizes="50vw" />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {featured.length > 0 ? (
        <section>
          <div className="px-5 py-8 md:px-10">
            <p className="eyebrow">{story.title} · Open with</p>
          </div>
          <CardGrid>
            {featured.map((product) => (
              <ProductCard key={product.id} product={toCard(product)} />
            ))}
          </CardGrid>
        </section>
      ) : null}

      <section id="room">
        {rest.length > 0 ? (
          <>
            <div className="px-5 py-8 md:px-10">
              <p className="eyebrow">{story.title} · The pieces</p>
            </div>
            <CardGrid>
              {rest.map((product) => (
                <ProductCard key={product.id} product={toCard(product)} />
              ))}
            </CardGrid>
          </>
        ) : null}
        {!showAll && products.length > 12 ? (
          <p className="px-5 py-10 text-center md:px-10">
            <Link href={`/stories/${story.slug}?all=1`} className="cta">
              View the full story
            </Link>
          </p>
        ) : null}
      </section>

      {lookPreviews.length > 0 ? (
        <ul className="grid md:grid-cols-2">
          {lookPreviews.map((look) => (
            <li key={look.slug}>
              <Link
                href={`/looks/${look.slug}`}
                className={`${SPLASH_FIELD[look.splash]} flex min-h-[28vh] flex-col justify-end px-6 py-8`}
              >
                <p className="eyebrow">
                  {look.gender === "women" ? "Women" : "Men"} · Shop the look · {look.count} pieces
                </p>
                <p className="display mt-3 text-3xl md:text-5xl">{look.title}</p>
                <p className="deck mt-3 max-w-sm">{look.line}</p>
                <span className="cta-splash mt-6 self-start">Shop this look</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {others.length > 0 ? (
        <section>
          <div className="flex items-end justify-between px-5 py-5 md:px-10">
            <p className="eyebrow">Also the edit</p>
            <Link href="/stories" className="eyebrow">
              All rooms
            </Link>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-4">
            {others.map((item) => (
              <li key={item.slug} className="min-h-0">
                <Link
                  href={`/stories/${item.slug}`}
                  className={`${SPLASH_FIELD[item.splash]} flex aspect-square h-full flex-col justify-end px-5 py-6 md:px-6 md:py-7`}
                >
                  <p className="eyebrow">{item.title}</p>
                  <p className="display mt-2 line-clamp-3 text-2xl md:text-3xl">{item.line}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
