"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { NavDepartment } from "@/lib/catalog-types";
import type { Gender } from "@/lib/products";

function roomItems(department: NavDepartment) {
  return [
    { slug: department.slug, name: `All ${department.name.toLowerCase()}` },
    ...department.categories,
  ];
}

export function ShopRooms({
  gender,
  departments,
  active,
  accent = "field-ink",
  hrefFor,
}: {
  gender: Gender;
  departments: NavDepartment[];
  active?: string;
  accent?: string;
  hrefFor?: (slug: string) => string;
}) {
  const pathname = usePathname();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const href = (slug: string) => hrefFor?.(slug) ?? `/shop/${gender}/${slug}`;
  const items = departments.flatMap(roomItems);
  const current = items.find((item) => item.slug === active) ?? items[0];
  const kicker = departments.length === 1 ? departments[0].name : "Rooms";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (departments.length === 0) return null;

  return (
    <div className="bg-ivory">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:hidden"
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen(true)}
      >
        <span>
          <span className="eyebrow block">{kicker}</span>
          <span className="display mt-1 block text-3xl">{current?.name ?? "Browse"}</span>
        </span>
        <span className="eyebrow shrink-0">Browse</span>
      </button>

      <div className="hidden space-y-5 px-5 py-6 md:block md:px-10 2xl:px-16">
        {departments.map((department) => (
          <div key={department.slug}>
            <p className="eyebrow mb-3">{department.name}</p>
            <ul className="flex flex-wrap gap-2">
              {roomItems(department).map((item) => {
                const on = active === item.slug;
                return (
                  <li key={`${department.slug}-${item.slug}`}>
                    <Link
                      href={href(item.slug)}
                      className={`room-chip ${
                        on ? accent : "bg-white text-ink hover:bg-cobalt hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {open ? (
        <div
          className="menu-sheet fixed inset-0 z-[60] flex flex-col bg-paper md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <p id={titleId} className="eyebrow">
              {kicker}
            </p>
            <button type="button" className="eyebrow min-h-11" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
            {departments.map((department) => (
              <div key={department.slug} className={departments.length > 1 ? "mb-10" : ""}>
                {departments.length > 1 ? (
                  <p className="eyebrow mb-4">{department.name}</p>
                ) : null}
                <ul>
                  {roomItems(department).map((item) => {
                    const on = active === item.slug;
                    return (
                      <li key={`${department.slug}-${item.slug}`}>
                        <Link
                          href={href(item.slug)}
                          aria-current={on ? "page" : undefined}
                          className={`display block py-3 text-4xl ${on ? `${accent} -mx-5 px-5` : ""}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
