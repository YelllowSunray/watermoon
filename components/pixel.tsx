"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

let sawFirstPath = false;
const pending: Array<[string, Record<string, unknown> | undefined]> = [];
let flushing = false;

function flush() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  flushing = false;
  while (pending.length > 0) {
    const [event, data] = pending.shift()!;
    window.fbq("track", event, data);
  }
}

function waitForFbq() {
  if (flushing || typeof window === "undefined") return;
  flushing = true;
  let tries = 0;
  const tick = () => {
    if (typeof window.fbq === "function") {
      flush();
      return;
    }
    tries += 1;
    if (tries > 50) {
      flushing = false;
      return;
    }
    window.setTimeout(tick, 200);
  };
  tick();
}

export function track(event: string, data?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      window.fbq("track", event, data);
      return;
    }
    pending.push([event, data]);
    waitForFbq();
  } catch {
    // Pixel stub not loaded or blocked.
  }
}

/** Extra PageView after the first paint — client-side route changes only. */
export function MetaPixel({ id }: { id: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!id) return;
    if (!sawFirstPath) {
      sawFirstPath = true;
      return;
    }
    track("PageView");
  }, [id, pathname]);

  return null;
}
