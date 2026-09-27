import Image from "next/image";
import Link from "next/link";
import { SPLASH_FIELD } from "@/lib/looks-data";

export type ShopLookPreview = {
  slug: string;
  title: string;
  line: string;
  splash: keyof typeof SPLASH_FIELD;
  image?: string;
  count: number;
};

export function ShopLooks({
  looks,
  kicker = "Shop the look",
  title = "Start with an outfit.",
}: {
  looks: ShopLookPreview[];
  kicker?: string;
  title?: string;
}) {
  if (looks.length === 0) return null;

  return (
    <section className="border-y border-line">
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-7 md:px-10">
        <div>
          <p className="eyebrow">{kicker}</p>
          <p className="display mt-2 text-3xl md:text-4xl">{title}</p>
        </div>
        <Link href="/looks" className="cta-ghost">
          All looks
        </Link>
      </div>
      <div className={`grid border-t border-line ${looks.length > 1 ? "md:grid-cols-2" : ""}`}>
        {looks.map((look) => (
          <Link
            key={look.slug}
            href={`/looks/${look.slug}`}
            className="group grid border-line md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:border-r last:md:border-r-0"
          >
            <div className="still">
              {look.image ? (
                <Image
                  src={look.image}
                  alt={look.title}
                  fill
                  className="object-contain transition-opacity duration-200 ease-out group-hover:opacity-80"
                  sizes="(min-width: 768px) 20vw, 100vw"
                />
              ) : null}
            </div>
            <div className="flex flex-col justify-center px-5 py-6 md:px-7">
              <span className={`mb-5 block h-1.5 w-16 ${SPLASH_FIELD[look.splash]}`} />
              <p className="eyebrow">{look.count} pieces</p>
              <p className="display mt-2 text-2xl md:text-3xl">{look.title}</p>
              <p className="mt-3 max-w-xs text-sm leading-6">{look.line}</p>
              <span className="cta-ghost mt-6 self-start">Shop this look</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
