import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { SHOPIFY_ACCOUNT_URL, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Account",
  description: `Account for ${SITE_NAME} lives on shopify.com. There is no login on this domain.`,
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Account"
        title="On Shopify. Not here."
        line="There is no login on this domain. Orders and addresses sit on shopify.com."
        splash="orange"
      >
        <a href={SHOPIFY_ACCOUNT_URL} className="cta-splash mt-10 inline-flex">
          Open account
        </a>
      </HelpMast>
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: "No login here.",
            body: `${SITE_NAME} does not keep an account on this domain.`,
            splash: "ink",
          },
          {
            kicker: "02",
            title: "shopify.com",
            body: (
              <>
                Account, orders, and addresses live on the Shopify host.
                <a href={SHOPIFY_ACCOUNT_URL} className="cta-ghost mt-8 inline-flex">
                  Open account
                </a>
              </>
            ),
            splash: "cobalt",
          },
          {
            kicker: "03",
            title: "The bag stays.",
            body: "Bag, wishlist, and sizes stay in this browser until you check out.",
            splash: "violet",
          },
          {
            kicker: "04",
            title: "You pay there.",
            body: "Payment details never touch this site. Checkout runs on the shop host.",
            splash: "vermillion",
          },
        ]}
      />
      <HelpStreet current="/account" />
    </div>
  );
}
