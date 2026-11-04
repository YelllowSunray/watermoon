"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/components/store";
import type { Brand, GenderNav } from "@/lib/catalog-types";
import { LOOKS, SPLASH_FIELD, hoverLooks, streetSplash } from "@/lib/looks-public";
import { NavBack, NavHome, NavStart } from "@/components/NavWay";
import { STORIES, hoverStories } from "@/lib/stories-public";

type Panel = "women" | "men" | "looks" | "edit" | "houses" | "sale";

export function Header({ nav, brands = [] }: { nav: GenderNav[]; brands?: Brand[] }) {
  const pathname = usePathname();
  const { bag, setBagOpen, setSearchOpen, menuOpen, setMenuOpen } = useStore();
  const [open, setOpen] = useState<Panel | null>(null);
  const [mobileFold, setMobileFold] = useState<Panel | null>(null);
  const header = useRef<HTMLElement>(null);
  const closeTimer = useRef<number>(0);
  const lock = useRef<Panel | null>(null);
  const count = bag.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    setOpen(null);
    setMenuOpen(false);
    setMobileFold(null);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    if (!menuOpen) setMobileFold(null);
  }, [menuOpen]);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setOpen(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(null);
        setMobileFold(null);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function cancelClose() {
    window.clearTimeout(closeTimer.current);
  }

  function show(panel: Panel) {
    if (lock.current === panel) return;
    cancelClose();
    setOpen(panel);
  }

  function hideSoon() {
    cancelClose();
    lock.current = null;
    closeTimer.current = window.setTimeout(() => setOpen(null), 140);
  }

  function go(panel: Panel) {
    lock.current = panel;
    setOpen(null);
  }

  const women = nav.find((item) => item.gender === "women");
  const men = nav.find((item) => item.gender === "men");
  const genderPanel = open === "women" ? women : open === "men" ? men : null;
  const genderLooks = LOOKS.filter((look) => look.gender === open);
  const houses = brands.slice(0, 12);
  const hoverNeed = useHoverNeed();

  return (
    <>
      {menuOpen ? <div className="h-[67px] md:hidden" aria-hidden /> : null}
      <header
      ref={header}
      className={`${menuOpen ? "fixed inset-x-0 top-0" : "sticky top-0"} z-50 bg-paper text-ink`}
      onMouseEnter={cancelClose}
      onMouseLeave={hideSoon}
    >
      <div className="h-[3px] bg-ink" />
      <div className="flex h-16 items-center justify-between border-b border-line px-4 md:h-[4.25rem] md:px-8">
        <div className="flex min-w-0 items-center gap-0.5 md:gap-2">
          <button
            type="button"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center md:hidden"
            aria-label={menuOpen ? "Close menu" : "Menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
            <span aria-hidden className="flex h-4 w-5 flex-col justify-between">
              <span
                className={`block h-[1.5px] w-full bg-ink transition duration-200 ease-out ${
                  menuOpen ? "translate-y-[7.25px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-ink transition duration-200 ease-out ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-ink transition duration-200 ease-out ${
                  menuOpen ? "-translate-y-[7.25px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
          <NavBack />
          <NavStart onPick={() => setOpen(null)} />
          <NavHome onPick={() => setOpen(null)} />
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/women"
            className="nav-link"
            aria-expanded={open === "women"}
            aria-current={pathname === "/women" || pathname.startsWith("/shop/women") ? "page" : undefined}
            onMouseEnter={() => show("women")}
            onFocus={() => show("women")}
            onClick={() => go("women")}
          >
            Women
          </Link>
          <Link
            href="/men"
            className="nav-link"
            aria-expanded={open === "men"}
            aria-current={pathname === "/men" || pathname.startsWith("/shop/men") ? "page" : undefined}
            onMouseEnter={() => show("men")}
            onFocus={() => show("men")}
            onClick={() => go("men")}
          >
            Men
          </Link>
          <Link
            href="/looks"
            className="nav-link"
            aria-expanded={open === "looks"}
            aria-current={pathname === "/looks" || pathname.startsWith("/looks/") ? "page" : undefined}
            onMouseEnter={() => show("looks")}
            onFocus={() => show("looks")}
            onClick={() => go("looks")}
          >
            Looks
          </Link>
          <Link
            href="/stories"
            className="nav-link"
            aria-expanded={open === "edit"}
            aria-current={pathname === "/stories" || pathname.startsWith("/stories/") ? "page" : undefined}
            onMouseEnter={() => show("edit")}
            onFocus={() => show("edit")}
            onClick={() => go("edit")}
          >
            The edit
          </Link>
          <Link
            href="/brands"
            className="nav-link"
            aria-expanded={open === "houses"}
            onMouseEnter={() => show("houses")}
            onFocus={() => show("houses")}
            onClick={() => setOpen(null)}
          >
            Brands
          </Link>
          <Link
            href="/sale"
            className="nav-link nav-sale"
            aria-expanded={open === "sale"}
            onMouseEnter={() => show("sale")}
            onFocus={() => show("sale")}
            onClick={() => setOpen(null)}
          >
            Sale
          </Link>
        </nav>

        <div className="flex items-center gap-0.5 md:gap-4">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center md:hidden"
            aria-label="Search"
            onClick={() => {
              setOpen(null);
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M15 15.2 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" />
            </svg>
          </button>
          <button
            type="button"
            className="nav-link hidden px-1 md:inline"
            onClick={() => {
              setOpen(null);
              setSearchOpen(true);
            }}
          >
            Search
          </button>
          <Link href="/sizes" className="nav-link hidden px-1 md:inline">
            Sizes
          </Link>
          <Link href="/wishlist" className="nav-link hidden px-1 md:inline">
            Wishlist
          </Link>
          <Link href="/account" className="nav-link hidden px-1 md:inline">
            Account
          </Link>
          <button
            type="button"
            className="nav-link flex h-11 items-center px-2 md:h-auto md:px-1"
            onClick={() => {
              setOpen(null);
              setMenuOpen(false);
              setBagOpen(true);
            }}
          >
            Bag{count ? <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center bg-cobalt px-1 text-[10px] text-white">{count}</span> : null}
          </button>
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-50 hidden md:block">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-screen bg-ink/45" aria-hidden />
          <div
            className={`mega relative w-full overflow-hidden ${
              open === "edit" || open === "looks" || open === "houses" || open === "sale"
                ? ""
                : "border-b border-ink bg-paper shadow-[0_28px_80px_rgba(10,10,10,0.28)]"
            }`}
          >
            {open === "looks" ? (
              <LooksPanel need={hoverNeed} onPick={() => setOpen(null)} />
            ) : open === "edit" ? (
              <EditPanel need={hoverNeed} onPick={() => setOpen(null)} />
            ) : open === "houses" ? (
              <HousesPanel houses={houses} onPick={() => setOpen(null)} />
            ) : open === "sale" ? (
              <SalePanel onPick={() => setOpen(null)} />
            ) : genderPanel ? (
              <GenderPanel
                gender={open}
                panel={genderPanel}
                looks={genderLooks}
                onPick={() => setOpen(null)}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="menu-sheet fixed inset-x-0 top-[67px] bottom-0 z-40 overflow-y-auto overscroll-contain bg-paper md:hidden">
          <nav className="flex flex-col pb-[max(2.5rem,env(safe-area-inset-bottom))]">
            <MobileFold
              label="Women"
              href="/women"
              splash="field-vermillion"
              open={mobileFold === "women"}
              onToggle={() => setMobileFold((current) => (current === "women" ? null : "women"))}
            >
              <GenderList gender="women" panel={women} onPick={() => setMenuOpen(false)} />
            </MobileFold>
            <MobileFold
              label="Men"
              href="/men"
              splash="field-ink"
              open={mobileFold === "men"}
              onToggle={() => setMobileFold((current) => (current === "men" ? null : "men"))}
            >
              <GenderList gender="men" panel={men} onPick={() => setMenuOpen(false)} />
            </MobileFold>
            <MobileFold
              label="Looks"
              href="/looks"
              splash="field-chartreuse"
              open={mobileFold === "looks"}
              onToggle={() => setMobileFold((current) => (current === "looks" ? null : "looks"))}
            >
              <WorldList
                hers={LOOKS.filter((look) => look.gender === "women")}
                his={LOOKS.filter((look) => look.gender === "men")}
                hrefFor={(slug) => `/looks/${slug}`}
                allHref="/looks"
                allLabel="All looks"
                onPick={() => setMenuOpen(false)}
              />
            </MobileFold>
            <MobileFold
              label="The edit"
              href="/stories"
              splash="field-violet"
              open={mobileFold === "edit"}
              onToggle={() => setMobileFold((current) => (current === "edit" ? null : "edit"))}
            >
              <WorldList
                hers={STORIES.filter((story) => story.gender === "women")}
                his={STORIES.filter((story) => story.gender === "men")}
                both={STORIES.filter((story) => story.gender === "both")}
                hrefFor={(slug) => `/stories/${slug}`}
                allHref="/stories"
                allLabel="All rooms"
                onPick={() => setMenuOpen(false)}
              />
            </MobileFold>
            <Link href="/brands" className="display flex min-h-[4.5rem] items-center border-b border-line px-5 text-[2.5rem]">
              Brands
            </Link>
            <Link href="/sale" className="display flex min-h-[4.5rem] items-center border-b border-line px-5 text-[2.5rem] text-vermillion">
              Sale
            </Link>
            <div className="border-t border-ink bg-ivory px-5 py-6">
              <div className="grid grid-cols-2 gap-x-8">
                <Link href="/sizes" className="menu-tool">
                  Sizes
                </Link>
                <Link href="/wishlist" className="menu-tool">
                  Wishlist
                </Link>
                <Link href="/account" className="menu-tool">
                  Account
                </Link>
                <button
                  type="button"
                  className="menu-tool text-left"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
    </>
  );
}

function GenderPanel({
  gender,
  panel,
  looks,
  onPick,
}: {
  gender: "women" | "men";
  panel: GenderNav;
  looks: typeof LOOKS;
  onPick: () => void;
}) {
  const featured = looks[0];
  const splash = gender === "women" ? "field-vermillion" : "field-ink";

  return (
    <div className="grid bg-paper md:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.8fr)]">
      <div className={`${splash} flex flex-col justify-between px-8 py-8`}>
        <div>
          <p className="eyebrow">Shop the look</p>
          <p className="display mt-2 text-4xl">{featured?.title ?? "The outfit. Then the pieces."}</p>
          <p className="mt-3 max-w-xs text-sm leading-6">{featured?.line ?? "Not the dump."}</p>
        </div>
        <div className="mt-8">
          <ul className="space-y-1.5">
            {looks.map((look) => (
              <li key={look.slug}>
                <Link href={`/looks/${look.slug}`} className="mega-link" onClick={onPick}>
                  {look.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/looks" className="cta-splash mt-6 inline-flex" onClick={onPick}>
            All looks
          </Link>
        </div>
      </div>
      <div className="grid h-full gap-8 bg-paper px-8 py-8 md:grid-cols-3">
        {panel.departments.map((department) => (
          <div key={department.slug}>
            {department.image ? (
              <Link href={`/shop/${gender}/${department.slug}`} className="mb-3 block" onClick={onPick}>
                <div className="relative aspect-[16/9] overflow-hidden bg-white">
                  <Image
                    src={department.image}
                    alt={department.name}
                    fill
                    className="object-contain"
                    sizes="18vw"
                  />
                </div>
              </Link>
            ) : null}
            <Link
              href={`/shop/${gender}/${department.slug}`}
              className="display text-2xl"
              onClick={onPick}
            >
              {department.name}
            </Link>
            <ul className="mt-3 columns-2 gap-x-6 text-sm">
              {department.categories.map((category) => (
                <li key={category.slug} className="mb-1.5 break-inside-avoid">
                  <Link
                    href={`/shop/${gender}/${category.slug}`}
                    className="mega-link"
                    onClick={onPick}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function streetCols(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-3";
  if (count === 5) return "grid-cols-5";
  if (count === 6) return "grid-cols-3 md:grid-cols-6";
  if (count === 9) return "grid-cols-3";
  if (count === 10) return "grid-cols-5";
  return "grid-cols-4";
}

function MegaWorld({
  label,
  href,
  splash,
  count,
  onPick,
  children,
}: {
  label: string;
  href: string;
  splash: string;
  count: number;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <Link
        href={href}
        className={`${splash} flex items-center justify-between gap-4 px-8 py-3`}
        onClick={onPick}
      >
        <p className="display text-xl">{label}</p>
        <span className="eyebrow">All {label.toLowerCase()}</span>
      </Link>
      <ul className={`grid ${streetCols(count)}`}>{children}</ul>
    </div>
  );
}

function useHoverNeed() {
  const [need, setNeed] = useState(8);

  useEffect(() => {
    function sync() {
      setNeed(window.innerHeight >= 620 ? 8 : 4);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return need;
}

function LooksPanel({ need, onPick }: { need: number; onPick: () => void }) {
  const { hers, his } = hoverLooks(need);

  return (
    <div className="bg-ink">
      <div className="field-chartreuse flex items-end justify-between gap-6 px-8 py-5">
        <div>
          <p className="eyebrow">Shop the look</p>
          <p className="display mt-1 text-3xl md:text-4xl">The outfit. Then the pieces.</p>
        </div>
        <Link href="/looks" className="cta shrink-0" onClick={onPick}>
          All looks
        </Link>
      </div>
      <MegaWorld label="Women" href="/women" splash="field-vermillion" count={hers.length} onPick={onPick}>
        {hers.map((look, index) => (
          <li key={look.slug} className="min-h-0">
            <Link
              href={`/looks/${look.slug}`}
              className={`${SPLASH_FIELD[streetSplash(index)]} flex h-full min-h-[10vh] flex-col justify-end px-5 py-4`}
              onClick={onPick}
            >
              <p className="display text-xl md:text-2xl">{look.title}</p>
            </Link>
          </li>
        ))}
      </MegaWorld>
      <MegaWorld label="Men" href="/men" splash="field-ink" count={his.length} onPick={onPick}>
        {his.map((look, index) => (
          <li key={look.slug} className="min-h-0">
            <Link
              href={`/looks/${look.slug}`}
              className={`${SPLASH_FIELD[streetSplash(index, 3)]} flex h-full min-h-[10vh] flex-col justify-end px-5 py-4`}
              onClick={onPick}
            >
              <p className="display text-xl md:text-2xl">{look.title}</p>
            </Link>
          </li>
        ))}
      </MegaWorld>
    </div>
  );
}

function EditPanel({ need, onPick }: { need: number; onPick: () => void }) {
  const { hers, his } = hoverStories(need);

  return (
    <div className="bg-ink">
      <div className="field-violet flex items-end justify-between gap-6 px-8 py-5">
        <div>
          <p className="eyebrow">The edit</p>
          <p className="display mt-1 text-3xl md:text-4xl">Rooms. Not a feed.</p>
        </div>
        <Link href="/stories" className="cta-splash shrink-0" onClick={onPick}>
          All rooms
        </Link>
      </div>
      <MegaWorld label="Women" href="/women" splash="field-vermillion" count={hers.length} onPick={onPick}>
        {hers.map((story, index) => (
          <li key={story.slug} className="min-h-0">
            <Link
              href={`/stories/${story.slug}`}
              className={`${SPLASH_FIELD[streetSplash(index)]} flex h-full min-h-[10vh] flex-col justify-end px-5 py-4`}
              onClick={onPick}
            >
              <p className="display text-xl md:text-2xl">{story.title}</p>
            </Link>
          </li>
        ))}
      </MegaWorld>
      <MegaWorld label="Men" href="/men" splash="field-ink" count={his.length} onPick={onPick}>
        {his.map((story, index) => (
          <li key={story.slug} className="min-h-0">
            <Link
              href={`/stories/${story.slug}`}
              className={`${SPLASH_FIELD[streetSplash(index, 3)]} flex h-full min-h-[10vh] flex-col justify-end px-5 py-4`}
              onClick={onPick}
            >
              <p className="display text-xl md:text-2xl">{story.title}</p>
            </Link>
          </li>
        ))}
      </MegaWorld>
    </div>
  );
}

const HOUSE_SPLASH = [
  "cobalt",
  "violet",
  "ink",
  "vermillion",
  "chartreuse",
  "orange",
] as const;

function HousesPanel({ houses, onPick }: { houses: Brand[]; onPick: () => void }) {
  return (
    <div>
      <div className="field-orange flex items-end justify-between gap-6 px-8 py-8">
        <div>
          <p className="eyebrow">Brands</p>
          <p className="display mt-2 text-5xl">The names on the cloth.</p>
        </div>
        <Link href="/brands" className="cta shrink-0" onClick={onPick}>
          All brands
        </Link>
      </div>
      <ul className="grid md:grid-cols-4">
        {houses.map((brand, index) => (
          <li key={brand.slug} className="min-h-0">
            <Link
              href={`/brands/${brand.slug}`}
              className={`${SPLASH_FIELD[HOUSE_SPLASH[index % HOUSE_SPLASH.length]]} flex h-full flex-col justify-end px-6 py-6`}
              onClick={onPick}
            >
              <p className="eyebrow">{brand.count} pieces</p>
              <p className="display mt-2 text-3xl">{brand.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SALE_ROOMS = [
  { slug: "clothing", name: "Clothing" },
  { slug: "shoes", name: "Shoes" },
  { slug: "accessories", name: "Accessories" },
] as const;

function SaleWorld({
  gender,
  label,
  kicker,
  splash,
  offset,
  onPick,
}: {
  gender: "women" | "men";
  label: string;
  kicker: string;
  splash: string;
  offset: number;
  onPick: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <Link
        href={`/sale?gender=${gender}`}
        className={`${splash} flex flex-col justify-end px-8 py-8 md:min-h-[20vh]`}
        onClick={onPick}
      >
        <p className="eyebrow">{kicker}</p>
        <p className="display mt-2 text-5xl md:text-6xl">{label}</p>
      </Link>
      <ul className="grid grid-cols-3">
        {SALE_ROOMS.map((room, index) => (
          <li key={room.slug}>
            <Link
              href={`/sale?gender=${gender}&room=${room.slug}`}
              className={`${SPLASH_FIELD[streetSplash(index, offset)]} flex h-full flex-col justify-end px-5 py-6`}
              onClick={onPick}
            >
              <p className="eyebrow">{label}</p>
              <p className="display mt-1 text-xl md:text-2xl">{room.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SalePanel({ onPick }: { onPick: () => void }) {
  return (
    <div>
      <div className="field-vermillion flex items-end justify-between gap-6 px-8 py-5">
        <div>
          <p className="eyebrow">Sale</p>
          <p className="display mt-1 text-3xl md:text-4xl">The cut. Still edited.</p>
        </div>
        <Link href="/sale" className="cta-splash shrink-0" onClick={onPick}>
          All sale
        </Link>
      </div>
      <div className="grid md:grid-cols-2">
        <SaleWorld
          gender="women"
          label="Women"
          kicker="Her cut"
          splash="field-vermillion"
          offset={0}
          onPick={onPick}
        />
        <SaleWorld gender="men" label="Men" kicker="His cut" splash="field-ink" offset={3} onPick={onPick} />
      </div>
    </div>
  );
}

function MobileFold({
  label,
  href,
  splash,
  open,
  onToggle,
  children,
}: {
  label: string;
  href: string;
  splash: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <div className={`${open ? splash : "bg-paper"} flex items-stretch`}>
        <Link
          href={href}
          className="display flex min-h-[4.5rem] shrink-0 items-center pl-5 text-[2.5rem]"
        >
          {label}
        </Link>
        <button
          type="button"
          className="flex min-h-[4.5rem] min-w-12 flex-1 items-center justify-end pr-5 pl-3"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? `Close ${label}` : `Open ${label}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              d={open ? "M6 12h12" : "M12 6v12M6 12h12"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
            />
          </svg>
        </button>
      </div>
      <div className={`fold-panel ${open ? "fold-panel-open" : ""}`}>
        <div>
          <div className="bg-paper px-5 pt-2 pb-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

function WorldList({
  hers,
  his,
  both = [],
  hrefFor,
  allHref,
  allLabel,
  onPick,
}: {
  hers: Array<{ slug: string; title: string }>;
  his: Array<{ slug: string; title: string }>;
  both?: Array<{ slug: string; title: string }>;
  hrefFor: (slug: string) => string;
  allHref: string;
  allLabel: string;
  onPick: () => void;
}) {
  const worlds = [
    { label: "Women", items: hers },
    { label: "Men", items: his },
    { label: "Women · Men", items: both },
  ].filter((world) => world.items.length > 0);

  return (
    <div className="space-y-8">
      {worlds.map((world) => (
        <div key={world.label}>
          <p className="eyebrow">{world.label}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {world.items.map((item) => (
              <li key={item.slug}>
                <Link href={hrefFor(item.slug)} className="room-chip room-chip-paper" onClick={onPick}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Link href={allHref} className="cta-ghost" onClick={onPick}>
        {allLabel}
      </Link>
    </div>
  );
}

function GenderList({
  gender,
  panel,
  onPick,
}: {
  gender: "women" | "men";
  panel?: GenderNav;
  onPick: () => void;
}) {
  if (!panel) return null;
  return (
    <div className="space-y-8">
      {panel.departments.map((department) => (
        <div key={department.slug}>
          <Link href={`/shop/${gender}/${department.slug}`} className="eyebrow" onClick={onPick}>
            {department.name}
          </Link>
          <ul className="mt-3 flex flex-wrap gap-2">
            {department.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/shop/${gender}/${category.slug}`}
                  className="room-chip room-chip-paper"
                  onClick={onPick}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Link href={`/${gender}`} className="cta-ghost" onClick={onPick}>
        All {gender}
      </Link>
    </div>
  );
}
