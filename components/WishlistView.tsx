"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardGrid } from "@/components/CardGrid";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/components/store";
import type { ProductCard as Card } from "@/lib/products";

export function WishlistView() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Card[]>([]);

  useEffect(() => {
    const handles = wishlist.map((item) => item.handle);
    if (handles.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?handles=${handles.slice(0, 24).join(",")}`)
      .then((response) => response.json())
      .then((data: { products?: Card[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, [wishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="px-5 py-14 md:px-10">
        <p className="mb-4 text-sm">Nothing saved. Hearts live on the cards.</p>
        <p>
          <Link href="/looks" className="cta inline-flex">
            Shop the look
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <CardGrid>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </CardGrid>
      <div className="mx-auto mt-16 max-w-md px-5 md:px-10">
        <p className="eyebrow mb-3">Back in stock</p>
        <p className="mb-4 text-sm text-dust">
          Leave an email. We use the same list as the notes.
        </p>
        <NewsletterForm />
      </div>
    </div>
  );
}
