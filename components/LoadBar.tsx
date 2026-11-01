"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadBar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const pending = useRef(false);
  const timers = useRef<number[]>([]);

  function clear() {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
  }

  function start() {
    clear();
    pending.current = true;
    setVisible(true);
    setWidth(28);
    timers.current.push(window.setTimeout(() => setWidth(62), 80));
    timers.current.push(window.setTimeout(() => setWidth(84), 240));
  }

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest("a");
      if (!target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (target.target && target.target !== "_self") return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      try {
        const next = new URL(href, window.location.origin);
        if (next.origin !== window.location.origin) return;
        if (next.pathname === window.location.pathname && next.search === window.location.search) {
          return;
        }
      } catch {
        return;
      }
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    setWidth(100);
    timers.current.push(
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 280),
    );
  }, [pathname, search]);

  useEffect(() => () => clear(), []);

  if (!visible) return null;

  return <div className="load-bar" style={{ width: `${width}%` }} />;
}
