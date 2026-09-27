import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Privacy",
  description: `What ${SITE_NAME} keeps in the browser, on Shopify, and with analytics.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Privacy"
        title="What we keep."
        line="The bag stays on this device until you check out. Payment never touches this site."
        splash="violet"
      />
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: "On this browser.",
            body: `${SITE_NAME} stores a bag, a wishlist, and recently viewed handles in your browser (localStorage — bag cookies on this device). They do not leave the device unless you check out or subscribe.`,
            splash: "ink",
          },
          {
            kicker: "02",
            title: "Checkout is Shopify.",
            body: "Checkout runs on Shopify. Payment details never touch this site. Account sits on shopify.com.",
            splash: "cobalt",
          },
          {
            kicker: "03",
            title: "Analytics.",
            body: "Analytics come from Vercel Analytics. If a Meta Pixel ID is set and is digits only, we load the official Facebook stub and fbevents.js. We send PageView, ViewContent, AddToCart, AddToWishlist, and InitiateCheckout. We do not send Purchase from this domain.",
            splash: "orange",
          },
          {
            kicker: "04",
            title: "The newsletter.",
            body: "The newsletter creates a Shopify customer with marketing consent. An address already on file is treated as success.",
            splash: "vermillion",
          },
          {
            kicker: "05",
            title: "Controller.",
            body: `${COMPANY.legalName}, ${COMPANY.streetAddress}, ${COMPANY.postalCode} ${COMPANY.addressLocality}. ${COMPANY.email}.`,
            splash: "chartreuse",
          },
        ]}
      />
      <HelpStreet current="/privacy" />
    </div>
  );
}
