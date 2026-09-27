"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/components/store";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) input.current?.focus();
  }, [searchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="search-sheet fixed inset-0 z-50 bg-paper">
      <div className="mx-auto flex max-w-2xl flex-col px-5 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="mb-8 flex items-center justify-between">
          <p className="eyebrow">Search</p>
          <button type="button" className="flex h-11 items-center eyebrow" onClick={() => setSearchOpen(false)}>
            Close
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
            if (!q) return;
            setSearchOpen(false);
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <input
            ref={input}
            name="q"
            placeholder="Black blazer women 40"
            className="display w-full border-b border-ink bg-transparent pb-3 text-3xl outline-none placeholder:text-dust/40 md:text-5xl"
          />
        </form>
        <p className="mt-6 text-sm text-dust">Colour, piece, gender, size. Then Enter.</p>
      </div>
    </div>
  );
}
