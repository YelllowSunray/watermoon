import Link from "next/link";
import { notFound } from "next/navigation";
import { LookBand } from "@/components/LookBand";
import { LookShop } from "@/components/LookShop";
import { CardGrid } from "@/components/CardGrid";
import { ProductCard } from "@/components/ProductCard";
import { kitIndex } from "@/lib/kit";
import { LOOKS, getLook, getLookPreviews, getLookWithImage } from "@/lib/looks";
import { SPLASH_FIELD } from "@/lib/looks-data";
import { toCard } from "@/lib/products";

export const revalidate = 300;

export function generateStaticParams() {
  return LOOKS.map((look) => ({ slug: look.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const look = getLook(slug);
  if (!look) return { title: "Look" };
  return {
    title: look.title,
    description: look.line,
    alternates: { canonical: `/looks/${slug}` },
  };
}

export default async function LookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const look = getLook(slug);
  if (!look) notFound();

  const [{ products, image }, previews] = await Promise.all([
    getLookWithImage(look),
    getLookPreviews(
      LOOKS.filter((item) => item.slug !== look.slug).map((item) => item.slug),
    ),
  ]);
  if (products.length === 0) notFound();

  const others = [
    ...previews.filter((item) => item.gender === look.gender),
    ...previews.filter((item) => item.gender !== look.gender),
  ].slice(0, 4);

  return (
    <div>
      <LookBand look={look} products={products} image={image} hero cta={false} />
      <LookShop products={products} />
      <section>
        <div className="px-5 py-8 md:px-10">
          <p className="eyebrow">
            {look.gender === "women" ? "Women" : "Men"} · The pieces
          </p>
        </div>
        <CardGrid>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={toCard(product)} index={kitIndex(index)} />
          ))}
        </CardGrid>
      </section>
      {others.length > 0 ? (
        <section>
          <div className="flex items-end justify-between px-5 py-5 md:px-10">
            <p className="eyebrow">Also the looks</p>
            <Link href="/looks" className="eyebrow">
              All looks
            </Link>
          </div>
          <ul className="grid md:grid-cols-4">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/looks/${item.slug}`}
                  className={`${SPLASH_FIELD[item.splash]} flex min-h-[22vh] flex-col justify-end px-5 py-7`}
                >
                  <p className="eyebrow">
                    {item.gender === "women" ? "Women" : "Men"} · {item.count} pieces
                  </p>
                  <p className="display mt-2 text-2xl md:text-3xl">{item.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="px-5 py-10 text-center md:px-10">
          <Link href="/looks" className="cta-ghost">
            All looks
          </Link>
        </p>
      )}
    </div>
  );
}
