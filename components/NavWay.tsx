"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SITE_NAME } from "@/lib/site";

const LAST_BROWSE = "wm-last-browse";
const BROWSE = /^\/(women|men|looks|stories|brands|sale|shop|search|wishlist)/;

function parentOf(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "shop" && parts[1]) return `/${parts[1]}`;
  if (parts[0] === "looks" && parts[1]) return "/looks";
  if (parts[0] === "stories" && parts[1]) return "/stories";
  if (parts[0] === "brands" && parts[1]) return "/brands";
  if (parts[0] === "product") {
    try {
      const last = sessionStorage.getItem(LAST_BROWSE);
      if (last) return last;
    } catch {
      /* private mode */
    }
  }
  return "/";
}

export function NavBack() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!BROWSE.test(pathname)) return;
    try {
      sessionStorage.setItem(LAST_BROWSE, pathname);
    } catch {
      /* private mode */
    }
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <button
      type="button"
      className="flex h-11 w-11 shrink-0 items-center justify-center text-ink transition-opacity duration-160 ease-out hover:opacity-60"
      aria-label="Previous page"
      onClick={() => {
        try {
          const fromHere = document.referrer.startsWith(window.location.origin);
          if (fromHere && window.history.length > 1) {
            router.back();
            return;
          }
        } catch {
          /* ignore */
        }
        router.push(parentOf(pathname));
      }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          d="M15.2 4.7 7.9 12l7.3 7.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}

export function NavStart({ onPick }: { onPick?: () => void }) {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} start`}
      className="hidden h-11 w-11 shrink-0 items-center justify-center text-ink transition-opacity duration-160 ease-out hover:opacity-60 xl:flex"
      onClick={onPick}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          d="M4.5 11.2 12 4.8l7.5 6.4V20h-5.2v-5.2H9.7V20H4.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="miter"
        />
      </svg>
    </Link>
  );
}

export function NavHome({ onPick }: { onPick?: () => void }) {
  const pathname = usePathname();
  const home = pathname === "/";

  return (
    <Link
      href="/"
      aria-current={home ? "page" : undefined}
      aria-label={SITE_NAME}
      className="flex items-center gap-2.5"
      onClick={onPick}
    >
      <span className="hidden h-9 w-9 shrink-0 items-center justify-center bg-ink text-white xl:flex xl:h-10 xl:w-10">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path
            fill="currentColor"
            d="M16 6a10 10 0 1 0 9.15 13.95 8 8 0 1 1-9.05-11.7A10 10 0 0 0 16 6z"
          />
        </svg>
      </span>
      <span className="display shrink-0 text-[22px] leading-none xl:text-[36px]">{SITE_NAME}</span>
    </Link>
  );
}
