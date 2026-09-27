import Link from "next/link";
import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, RETURNS_DAYS, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Returns",
  description: `${SITE_NAME} accepts returns within ${RETURNS_DAYS} days of delivery, unused, with tags.`,
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Returns"
        title={`${RETURNS_DAYS} days.`}
        line={`Dutch distance-selling law. ${SITE_NAME} accepts the piece unused, with tags.`}
        splash="vermillion"
      />
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: "After delivery.",
            body: `You have ${RETURNS_DAYS} days after delivery to withdraw.`,
            splash: "ink",
          },
          {
            kicker: "02",
            title: "Unused. With tags.",
            body: `${SITE_NAME} accepts returns unused, with tags.`,
            splash: "cobalt",
          },
          {
            kicker: "03",
            title: "Write first.",
            body: (
              <>
                Write {COMPANY.email} with the order number. Wait for a reply before you send anything back.
                <Link href="/contact" className="cta-ghost mt-8 inline-flex">
                  Contact
                </Link>
              </>
            ),
            splash: "orange",
          },
          {
            kicker: "04",
            title: "The seat.",
            body: `${COMPANY.legalName}, ${COMPANY.streetAddress}, ${COMPANY.postalCode} ${COMPANY.addressLocality}.`,
            splash: "violet",
          },
        ]}
      />
      <HelpStreet current="/returns" />
    </div>
  );
}
