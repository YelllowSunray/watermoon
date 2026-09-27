"use client";

import { useStore } from "@/components/store";
import type { WishlistItem } from "@/lib/storage";
import { track } from "@/components/pixel";
import { CURRENCY } from "@/lib/site";

export function Heart({
  item,
  className = "",
}: {
  item: WishlistItem;
  className?: string;
}) {
  const { isWished, toggleWishlist } = useStore();
  const on = isWished(item.handle);

  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Save to wishlist"}
      className={`inline-flex h-9 w-9 items-center justify-center ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(item);
        if (!on) track("AddToWishlist", { content_name: item.name, value: item.price, currency: CURRENCY });
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 13.3S2.2 9.7 2.2 5.9A2.85 2.85 0 0 1 8 4.6a2.85 2.85 0 0 1 5.8 1.3C13.8 9.7 8 13.3 8 13.3Z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.1"
        />
      </svg>
    </button>
  );
}
