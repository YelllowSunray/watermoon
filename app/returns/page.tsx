import Link from "next/link";
import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, RETURNS_DAYS, SHIP_CARRIERS, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Returns",
  description: `${SITE_NAME} accepts returns within ${RETURNS_DAYS} days of delivery, unused, with tags. ${SHIP_CARRIERS}, with tracking.`,
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Returns"
        title={`${RETURNS_DAYS} days.`}
        line={`Counted from delivery. Unused, with tags. Write first. Send with ${SHIP_CARRIERS} and a tracking number.`}
        splash="vermillion"
      />
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: "After delivery.",
            body: `Ask within ${RETURNS_DAYS} days of delivery. The parcel must also leave you within those ${RETURNS_DAYS} days. One piece, several, or the whole order.`,
            splash: "ink",
          },
          {
            kicker: "02",
            title: "Unused. With tags.",
            body: "Worn or used pieces are not refunded. They come back to you. Give a reason when you write.",
            splash: "cobalt",
          },
          {
            kicker: "03",
            title: "Write first.",
            body: (
              <>
                Write {COMPANY.email} with the order number. Wait for a reply and a return address before you send anything. We inspect the piece, then refund.
                <Link href="/contact" className="cta-ghost mt-8 inline-flex">
                  Contact
                </Link>
              </>
            ),
            splash: "orange",
          },
          {
            kicker: "04",
            title: "The courier.",
            body: `${SHIP_CARRIERS}, tracked. Regular post is refused. Send to the address we give you for that order — the wrong depot delays the refund.`,
            splash: "violet",
          },
        ]}
      />
      <HelpStreet current="/returns" />
    </div>
  );
}
