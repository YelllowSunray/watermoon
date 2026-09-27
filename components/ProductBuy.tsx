"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BuyTrust } from "@/components/BuyTrust";
import { Heart } from "@/components/Heart";
import { track } from "@/components/pixel";
import { useStore } from "@/components/store";
import { formatMoney } from "@/lib/format";
import { CURRENCY } from "@/lib/site";
import type { Product } from "@/lib/products";

export function ProductBuy({ product }: { product: Product }) {
  const { addToBag, rememberSize, sizeFor, bagOpen } = useStore();
  const buyable = product.variants.filter((variant) => variant.available);
  const colors = product.colors;
  const [color, setColor] = useState(
    buyable[0]?.color || colors[0]?.name || "",
  );
  const sizesForColor = useMemo(() => {
    const sizes = product.variants
      .filter((variant) => !color || variant.color === color)
      .map((variant) => variant.size);
    return [...new Set(sizes)];
  }, [product.variants, color]);
  const buyableSizes = sizesForColor.filter((size) =>
    product.variants.some(
      (variant) =>
        variant.available &&
        variant.size === size &&
        (!color || variant.color === color),
    ),
  );
  const pref = sizeFor(product.gender, product.department, product.subcategory);
  const [size, setSize] = useState(() =>
    pref && buyableSizes.includes(pref) ? pref : buyableSizes.length === 1 ? buyableSizes[0] : "",
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSize((current) => {
      if (current && buyableSizes.includes(current)) return current;
      if (pref && buyableSizes.includes(pref)) return pref;
      return buyableSizes.length === 1 ? buyableSizes[0] : "";
    });
  }, [pref, buyableSizes]);

  function keep(next: string) {
    setSize(next);
    rememberSize(product.gender, product.department, next, product.subcategory);
  }

  const variant = product.variants.find(
    (entry) =>
      entry.available &&
      (!color || entry.color === color) &&
      (!size || entry.size === size),
  );

  const soldOut = buyable.length === 0;
  const world = product.gender === "women" ? "Women" : "Men";
  const room = product.subcategory || product.department;
  const price = variant?.price ?? product.price;
  const cta = soldOut
    ? "This piece is not available to buy."
    : variant
      ? `Add to bag · ${formatMoney(price)}`
      : "Choose a size";

  function bag() {
    if (!variant) {
      document.getElementById("buy-size")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    rememberSize(product.gender, product.department, variant.size, product.subcategory);
    addToBag({
      variantId: variant.id,
      quantity: 1,
      handle: product.slug,
      name: product.name,
      brand: product.brand,
      price: variant.price,
      image: product.images[0],
      color: variant.color,
      size: variant.size,
    });
    track("AddToCart", {
      content_name: product.name,
      content_ids: [product.slug],
      value: variant.price,
      currency: CURRENCY,
    });
  }

  return (
    <div className="pb-24 md:pb-0">
      <p className="eyebrow">
        <Link href={`/${product.gender}`}>{world}</Link>
        <span className="mx-2 opacity-40">·</span>
        {room}
      </p>
      <p className="mt-5 text-sm tracking-[0.14em] uppercase">{product.brand}</p>
      <div className="mt-3 flex items-start justify-between gap-4">
        <h1 className="display break-words text-4xl md:text-6xl">{product.name}</h1>
        <Heart
          item={{
            handle: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.images[0],
          }}
        />
      </div>

      <p className="mt-6 text-xl">
        {product.compareAtPrice ? (
          <>
            <span className="mr-3 text-dust line-through">{formatMoney(product.compareAtPrice)}</span>
            <span className="text-vermillion">{formatMoney(price)}</span>
          </>
        ) : (
          formatMoney(price)
        )}
      </p>

      {colors.length > 1 ? (
        <div className="mt-10">
          <p className="eyebrow mb-4">Colour</p>
          <ul className="flex flex-wrap gap-2">
            {colors.map((entry) => (
              <li key={entry.name}>
                <button
                  type="button"
                  onClick={() => {
                    setColor(entry.name);
                    setSize("");
                  }}
                  className={`choice gap-2 ${color === entry.name ? "choice-on" : ""}`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-current"
                    style={{ background: entry.hex }}
                    aria-hidden
                  />
                  {entry.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : colors[0]?.name ? (
        <p className="mt-10 text-sm">
          <span className="eyebrow mr-3">Colour</span>
          {colors[0].name}
        </p>
      ) : null}

      {sizesForColor.length > 1 || (sizesForColor[0] && sizesForColor[0] !== "One Size") ? (
        <div id="buy-size" className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <p className="eyebrow">Size</p>
            <Link href="/sizes" className="eyebrow opacity-70">
              Yours
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2">
            {sizesForColor.map((entry) => {
              const available = product.variants.some(
                (item) =>
                  item.available &&
                  item.size === entry &&
                  (!color || item.color === color),
              );
              return (
                <li key={entry}>
                  <button
                    type="button"
                    disabled={!available}
                    onClick={() => keep(entry)}
                    className={`choice min-w-14 ${size === entry ? "choice-on" : ""} ${
                      available ? "" : "opacity-30"
                    }`}
                  >
                    {entry}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-12">
        {soldOut ? (
          <p className="text-sm text-dust">{cta}</p>
        ) : (
          <button
            type="button"
            className="cta w-full min-h-14"
            onClick={bag}
          >
            {cta}
          </button>
        )}
        <BuyTrust className="mt-5" />
      </div>

      {mounted && !soldOut && !bagOpen
        ? createPortal(
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
              <button type="button" className="cta w-full min-h-14" onClick={bag}>
                {cta}
              </button>
            </div>,
            document.body,
          )
        : null}

      {product.description ? (
        <p className="mt-10 max-w-sm text-sm leading-7">{product.description}</p>
      ) : null}

      {product.details.length > 0 ? (
        <dl className="mt-10 space-y-3 border-t border-line pt-8 text-sm">
          {product.details.map((line) => {
            const [key, ...rest] = line.split(": ");
            return (
              <div key={line} className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-4">
                <dt className="eyebrow">{rest.length ? key : "Note"}</dt>
                <dd>{rest.length ? rest.join(": ") : line}</dd>
              </div>
            );
          })}
        </dl>
      ) : null}
    </div>
  );
}
