import Link from "next/link";
import { HelpMast, HelpStreet } from "@/components/HelpStreet";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import { COMPANY, RETURNS_DAYS, SITE_NAME } from "@/lib/site";
import { SPLASH_FIELD, type LookSplash } from "@/lib/looks-data";

export const metadata = {
  title: "FAQ",
  description: `Short answers from ${SITE_NAME}. Pay on Shopify. Ships to the Netherlands. Returns in ${RETURNS_DAYS} days.`,
  alternates: { canonical: "/faq" },
};

const ITEMS: Array<{
  q: string;
  a: string;
  href: string;
  more: string;
  splash: LookSplash;
}> = [
  {
    q: "Where do I pay?",
    a: `You browse ${SITE_NAME} here. You pay on the Shopify checkout host. Payment details never touch this site.`,
    href: "/cart",
    more: "The bag",
    splash: "cobalt",
  },
  {
    q: "Where do you ship?",
    a: "We ship to the Netherlands. Rates and methods are set in Shopify and shown on the hosted checkout.",
    href: "/shipping",
    more: "Shipping",
    splash: "ink",
  },
  {
    q: "Can I send it back?",
    a: `Returns are accepted within ${RETURNS_DAYS} days of delivery, unused, with tags. Write first. Wait for a reply before you post anything.`,
    href: "/returns",
    more: "Returns",
    splash: "vermillion",
  },
  {
    q: "Where is my account?",
    a: "Account lives at shopify.com, not here. There is no login on this domain.",
    href: "/account",
    more: "Account",
    splash: "orange",
  },
  {
    q: "What if my size is missing?",
    a: "Size and colour sit on each product. If a size is missing, it is not for sale. Cloth and shoe sizes can be kept on this browser.",
    href: "/sizes",
    more: "Sizes",
    splash: "violet",
  },
  {
    q: "How do I write you?",
    a: `${COMPANY.email} or ${COMPANY.phoneDisplay}. ${COMPANY.legalName} is the company behind the shop.`,
    href: "/contact",
    more: "Contact",
    splash: "chartreuse",
  },
];

export default function FaqPage() {
  return (
    <div>
      <JsonLd data={faqJsonLd(ITEMS.map((item) => ({ q: item.q, a: item.a })))} />

      <HelpMast
        eyebrow="FAQ"
        title="The short answers."
        line="Six facts. The rest is on the piece, or on the checkout."
        splash="chartreuse"
      />

      <ul className="grid md:grid-cols-2">
        {ITEMS.map((item, index) => {
          const external = item.href.startsWith("http");
          return (
            <li key={item.q}>
              <section className={`${SPLASH_FIELD[item.splash]} flex h-full flex-col justify-between px-5 py-10 md:min-h-[42vh] md:px-10 md:py-12`}>
                <div>
                  <p className="eyebrow">{String(index + 1).padStart(2, "0")}</p>
                  <h2 className="display mt-3 text-3xl md:text-5xl">{item.q}</h2>
                  <p className="mt-5 max-w-md text-sm leading-6">{item.a}</p>
                </div>
                {external ? (
                  <a href={item.href} className="cta-ghost mt-10 w-fit">
                    {item.more}
                  </a>
                ) : (
                  <Link href={item.href} className="cta-ghost mt-10 w-fit">
                    {item.more}
                  </Link>
                )}
              </section>
            </li>
          );
        })}
      </ul>

      <HelpStreet current="/faq" />
    </div>
  );
}
