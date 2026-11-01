import Image from "next/image";
import Link from "next/link";
import { CardGrid } from "@/components/CardGrid";
import { Heart } from "@/components/Heart";
import { QuickBuy } from "@/components/QuickBuy";
import { formatMoney } from "@/lib/format";
import type { ProductCard as Card } from "@/lib/products";

export function ProductCard({
  product,
  index,
  dense = true,
  priority = false,
}: {
  product: Card;
  index?: string;
  dense?: boolean;
  priority?: boolean;
}) {
  const image = product.images[0];
  const sizes = dense
    ? "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
    : "(min-width: 768px) 50vw, 100vw";

  return (
    <article className="group">
      <div className="relative">
        <Link href={`/product/${product.slug}`} prefetch={false} className="block">
          <div className="packshot">
            {image ? (
              <Image
                src={image}
                alt={`${product.brand} ${product.name}`}
                fill
                sizes={sizes}
                priority={priority}
                className="object-contain"
              />
            ) : null}
            {product.images[1] ? (
              <Image
                src={product.images[1]}
                alt=""
                fill
                sizes={sizes}
                loading="lazy"
                className="object-contain opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
              />
            ) : null}
            {index ? (
              <span className="absolute top-3 left-3 eyebrow bg-paper px-2 py-1 text-ink">
                {index}
              </span>
            ) : null}
          </div>
        </Link>
        <Heart
          item={{
            handle: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image,
          }}
          className="absolute top-2 right-2 z-10 bg-white text-ink"
        />
        <QuickBuy product={product} className="absolute inset-x-3 bottom-3 z-10" />
      </div>
      <Link href={`/product/${product.slug}`} prefetch={false} className="block px-3 py-3 md:px-4">
        <p className="eyebrow">{index ? `${index} · ${product.brand}` : product.brand}</p>
        <h3 className="mt-1 text-[15px] leading-snug">{product.name}</h3>
        <p className="mt-1 text-[13px]">
          {product.compareAtPrice ? (
            <>
              <span className="mr-2 line-through opacity-50">{formatMoney(product.compareAtPrice)}</span>
              <span className="text-vermillion">{formatMoney(product.price)}</span>
            </>
          ) : (
            formatMoney(product.price)
          )}
        </p>
      </Link>
    </article>
  );
}

export function ProductRail({
  title,
  products,
  href,
}: {
  title: string;
  products: Card[];
  href?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between px-5 py-8 md:px-10">
        <h2 className="display text-3xl md:text-4xl">{title}</h2>
        {href ? (
          <Link href={href} className="eyebrow">
            View the full story
          </Link>
        ) : null}
      </div>
      <CardGrid>
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </CardGrid>
    </section>
  );
}
