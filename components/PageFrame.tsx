"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-in">
      {children}
    </div>
  );
}
