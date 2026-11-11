"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BuyTrust } from "@/components/BuyTrust";
import { track } from "@/components/pixel";
import { useStore } from "@/components/store";
import { formatMoney } from "@/lib/format";
import { defaultSize, kitIndex, kitTotal, pieceRole } from "@/lib/kit";
import { pixelCommerce } from "@/lib/meta-pixel";
import type { Product } from "@/lib/products";

export function LookShop({ products }: { products: Product[] }) {
  const { addLines, rememberSize, sizeFor } = useStore();
  const [sizes, setSizes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      products.map((product) => [
        product.id,
        defaultSize(product, undefined, sizeFor(product.gender, product.department, product.subcategory)),
      ]),
    ),
  );

  useEffect(() => {
    setSizes((current) => {
      let changed = false;
      const next = { ...current };
      for (const product of products) {
        if (next[product.id]) continue;
        const pref = defaultSize(
          product,
          undefined,
          sizeFor(product.gender, product.department, product.subcategory),
        );
        if (!pref) continue;
        next[product.id] = pref;
        changed = true;
      }
      return changed ? next : current;
    });
  }, [products, sizeFor]);

  const picks = useMemo(() => {
    return products.map((product) => {
      const size = sizes[product.id] ?? "";
      const variant = product.variants.find(
        (entry) => entry.available && (!size || entry.size === size),
      );
      return { product, size, variant };
    });
  }, [products, sizes]);

  const ready = picks.every((pick) => pick.variant);
  const total = kitTotal(products);

  return (
    <section id="add" className="field-ink px-5 py-10 md:px-10 md:py-12">
      <p className="eyebrow">Add the look</p>
      <h2 className="display mt-3 mb-8 max-w-xl text-4xl md:text-5xl">Pick a size. Take the set.</h2>
      <ul className="space-y-8">
        {picks.map((pick, index) => {
          const sizesFor = [
            ...new Set(
              pick.product.variants.filter((variant) => variant.available).map((variant) => variant.size),
            ),
          ];
          const still = pick.product.images[0];
          return (
            <li key={pick.product.id} className="grid gap-4 md:grid-cols-[88px_1fr] md:items-center">
              <div className="relative h-24 w-[72px] overflow-hidden bg-white">
                {still ? (
                  <Image
                    src={still}
                    alt={`${pick.product.brand} ${pick.product.name}`}
                    fill
                    className="object-contain"
                    sizes="72px"
                  />
                ) : null}
              </div>
              <div>
                <p className="eyebrow">
                  {kitIndex(index)} {pieceRole(pick.product)}
                </p>
                <p className="mt-1 text-sm">
                  {pick.product.brand} {pick.product.name}
                  <span className="ml-2">{formatMoney(pick.product.price)}</span>
                </p>
                {sizesFor.length > 1 || (sizesFor[0] && sizesFor[0] !== "One Size") ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {sizesFor.map((size) => (
                      <li key={size}>
                        <button
                          type="button"
                          className={`choice min-w-12 ${pick.size === size ? "choice-on" : ""}`}
                          onClick={() => {
                            setSizes((current) => ({ ...current, [pick.product.id]: size }));
                            rememberSize(
                              pick.product.gender,
                              pick.product.department,
                              size,
                              pick.product.subcategory,
                            );
                          }}
                        >
                          {size}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm">One size</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="cta-splash mt-12 w-full min-h-14"
        disabled={!ready}
        onClick={() => {
          const lines = picks
            .map((pick) => pick.variant && {
              variantId: pick.variant.id,
              quantity: 1,
              handle: pick.product.slug,
              name: pick.product.name,
              brand: pick.product.brand,
              price: pick.variant.price,
              image: pick.product.images[0],
              color: pick.variant.color,
              size: pick.variant.size,
            })
            .filter((line): line is NonNullable<typeof line> => Boolean(line));
          addLines(lines);
          for (const pick of picks) {
            if (pick.variant) {
              rememberSize(
                pick.product.gender,
                pick.product.department,
                pick.variant.size,
                pick.product.subcategory,
              );
            }
          }
          track(
            "AddToCart",
            pixelCommerce(
              lines.map((line) => ({
                id: line.variantId,
                quantity: line.quantity,
                price: line.price,
              })),
              { content_name: "Look" },
            ),
          );
        }}
      >
        {ready ? `Add the look · ${formatMoney(total)}` : "Choose sizes"}
      </button>
      <BuyTrust className="mt-5" />
    </section>
  );
}
