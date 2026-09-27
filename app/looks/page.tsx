import Image from "next/image";
import Link from "next/link";
import { getLookPreviews } from "@/lib/looks";
import { SPLASH_FIELD } from "@/lib/looks-data";

export const revalidate = 300;

export const metadata = {
  title: "Looks",
  description: "Shop the look. Outfits from this shop, not a dump.",
  alternates: { canonical: "/looks" },
};

export default async function LooksPage() {
  const looks = await getLookPreviews();
  const hers = looks.filter((look) => look.gender === "women");
  const his = looks.filter((look) => look.gender === "men");

  return (
    <div>
      <section className="field-chartreuse flex items-end justify-between gap-6 px-5 py-8 md:px-10 md:py-10">
        <div>
          <p className="eyebrow">Shop the look</p>
          <h1 className="display mt-3 max-w-3xl text-4xl md:text-6xl">
            The outfit. Then the pieces.
          </h1>
        </div>
      </section>

      <WorldStreet label="Women" splash="field-vermillion" looks={hers} />
      <WorldStreet label="Men" splash="field-ink" looks={his} />
    </div>
  );
}

function WorldStreet({
  label,
  splash,
  looks,
}: {
  label: string;
  splash: string;
  looks: Awaited<ReturnType<typeof getLookPreviews>>;
}) {
  if (looks.length === 0) return null;

  return (
    <section>
      <div className={`${splash} px-5 py-4 md:px-10`}>
        <p className="display text-2xl">{label}</p>
      </div>
      <ul className={`grid ${looks.length === 10 ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-3"}`}>
        {looks.map((look, index) => (
          <li key={look.slug}>
            <Link href={`/looks/${look.slug}`} className={`${SPLASH_FIELD[look.splash]} flex h-full flex-col`}>
              <div className="p-4">
                <div className="still">
                  {look.image ? (
                    <Image
                      src={look.image}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="33vw"
                      priority={index < 2}
                    />
                  ) : null}
                  <span className="absolute top-2 left-2 eyebrow bg-white px-1.5 py-0.5 text-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-end px-4 pb-5">
                <p className="eyebrow">{look.count} pieces</p>
                <p className="display mt-1 text-2xl md:text-3xl">{look.title}</p>
                <p className="mt-1 line-clamp-2 max-w-xs text-sm">{look.line}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
