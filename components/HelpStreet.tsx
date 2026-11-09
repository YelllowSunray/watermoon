import Link from "next/link";
import type { ReactNode } from "react";
import { SPLASH_FIELD, type LookSplash } from "@/lib/looks-data";

export const HELP_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/sizes", label: "Sizes" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/account", label: "Account" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function HelpMast({
  eyebrow,
  title,
  line,
  splash,
  children,
}: {
  eyebrow: string;
  title: string;
  line?: string;
  splash: LookSplash;
  children?: ReactNode;
}) {
  return (
    <section className={`${SPLASH_FIELD[splash]} px-5 py-16 md:px-10 md:py-24`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display mt-4 max-w-3xl text-5xl md:text-7xl">{title}</h1>
      {line ? <p className="deck mt-6 max-w-md">{line}</p> : null}
      {children}
    </section>
  );
}

export function HelpFacts({
  items,
}: {
  items: Array<{ kicker: string; title: string; body: ReactNode; splash: LookSplash }>;
}) {
  const cols =
    items.length === 3 ? "md:grid-cols-3" : items.length === 1 ? "" : "md:grid-cols-2";

  return (
    <ul className={`grid ${cols}`}>
      {items.map((item, index) => (
        <li
          key={item.kicker}
          className={items.length === 5 && index === 4 ? "md:col-span-2" : undefined}
        >
          <section
            className={`${SPLASH_FIELD[item.splash]} flex h-full flex-col justify-end px-5 py-10 md:min-h-[36vh] md:px-10 md:py-12`}
          >
            <p className="eyebrow">{item.kicker}</p>
            <h2 className="display mt-3 text-3xl md:text-5xl">{item.title}</h2>
            <div className="mt-5 max-w-lg text-sm leading-6">{item.body}</div>
          </section>
        </li>
      ))}
    </ul>
  );
}

export function HelpStreet({ current }: { current: string }) {
  return (
    <section>
      <div className="px-5 py-10 md:px-10">
        <p className="eyebrow">Help</p>
      </div>
      <ul className="field-ink flex flex-wrap gap-x-8 gap-y-4 px-5 py-12 md:px-10">
        {HELP_LINKS.map((item) => (
          <li key={item.href}>
            {item.href === current ? (
              <span className="display text-3xl md:text-5xl underline decoration-2 underline-offset-8">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} prefetch={false} className="display text-3xl md:text-5xl">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
