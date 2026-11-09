"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BuyTrust } from "@/components/BuyTrust";
import { Heart } from "@/components/Heart";
import { track } from "@/components/pixel";
import { useStore } from "@/components/store";
import { formatMoney } from "@/lib/format";
import { defaultSize, needsSizeChoice, sizeLabel, sizeMatches } from "@/lib/kit";
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
  const inStock = useMemo(
    () =>
      sizesForColor.filter((size) =>
        product.variants.some(
          (variant) =>
            variant.available &&
            variant.size === size &&
            (!color || variant.color === color),
        ),
      ),
    [product.variants, sizesForColor, color],
  );
  const pref = sizeFor(product.gender, product.department, product.subcategory);
  const needsSize = needsSizeChoice(inStock);
  const [size, setSize] = useState(() => defaultSize(product, color, pref));
  const [asked, setAsked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSize((current) => {
      if (current && inStock.some((entry) => sizeMatches(entry, current))) {
        return inStock.find((entry) => sizeMatches(entry, current)) ?? current;
      }
      return defaultSize(product, color, pref);
    });
    setAsked(false);
  }, [pref, inStock, product, color]);

  function keep(next: string) {
    setSize(next);
    setAsked(false);
    rememberSize(product.gender, product.department, next, product.subcategory);
  }

  const variant = product.variants.find(
    (entry) =>
      entry.available &&
      (!color || entry.color === color) &&
      (needsSize ? entry.size === size && Boolean(size) : true),
  );

  const soldOut = buyable.length === 0;
  const world = product.gender === "women" ? "Women" : "Men";
  const room = product.subcategory || product.department;
  const price = variant?.price ?? product.price;
  const picked = size ? sizeLabel(size) : undefined;
  const cta = soldOut
    ? "This piece is not available to buy."
    : needsSize && !size
      ? "Choose a size"
      : variant
        ? `Add to bag · ${formatMoney(price)}`
        : "Choose a size";

  function bag() {
    if (!variant || (needsSize && !size)) {
      setAsked(true);
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
      <p className="eyebrow md:hidden">
        <Link href={`/${product.gender}`}>{world}</Link>
        <span className="mx-2 opacity-40">·</span>
        {room}
      </p>
      <p className="buy-brand mt-5 tracking-[0.14em] uppercase md:mt-0">{product.brand}</p>
      <div className="mt-3 flex items-start justify-between gap-3 md:mt-2">
        <h1 className="buy-title display break-words leading-[1.05]">{product.name}</h1>
        <Heart
          className="buy-heart shrink-0"
          item={{
            handle: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.images[0],
          }}
        />
      </div>

      <p className="buy-price">
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
        <div className="buy-block">
          <p className="eyebrow mb-3 md:mb-2">Colour</p>
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
        <p className="buy-block text-sm">
          <span className="eyebrow mr-3">Colour</span>
          {colors[0].name}
        </p>
      ) : null}

      {needsSize ? (
        <div
          id="buy-size"
          className={`buy-block scroll-mt-28 scroll-mb-28 ${asked && !size ? "outline outline-2 outline-offset-8 outline-ink" : ""}`}
        >
          <div className="mb-3 flex items-end justify-between gap-4 md:mb-2">
            <p className="eyebrow">
              Size
              {picked ? (
                <>
                  <span className="mx-2 opacity-40">·</span>
                  {picked.primary}
                  {picked.secondary ? ` · ${picked.secondary}` : ""}
                </>
              ) : null}
            </p>
            <Link href="/sizes" className="eyebrow opacity-70">
              Yours
            </Link>
          </div>
          {!size ? (
            <p className="mb-3 text-sm md:mb-2">{asked ? "Pick a size first." : "Select a size to add this piece."}</p>
          ) : null}
          <ul className="flex flex-wrap gap-1.5">
            {sizesForColor.map((entry) => {
              const available = inStock.includes(entry);
              const label = sizeLabel(entry);
              return (
                <li key={entry}>
                  <button
                    type="button"
                    disabled={!available}
                    onClick={() => keep(entry)}
                    aria-pressed={size === entry}
                    className={`choice choice-size ${size === entry ? "choice-on" : ""} ${
                      available ? "" : "opacity-30"
                    }`}
                  >
                    <span>{label.primary}</span>
                    {label.secondary ? (
                      <span className="text-[10px] tracking-[0.08em] uppercase opacity-60">
                        {label.secondary}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="buy-block">
        {soldOut ? (
          <p className="text-sm text-dust">{cta}</p>
        ) : (
          <button
            type="button"
            className="cta buy-cta hidden w-full md:block"
            onClick={bag}
          >
            {cta}
          </button>
        )}
        <BuyTrust className="buy-trust" />
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
        <p className="buy-copy">{product.description}</p>
      ) : null}

      {product.details.length > 0 ? (
        <dl className="buy-facts space-y-3 border-t border-line md:space-y-2">
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
