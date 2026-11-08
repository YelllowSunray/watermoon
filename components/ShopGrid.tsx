"use client";

import { CardGrid } from "@/components/CardGrid";
import { ProductCard } from "@/components/ProductCard";
import type { ProductCard as Card } from "@/lib/products";
import { useEffect, useRef, useState } from "react";

const STEP = 8;

export function ShopGrid({
  products,
  dense,
}: {
  products: Card[];
  dense?: boolean;
}) {
  const first = dense ? 12 : 8;
  const listed = products.filter((product) => product.available);
  const catalog = listed.map((product) => product.id).join("|");
  const [pack, setPack] = useState({ catalog, visible: first });
  if (pack.catalog !== catalog) {
    setPack({ catalog, visible: first });
  }
  const visible = pack.catalog === catalog ? pack.visible : first;
  const shown = listed.slice(0, visible);
  const more = visible < listed.length;
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!more) return;
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setPack((current) =>
          current.catalog === catalog
            ? { ...current, visible: current.visible + STEP }
            : current,
        );
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [catalog, more, visible]);

  if (listed.length === 0) {
    return <p className="px-5 text-sm text-dust md:px-10">Nothing available in this room.</p>;
  }

  return (
    <div>
      <CardGrid>
        {shown.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 2} />
        ))}
      </CardGrid>
      {more ? <div ref={sentinel} className="h-16" aria-hidden /> : null}
    </div>
  );
}
