"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@/components/pixel";
import { useStore } from "@/components/store";
import { buyableSizes, defaultSize, needsSizeChoice, pickVariant, sizeLabel } from "@/lib/kit";
import type { Department, Gender, Product, ProductCard } from "@/lib/products";
import { CURRENCY } from "@/lib/site";

type Buyable = Pick<
  Product,
  | "slug"
  | "name"
  | "brand"
  | "images"
  | "variants"
  | "colors"
  | "gender"
  | "department"
  | "subcategory"
>;

export function QuickBuy({
  product,
  className = "",
}: {
  product: Buyable | ProductCard;
  className?: string;
}) {
  const { addToBag, rememberSize, sizeFor, bag: lines } = useStore();
  const inBag = lines.some((line) => line.handle === product.slug);
  const buyable = product.variants.filter((variant) => variant.available);
  const color = buyable[0]?.color || product.colors[0]?.name || "";
  const sizes = useMemo(() => buyableSizes(product, color), [product, color]);
  const pref = sizeFor(product.gender, product.department, product.subcategory);
  const [size, setSize] = useState(() => defaultSize(product, color, pref));
  const [ask, setAsk] = useState(false);
  const needsSize = needsSizeChoice(sizes);
  const marked = inBag && !(ask && needsSize);
  const variant = pickVariant(product, needsSize ? size : sizes[0] || size, color);

  useEffect(() => {
    setSize((current) => {
      if (current && sizes.includes(current)) return current;
      return defaultSize(product, color, pref);
    });
  }, [product, color, pref, sizes]);

  if (buyable.length === 0) return null;

  function keep(gender: Gender, department: Department, nextSize: string) {
    rememberSize(gender, department, nextSize, product.subcategory);
  }

  function bag(next = variant) {
    if (!next) return;
    addToBag({
      variantId: next.id,
      quantity: 1,
      handle: product.slug,
      name: product.name,
      brand: product.brand,
      price: next.price,
      image: product.images[0],
      color: next.color,
      size: next.size,
    });
    keep(product.gender, product.department, next.size);
    track("AddToCart", {
      content_name: product.name,
      content_ids: [product.slug],
      value: next.price,
      currency: CURRENCY,
    });
    setAsk(false);
  }

  return (
    <div
      className={`pointer-events-auto flex flex-col items-center ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {ask && needsSize ? (
        <ul className="mb-1.5 flex flex-wrap justify-center gap-1">
          {sizes.map((entry) => {
            const option = pickVariant(product, entry, color);
            return (
              <li key={entry}>
                <button
                  type="button"
                  disabled={!option}
                  className={`choice quick-choice min-w-9 disabled:opacity-30 ${
                    size === entry ? "choice-on" : ""
                  }`}
                  onClick={() => {
                    setSize(entry);
                    if (option) bag(option);
                  }}
                >
                  {sizeLabel(entry).primary}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <button
        type="button"
        className={`quick-add ${marked ? "quick-add-on" : ""}`}
        aria-label={marked ? "Added to bag" : ask && needsSize ? "Choose size" : "Add to bag"}
        disabled={ask && needsSize ? false : !variant && !needsSize}
        onClick={() => {
          if (needsSize && !size) {
            setAsk(true);
            return;
          }
          bag();
        }}
      >
        {ask && needsSize ? "Size" : marked ? "Added" : "Add"}
      </button>
    </div>
  );
}
