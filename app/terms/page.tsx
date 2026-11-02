import Link from "next/link";
import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, RETURNS_DAYS, SHIP_CARRIERS, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Terms",
  description: `${SITE_NAME} is operated by ${COMPANY.legalName}. Ships worldwide. Returns in ${RETURNS_DAYS} days.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Terms"
        title="The short version."
        line={`${COMPANY.legalName} operates ${SITE_NAME}. Goods ship worldwide.`}
        splash="ink"
      />
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: "Who.",
            body: `${SITE_NAME} is operated by ${COMPANY.legalName}, ${COMPANY.streetAddress}, ${COMPANY.postalCode} ${COMPANY.addressLocality}, ${COMPANY.addressCountryName}.`,
            splash: "cobalt",
          },
          {
            kicker: "02",
            title: "Ship and return.",
            body: (
              <>
                Goods ship worldwide. Returns are accepted within {RETURNS_DAYS} days of delivery, unused, with tags. Send with {SHIP_CARRIERS} and a tracking number.
                <span className="mt-6 flex flex-wrap gap-3">
                  <Link href="/shipping" className="cta-ghost">
                    Shipping
                  </Link>
                  <Link href="/returns" className="cta-ghost">
                    Returns
                  </Link>
                </span>
              </>
            ),
            splash: "vermillion",
          },
          {
            kicker: "03",
            title: "Euro. Then Shopify.",
            body: "Prices are in euro. Checkout and payment are handled by Shopify on the shop host, not on this domain.",
            splash: "orange",
          },
          {
            kicker: "04",
            title: "The imprint.",
            body: (
              <>
                KvK {COMPANY.kvk}. VAT {COMPANY.vatId}. {COMPANY.email}. {COMPANY.phoneDisplay}.
                <Link href="/about" className="cta-ghost mt-8 inline-flex">
                  About
                </Link>
              </>
            ),
            splash: "violet",
          },
        ]}
      />
      <HelpStreet current="/terms" />
    </div>
  );
}
