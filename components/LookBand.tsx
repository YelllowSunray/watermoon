"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "@/components/Heart";
import { SPLASH_FIELD, type LookDefinition } from "@/lib/looks-data";
import { formatMoney } from "@/lib/format";
import { kitPieces, kitTotal } from "@/lib/kit";
import type { Product } from "@/lib/products";

export function LookBand({
  look,
  products,
  image,
  kicker,
  headline,
  line,
  hero = false,
  cta = true,
}: {
  look: LookDefinition;
  products: Product[];
  image?: string;
  kicker?: string;
  headline?: string;
  line?: string;
  hero?: boolean;
  cta?: boolean;
  layout?: string;
}) {
  const pieces = kitPieces(products);
  const total = kitTotal(products);
  const [active, setActive] = useState(0);
  const shown = pieces[active] ?? pieces[0];
  const still = shown?.product.images[0] ?? image;
  const title = headline ?? look.title;
  const dek = line ?? look.line;
  const over = kicker ?? `${look.gender === "women" ? "Women" : "Men"} · Shop the look`;
  const thumbs = pieces.slice(0, 4);

  return (
    <section className={`relative z-0 overflow-hidden ${SPLASH_FIELD[look.splash]}`}>
      <div className="grid items-stretch md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col justify-between px-5 py-10 md:px-10 md:py-14">
          <div>
            <p className="eyebrow">{over}</p>
            {hero ? (
              <h1 className="display mt-4 max-w-xl text-5xl md:text-7xl">{title}</h1>
            ) : (
              <h2 className="display mt-4 max-w-xl text-4xl md:text-6xl">{title}</h2>
            )}
            <p className="mt-4 max-w-sm text-sm leading-6">{dek}</p>
          </div>
          <ol className={`mt-8 grid gap-2 ${thumbs.length > 3 ? "grid-cols-4" : "grid-cols-3"}`}>
            {thumbs.map((piece, index) => {
              const thumb = piece.product.images[0];
              return (
                <li key={piece.product.id}>
                  <Link
                    href={`/product/${piece.product.slug}`}
                    className="block w-full text-left"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                  >
                    <div className={`still ${active === index ? "ring-2 ring-current" : ""}`}>
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={`${piece.index} ${piece.role}`}
                          fill
                          className="object-contain"
                          sizes="15vw"
                        />
                      ) : null}
                      <span className="absolute top-2 left-2 eyebrow bg-white px-1.5 py-0.5 text-ink">
                        {piece.index}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
          <ol className="mt-6 space-y-2">
            {pieces.map((piece, index) => (
              <li key={piece.product.id}>
                <Link
                  href={`/product/${piece.product.slug}`}
                  className={`flex w-full items-baseline justify-between gap-4 text-left text-sm ${
                    active === index ? "opacity-100" : "opacity-70"
                  }`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span>
                    <span className="eyebrow mr-3">{piece.index}</span>
                    {piece.role}
                    <span className="ml-2">{piece.product.brand}</span>
                  </span>
                  <span>{formatMoney(piece.product.price)}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="eyebrow mt-8">
            {pieces.length} pieces · {formatMoney(total)}
          </p>
          {cta ? (
            <Link href={`/looks/${look.slug}`} className="cta-splash mt-8 self-start">
              Shop this look
            </Link>
          ) : (
            <a href="#add" className="cta-splash mt-8 self-start">
              Add the look · {formatMoney(total)}
            </a>
          )}
        </div>
        <div className="relative min-h-0 overflow-hidden bg-white md:min-h-[28rem]">
          {shown ? (
            <>
              <Link href={`/product/${shown.product.slug}`} className="block h-full">
                <div className="relative aspect-square overflow-hidden bg-white md:absolute md:inset-0 md:aspect-auto">
                  {still ? (
                    <Image
                      src={still}
                      alt={`${shown.product.brand} ${shown.product.name}`}
                      fill
                      priority={hero}
                      className="object-contain"
                      sizes="55vw"
                    />
                  ) : null}
                  <span className="absolute top-3 left-3 eyebrow bg-white px-2 py-1 text-ink">
                    {shown.index}
                  </span>
                </div>
              </Link>
              <Heart
                item={{
                  handle: shown.product.slug,
                  name: shown.product.name,
                  brand: shown.product.brand,
                  price: shown.product.price,
                  image: still,
                }}
                className="absolute top-2 right-2 z-10 bg-white text-ink"
              />
            </>
          ) : (
            <div className="relative aspect-square overflow-hidden bg-white md:absolute md:inset-0 md:aspect-auto">
              {still ? (
                <Image src={still} alt="" fill priority={hero} className="object-contain" sizes="55vw" />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
