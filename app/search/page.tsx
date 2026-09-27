import { ShopGrid } from "@/components/ShopGrid";
import { queryProducts } from "@/lib/catalog";
import { toCard } from "@/lib/products";
import {
  intentChips,
  intentToShopifyQuery,
  parseSearchIntent,
  rankSearchResults,
} from "@/lib/search";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return {
    title: q ? `Search · ${q}` : "Search",
    alternates: { canonical: q ? `/search?q=${encodeURIComponent(q)}` : "/search" },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const intent = parseSearchIntent(q);
  const chips = intentChips(intent);
  const shopifyQuery = intentToShopifyQuery(intent);
  const raw = q.trim() ? await queryProducts(shopifyQuery, { maxPages: 1, first: 50 }) : [];
  const products = rankSearchResults(raw, intent);

  return (
    <div>
      <section className="field-ink px-5 py-12 md:px-10 md:py-16">
        <p className="eyebrow">Search</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">{q.trim() || "Look"}</h1>
      </section>
      {chips.length > 0 ? (
        <ul className="flex flex-wrap gap-2 px-5 py-8 md:px-10">
          {chips.map((chip) => (
            <li key={chip.key} className="border border-line px-3 py-1 text-xs uppercase tracking-[0.16em]">
              {chip.label}
            </li>
          ))}
        </ul>
      ) : null}
      {q.trim() ? (
        <ShopGrid products={products.map(toCard)} dense />
      ) : (
        <p className="px-5 py-14 text-sm text-dust md:px-10">Try “black blazer women 40”.</p>
      )}
    </div>
  );
}
