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
      <RememberView product={product} />
      <JsonLd data={productJsonLd(product)} />

      <div
        className={`${product.gender === "women" ? "field-vermillion" : "field-ink"} px-5 py-3 md:px-8 2xl:px-16`}
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

      <div className="grid min-w-0 overflow-x-hidden lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] 2xl:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)] 3xl:grid-cols-[minmax(0,1fr)_minmax(720px,1fr)]">
        <ProductGallery images={product.images} alt={`${product.brand} ${product.name}`} />
        <div className="buy-panel min-w-0 border-l border-line px-5 py-10 lg:sticky lg:top-[67px] lg:h-fit lg:max-h-[calc(100dvh-67px)] lg:overflow-y-auto lg:px-8 lg:py-7 xl:top-[71px] xl:max-h-[calc(100dvh-71px)] 2xl:px-12 2xl:py-12 3xl:px-16 3xl:py-16">
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
