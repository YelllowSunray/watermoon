"use client";

import { isGender, type Department, type Gender } from "@/lib/products";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type SaleQuery = {
  gender?: string;
  room?: string;
  sort?: string;
};

type SaleSort = "cut" | "price-asc" | "price-desc";

const PRICE_SORTS: { value: SaleSort; label: string }[] = [
  { value: "price-asc", label: "Price · low" },
  { value: "price-desc", label: "Price · high" },
];

function isSaleSort(value: string): value is SaleSort {
  return value === "cut" || value === "price-asc" || value === "price-desc";
}

export function saleHref(next: SaleQuery) {
  const params = new URLSearchParams();
  if (next.gender && isGender(next.gender)) params.set("gender", next.gender);
  if (next.room?.trim()) params.set("room", next.room.trim());
  if (next.sort && isSaleSort(next.sort) && next.sort !== "cut") {
    params.set("sort", next.sort);
  }
  const query = params.toString();
  return query ? `/sale?${query}` : "/sale";
}

function Chip({
  href,
  on,
  onPick,
  children,
}: {
  href: string;
  on: boolean;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onPick();
      }}
      className={`room-chip ${on ? "field-vermillion" : "bg-white text-ink hover:bg-cobalt hover:text-white"}`}
      aria-pressed={on}
    >
      {children}
    </a>
  );
}

function SheetLink({
  href,
  on,
  onPick,
  children,
}: {
  href: string;
  on: boolean;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onPick();
      }}
      className={`display block py-3 text-4xl ${on ? "field-vermillion -mx-5 px-5" : ""}`}
      aria-pressed={on}
    >
      {children}
    </a>
  );
}

export function SaleFilters({
  worlds,
  rooms,
  categories,
  selected = {},
}: {
  worlds: { gender: Gender; label: string }[];
  rooms: { slug: Department; name: string }[];
  categories: { slug: string; name: string }[];
  selected?: SaleQuery;
}) {
  const router = useRouter();
  const titleId = useId();
  const [query, setQuery] = useState(selected);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected);
    setOpen(false);
  }, [selected.gender, selected.room, selected.sort]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const askedGender = query.gender ?? "";
  const gender = isGender(askedGender) ? askedGender : undefined;
  const room = query.room?.trim() || undefined;
  const askedSort = query.sort ?? "";
  const sort: SaleSort = isSaleSort(askedSort) ? askedSort : "cut";
  const showRooms = rooms.length > 0;
  const worldLabel = worlds.find((item) => item.gender === gender)?.label;
  const roomLabel =
    rooms.find((item) => item.slug === room)?.name ??
    categories.find((item) => item.slug === room)?.name;
  const sortLabel = PRICE_SORTS.find((item) => item.value === sort)?.label;
  const summary = [worldLabel, roomLabel, sortLabel].filter(Boolean).join(" · ") || "All";

  function pick(next: SaleQuery) {
    setQuery(next);
    setOpen(false);
    router.push(saleHref(next), { scroll: false });
  }

  const worldChips = worlds.map((item) => {
    const next = {
      gender: gender === item.gender ? undefined : item.gender,
      room,
      sort,
    };
    return { key: item.gender, label: item.label, href: saleHref(next), on: gender === item.gender, next };
  });

  const sortChips = PRICE_SORTS.map((item) => {
    const next = {
      gender,
      room,
      sort: sort === item.value ? "cut" : item.value,
    };
    return { key: item.value, label: item.label, href: saleHref(next), on: sort === item.value, next };
  });

  const roomChips = rooms.map((item) => {
    const next = {
      gender,
      room: room === item.slug ? undefined : item.slug,
      sort,
    };
    return { key: item.slug, label: item.name, href: saleHref(next), on: room === item.slug, next };
  });

  const categoryChips = categories.map((category) => {
    const next = {
      gender,
      room: room === category.slug ? undefined : category.slug,
      sort,
    };
    return {
      key: category.slug,
      label: category.name,
      href: saleHref(next),
      on: room === category.slug,
      next,
    };
  });

  return (
    <section className="bg-ivory">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:hidden"
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen(true)}
      >
        <span>
          <span className="eyebrow block">Sale</span>
          <span className="display mt-1 block text-3xl">{summary}</span>
        </span>
        <span className="eyebrow shrink-0">Browse</span>
      </button>

      <div className="hidden flex-wrap items-center gap-3 px-5 py-6 md:flex md:px-10 2xl:px-16">
        {worldChips.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {worldChips.map((item) => (
              <li key={item.key}>
                <Chip href={item.href} on={item.on} onPick={() => pick(item.next)}>
                  {item.label}
                </Chip>
              </li>
            ))}
          </ul>
        ) : null}

        {worldChips.length > 0 ? (
          <span className="display px-1 text-2xl text-dust" aria-hidden>
            |
          </span>
        ) : null}

        <ul className="flex flex-wrap gap-2">
          {sortChips.map((item) => (
            <li key={item.key}>
              <Chip href={item.href} on={item.on} onPick={() => pick(item.next)}>
                {item.label}
              </Chip>
            </li>
          ))}
        </ul>

        {showRooms ? (
          <span className="display px-1 text-2xl text-dust" aria-hidden>
            |
          </span>
        ) : null}

        {showRooms ? (
          <ul className="flex flex-wrap gap-2">
            {roomChips.map((item) => (
              <li key={item.key}>
                <Chip href={item.href} on={item.on} onPick={() => pick(item.next)}>
                  {item.label}
                </Chip>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {categoryChips.length > 0 ? (
        <ul className="hidden flex-wrap gap-2 px-5 pb-6 md:flex md:px-10 2xl:px-16">
          {categoryChips.map((item) => (
            <li key={item.key}>
              <Chip href={item.href} on={item.on} onPick={() => pick(item.next)}>
                {item.label}
              </Chip>
            </li>
          ))}
        </ul>
      ) : null}

      {open
        ? createPortal(
            <div
              className="menu-sheet fixed inset-0 z-[60] flex flex-col bg-paper md:hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
                <p id={titleId} className="eyebrow">
                  Sale
                </p>
                <button type="button" className="eyebrow min-h-11" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
                <div className="mb-10">
                  <ul>
                    <li>
                      <SheetLink
                        href={saleHref({})}
                        on={!gender && !room && sort === "cut"}
                        onPick={() => pick({})}
                      >
                        All
                      </SheetLink>
                    </li>
                    {worldChips.map((item) => (
                      <li key={item.key}>
                        <SheetLink href={item.href} on={item.on} onPick={() => pick(item.next)}>
                          {item.label}
                        </SheetLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-10">
                  <p className="eyebrow mb-4">Price</p>
                  <ul>
                    {sortChips.map((item) => (
                      <li key={item.key}>
                        <SheetLink href={item.href} on={item.on} onPick={() => pick(item.next)}>
                          {item.label}
                        </SheetLink>
                      </li>
                    ))}
                  </ul>
                </div>
                {showRooms ? (
                  <div className={categoryChips.length > 0 ? "mb-10" : ""}>
                    <p className="eyebrow mb-4">Rooms</p>
                    <ul>
                      {roomChips.map((item) => (
                        <li key={item.key}>
                          <SheetLink href={item.href} on={item.on} onPick={() => pick(item.next)}>
                            {item.label}
                          </SheetLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {categoryChips.length > 0 ? (
                  <div>
                    <p className="eyebrow mb-4">In this room</p>
                    <ul>
                      {categoryChips.map((item) => (
                        <li key={item.key}>
                          <SheetLink href={item.href} on={item.on} onPick={() => pick(item.next)}>
                            {item.label}
                          </SheetLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
