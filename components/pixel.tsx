"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

let booted = false;
let sawFirstPath = false;

export function track(event: string, data?: Record<string, unknown>) {
  window.fbq?.("track", event, data);
}

export function MetaPixel({ id }: { id: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.fbq) {
      booted = true;
      return;
    }

    const script = document.createElement("script");
    script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
    document.head.appendChild(script);
    booted = true;
  }, [id]);

  useEffect(() => {
    if (!booted) return;
    if (!sawFirstPath) {
      sawFirstPath = true;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <noscript>
      <img
        height={1}
        width={1}
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
