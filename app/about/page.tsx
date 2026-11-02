import Link from "next/link";
import { HelpFacts, HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, SITE_NAME, SOCIAL, companyAddressLines } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `${SITE_NAME} is the shop. ${COMPANY.legalName} is the company in Hilversum.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div>
      <HelpMast
        eyebrow="About"
        title={`${SITE_NAME} is the shop.`}
        line={`${COMPANY.legalName} operates it. The legal seat is Hilversum.`}
        splash="ink"
      />
      <HelpFacts
        items={[
          {
            kicker: "01",
            title: COMPANY.legalName,
            body: `Operates ${SITE_NAME}. The brand is the shop. The company is the imprint.`,
            splash: "cobalt",
          },
          {
            kicker: "02",
            title: "Hilversum.",
            body: companyAddressLines().join(", "),
            splash: "vermillion",
          },
          {
            kicker: "03",
            title: "The numbers.",
            body: (
              <>
                KvK-Nummer {COMPANY.kvk}.
                <br />
                Btw-Nummer {COMPANY.vatId}.
              </>
            ),
            splash: "violet",
          },
          {
            kicker: "04",
            title: "Write or call.",
            body: (
              <>
                <a href={`mailto:${COMPANY.email}`} className="block">
                  {COMPANY.email}
                </a>
                <a href={`tel:${COMPANY.phone}`} className="mt-2 block">
                  {COMPANY.phoneDisplay}
                </a>
                <span className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                  {SOCIAL.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="me noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  ))}
                </span>
                <Link href="/contact" className="cta-ghost mt-8 inline-flex">
                  Contact
                </Link>
              </>
            ),
            splash: "chartreuse",
          },
        ]}
      />
      <HelpStreet current="/about" />
    </div>
  );
}
