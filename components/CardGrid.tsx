import type { ReactNode } from "react";

const COLS = {
  shop: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  two: "grid-cols-1 md:grid-cols-2",
  three: "grid-cols-2 md:grid-cols-3",
  four: "grid-cols-2 md:grid-cols-4",
  five: "grid-cols-2 md:grid-cols-5",
  six: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
} as const;

export function CardGrid({
  children,
  cols = "shop",
}: {
  children: ReactNode;
  cols?: keyof typeof COLS;
}) {
  return <div className={`card-grid ${COLS[cols]}`}>{children}</div>;
}
