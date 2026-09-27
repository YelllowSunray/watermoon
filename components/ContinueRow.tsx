"use client";

import { useEffect, useState } from "react";
import { CardGrid } from "@/components/CardGrid";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/components/store";
import type { ProductCard as Card } from "@/lib/products";

export function ContinueRow() {
  const { viewed, bag, wishlist } = useStore();
  const [products, setProducts] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handles = [
      ...viewed,
      ...bag.map((line) => line.handle),
      ...wishlist.map((item) => item.handle),
    ];
    const unique = [...new Set(handles)].slice(0, 8);
    if (unique.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/products?handles=${unique.join(",")}`)
      .then((response) => response.json())
      .then((data: { products?: Card[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [viewed, bag, wishlist]);

  if (loading && products.length === 0) {
    return (
      <section>
        <div className="px-5 py-8 md:px-10">
          <div className="h-8 w-40 shimmer" />
        </div>
        <CardGrid>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="packshot shimmer" />
          ))}
        </CardGrid>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section>
      <div className="px-5 py-8 md:px-10">
        <h2 className="display text-3xl md:text-5xl">Continue</h2>
      </div>
      <CardGrid>
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </CardGrid>
    </section>
  );
}
