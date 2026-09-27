"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { kitIndex } from "@/lib/kit";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  const shown = images[active] ?? images[0];
  const total = images.length;

  function swipe(delta: number) {
    if (Math.abs(delta) < 40 || total < 2) return;
    setActive((current) =>
      delta > 0 ? Math.max(0, current - 1) : Math.min(total - 1, current + 1),
    );
  }

  return (
    <div className="flex min-w-0 flex-col overflow-x-hidden bg-white md:h-[calc(100dvh-7.5rem)]">
      <div
        className="relative aspect-[4/5] min-h-0 min-w-0 flex-1 overflow-hidden bg-white md:aspect-auto"
        onTouchStart={(event) => {
          startX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (startX.current == null) return;
          swipe((event.changedTouches[0]?.clientX ?? startX.current) - startX.current);
          startX.current = null;
        }}
      >
        {shown ? (
          <Image
            src={shown}
            alt={alt}
            fill
            priority
            className="object-contain"
            sizes="(min-width: 768px) 58vw, 100vw"
            draggable={false}
          />
        ) : null}
        {total > 0 ? (
          <span className="absolute top-4 left-4 eyebrow bg-white px-2 py-1 text-ink">
            {kitIndex(active)}
          </span>
        ) : null}
        {total > 1 ? (
          <span className="absolute right-4 bottom-4 eyebrow bg-white px-2 py-1 text-ink">
            {kitIndex(active)} / {kitIndex(total - 1)}
          </span>
        ) : null}
      </div>
      {total > 1 ? (
        <ol className="flex w-full min-w-0 shrink-0 overflow-x-auto border-t border-line">
          {images.map((image, index) => (
            <li key={image} className="w-[4.75rem] shrink-0 border-r border-line md:w-[5.5rem]">
              <button
                type="button"
                className="block w-full text-left"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
              >
                <div
                  className={`relative aspect-[4/5] overflow-hidden bg-white ${
                    active === index ? "ring-2 ring-inset ring-ink" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${alt} ${kitIndex(index)}`}
                    fill
                    className="object-contain"
                    sizes="6rem"
                  />
                  <span className="absolute top-1.5 left-1.5 eyebrow bg-white px-1 py-0.5 text-ink">
                    {kitIndex(index)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
