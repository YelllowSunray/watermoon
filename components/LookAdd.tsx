"use client";

import { useMemo, useState } from "react";
import { track } from "@/components/pixel";
import { useStore } from "@/components/store";
import { buyableSizes, defaultSize, kitIndex, kitTotal, pickVariant, pieceRole } from "@/lib/kit";
import { formatMoney } from "@/lib/format";
import { pixelCommerce } from "@/lib/meta-pixel";
import type { Product } from "@/lib/products";

export function LookAdd({
  products,
  compact = false,
}: {
  products: Product[];
  compact?: boolean;
}) {
  const { addLines } = useStore();
  const [sizes, setSizes] = useState<Record<string, string>>(() =>
    Object.fromEntries(products.map((product) => [product.id, defaultSize(product)])),
  );

  const picks = useMemo(
    () =>
      products.map((product) => {
        const size = sizes[product.id] ?? "";
        return { product, size, variant: pickVariant(product, size) };
      }),
    [products, sizes],
  );

  const ready = picks.every((pick) => pick.variant);
  const total = kitTotal(products);

  return (
    <div>
      {compact ? null : (
        <>
          <p className="eyebrow">Add the look</p>
          <h2 className="display mt-3 mb-10 max-w-xl text-4xl">Pick a size. Take the set.</h2>
        </>
      )}
      <ul className={compact ? "mt-6 space-y-4" : "space-y-8"}>
        {picks.map((pick, index) => {
          const sizesFor = buyableSizes(pick.product);
          const needsSize = sizesFor.length > 1 || (sizesFor[0] && sizesFor[0] !== "One Size");
          return (
            <li key={pick.product.id} className={compact ? "" : "grid gap-4 md:grid-cols-[140px_1fr]"}>
              {compact ? null : (
                <p className="eyebrow">
                  {kitIndex(index)} {pieceRole(pick.product)}
                </p>
              )}
              <div>
                {compact ? (
                  <p className="flex items-baseline justify-between gap-4 text-sm">
                    <span>
                      <span className="eyebrow mr-3">{kitIndex(index)}</span>
                      {pieceRole(pick.product)}
                      <span className="ml-2">{pick.product.brand}</span>
                    </span>
                    <span>{formatMoney(pick.product.price)}</span>
                  </p>
                ) : (
                  <p className="text-sm">
                    {pick.product.brand} {pick.product.name}
                    <span className="ml-2">{formatMoney(pick.product.price)}</span>
                  </p>
                )}
                {needsSize ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {sizesFor.map((size) => (
                      <li key={size}>
                        <button
                          type="button"
                          className={`choice min-w-10 ${pick.size === size ? "choice-on" : ""}`}
                          onClick={() =>
                            setSizes((current) => ({ ...current, [pick.product.id]: size }))
                          }
                        >
                          {size}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : compact ? null : (
                  <p className="mt-2 text-sm">One size</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className={compact ? "cta-splash mt-8 self-start" : "cta mt-12"}
        disabled={!ready}
        onClick={() => {
          const lines = picks
            .map(
              (pick) =>
                pick.variant && {
                  variantId: pick.variant.id,
                  quantity: 1,
                  handle: pick.product.slug,
                  name: pick.product.name,
                  brand: pick.product.brand,
                  price: pick.variant.price,
                  image: pick.product.images[0],
                  color: pick.variant.color,
                  size: pick.variant.size,
                },
            )
            .filter((line): line is NonNullable<typeof line> => Boolean(line));
          addLines(lines);
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
    </div>
  );
}
