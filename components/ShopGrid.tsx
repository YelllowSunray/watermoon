"use client";

import { CardGrid } from "@/components/CardGrid";
import { ProductCard } from "@/components/ProductCard";
import type { ProductCard as Card } from "@/lib/products";
import { useState } from "react";

export function ShopGrid({
  products,
  dense,
}: {
  products: Card[];
  dense?: boolean;
}) {
  const [visible, setVisible] = useState(dense ? 12 : 8);
  const listed = products.filter((product) => product.available);
  const shown = listed.slice(0, visible);

  if (listed.length === 0) {
    return <p className="px-5 text-sm text-dust md:px-10">Nothing available in this room.</p>;
  }

  return (
    <div>
      <CardGrid>
        {shown.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </CardGrid>
      {visible < listed.length ? (
        <div className="px-5 py-10 text-center md:px-10">
          <button
            type="button"
            className="cta-ghost"
            onClick={() => setVisible((count) => count + 8)}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
