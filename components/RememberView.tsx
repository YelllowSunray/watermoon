"use client";

import { useEffect } from "react";
import { useStore } from "@/components/store";
import { track } from "@/components/pixel";
import { catalogItemId } from "@/lib/meta-pixel";
import type { Product } from "@/lib/products";
import { CURRENCY } from "@/lib/site";

export function RememberView({ product }: { product: Product }) {
  const { remember } = useStore();
  const variant = product.variants.find((entry) => entry.available) ?? product.variants[0];

  useEffect(() => {
    remember(product.slug);
  }, [product.slug, remember]);

  useEffect(() => {
    if (!variant) return;
    const id = catalogItemId(variant.id);
    if (!id) return;
    track("ViewContent", {
      content_ids: [id],
      content_name: product.name,
      content_type: "product",
      value: variant.price,
      currency: CURRENCY,
    });
    // Once per product page view — not when size/price selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
