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

export function track(event: string, data?: Record<string, unknown>) {
  window.fbq?.("track", event, data);
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
    window.fbq?.("track", "PageView");
  }, [id, pathname]);

  return null;
}
