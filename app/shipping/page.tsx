import Link from "next/link";
import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Shipping",
  description: `${SITE_NAME} ships to the Netherlands. Rates show on the Shopify checkout.`,
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Shipping"
        title="The Netherlands."
        line="Rates and methods are set in Shopify and shown on the hosted checkout, not invented here."
        splash="cobalt"
      />
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: "This country.",
            body: `${SITE_NAME} ships to the Netherlands.`,
            splash: "ink",
          },
          {
            kicker: "02",
            title: "On checkout.",
            body: "Checkout runs on the shop host. The rate you pay is the rate Shopify shows for that address.",
            splash: "orange",
          },
          {
            kicker: "03",
            title: "If a line disappears.",
            body: "The piece may sit at a location that does not fulfil web orders, or shipping is not offered for that address.",
            splash: "violet",
          },
          {
            kicker: "04",
            title: "If a parcel does not arrive.",
            body: (
              <>
                Write {COMPANY.email} with an order number.
                <Link href="/contact" className="cta-ghost mt-8 inline-flex">
                  Contact
                </Link>
              </>
            ),
            splash: "vermillion",
          },
        ]}
      />
      <HelpStreet current="/shipping" />
    </div>
  );
}
