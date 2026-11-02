import Link from "next/link";
import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, SHIPPING, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Shipping",
  description: `${SITE_NAME} ships worldwide. Economy ${SHIPPING.economyEurope} in Europe, ${SHIPPING.economyWorld} beyond. Rates show on checkout.`,
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Shipping"
        title="Worldwide."
        line={`Dispatched within ${SHIPPING.dispatch}. ${SHIPPING.carriers}. The rate is the one Shopify shows at checkout.`}
        splash="cobalt"
      />
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: "Most addresses.",
            body: `${SITE_NAME} ships worldwide. A few destinations are restricted. Checkout will not offer a rate if we cannot send there.`,
            splash: "ink",
          },
          {
            kicker: "02",
            title: "How long.",
            body: `Once the order is processed, the parcel leaves within ${SHIPPING.dispatch}. Economy takes ${SHIPPING.economyEurope} in Europe and ${SHIPPING.economyWorld} outside. Express takes ${SHIPPING.expressEurope} in Europe and ${SHIPPING.expressWorld} outside. Times are business days and can vary.`,
            splash: "orange",
          },
          {
            kicker: "03",
            title: "The courier.",
            body: `${SHIPPING.carriers}. The method and price are set on the hosted checkout, not invented here.`,
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
