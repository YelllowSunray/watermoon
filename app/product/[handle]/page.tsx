import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { LookBand } from "@/components/LookBand";
import { ProductBuy } from "@/components/ProductBuy";
import { CardGrid } from "@/components/CardGrid";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { RememberView } from "@/components/RememberView";
import { getNewestProducts, getProduct } from "@/lib/catalog";
import { kitIndex } from "@/lib/kit";
import { getCompleteTheLook, getSimilarProducts } from "@/lib/look";
import { getLookWithImage } from "@/lib/looks";
import { lookForHandle } from "@/lib/looks-data";
import { toCard } from "@/lib/products";
import { productJsonLd } from "@/lib/seo";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const newest = await getNewestProducts(48);
  return newest.map((product) => ({ handle: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product" };
  return {
    title: `${product.brand} ${product.name}`,
    description: product.description,
    alternates: { canonical: `/product/${handle}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const named = lookForHandle(product.slug);
  const [look, similar, kit] = await Promise.all([
    getCompleteTheLook(product, 3),
    getSimilarProducts(product, 4),
    named ? getLookWithImage(named) : Promise.resolve(undefined),
  ]);

  const namedLook = kit && kit.products.length >= 2 ? kit : undefined;
  const extras = namedLook
    ? look.filter((item) => !namedLook.products.some((piece) => piece.id === item.id))
    : look;
  const world = product.gender === "women" ? "Women" : "Men";

  return (
    <article>
      <RememberView handle={product.slug} name={product.name} price={product.price} />
      <JsonLd data={productJsonLd(product)} />

      <div
        className={`${product.gender === "women" ? "field-vermillion" : "field-ink"} px-5 py-3 md:px-8`}
      >
        <p className="eyebrow">
          <Link href={`/${product.gender}`}>{world}</Link>
          <span className="mx-2 opacity-50">·</span>
          <Link href={`/shop/${product.gender}/${product.department}`}>
            {product.department}
          </Link>
          <span className="mx-2 opacity-50">·</span>
          {product.brand}
        </p>
      </div>

      <div className="grid min-w-0 overflow-x-hidden md:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <ProductGallery images={product.images} alt={`${product.brand} ${product.name}`} />
        <div className="min-w-0 border-l border-line px-5 py-10 md:sticky md:top-[4.75rem] md:h-fit md:max-h-[calc(100dvh-4.75rem)] md:overflow-y-auto md:px-10 md:py-14">
          <ProductBuy product={product} />
        </div>
      </div>

      {namedLook ? (
        <LookBand
          look={namedLook.look}
          products={namedLook.products}
          image={namedLook.image}
          kicker="Shop the look"
          headline={namedLook.look.title}
          line={namedLook.look.line}
        />
      ) : extras.length > 0 ? (
        <section>
          <div className="field-cobalt px-5 py-12 md:px-10">
            <p className="eyebrow">Shop the look</p>
            <p className="display mt-3 max-w-2xl text-5xl">This piece. Then the rest of the day.</p>
          </div>
          <CardGrid>
            {extras.map((item, index) => (
              <ProductCard key={item.id} product={toCard(item)} index={kitIndex(index)} />
            ))}
          </CardGrid>
        </section>
      ) : (
        <section className="field-cobalt px-5 py-14 md:px-10">
          <p className="eyebrow">Shop the look</p>
          <p className="display mt-3 max-w-2xl text-5xl">The outfit. Then the pieces.</p>
          <Link href="/looks" className="cta-splash mt-8 inline-flex">
            All looks
          </Link>
        </section>
      )}

      {extras.length > 0 && namedLook ? (
        <section>
          <div className="px-5 py-8 md:px-10">
            <p className="eyebrow">Also with this</p>
          </div>
          <CardGrid>
            {extras.map((item, index) => (
              <ProductCard key={item.id} product={toCard(item)} index={kitIndex(index)} />
            ))}
          </CardGrid>
        </section>
      ) : null}

      {similar.length > 0 ? (
        <section>
          <div className="px-5 py-8 md:px-10">
            <p className="eyebrow">Similar</p>
            <p className="display mt-3 max-w-xl text-4xl">Same room. Different piece.</p>
          </div>
          <CardGrid>
            {similar.map((item) => (
              <ProductCard key={item.id} product={toCard(item)} />
            ))}
          </CardGrid>
        </section>
      ) : (
        <section className="border-t border-line px-5 py-16 md:px-10">
          <p className="eyebrow">Similar</p>
          <Link href={`/shop/${product.gender}/${product.department}`} className="display mt-3 block text-4xl">
            More {product.department}
          </Link>
        </section>
      )}
    </article>
  );
}
