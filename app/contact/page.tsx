import { ContactForm } from "@/components/ContactForm";
import { HelpMast, HelpStreet } from "@/components/HelpStreet";
import { COMPANY, SOCIAL, companyAddressLines, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: `Call or write ${SITE_NAME}. ${COMPANY.phoneDisplay}. ${COMPANY.email}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div>
      <HelpMast eyebrow="Contact" title="Call or write." splash="cobalt">
        <a href={`tel:${COMPANY.phone}`} className="display mt-10 block text-4xl md:text-6xl">
          {COMPANY.phoneDisplay}
        </a>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`tel:${COMPANY.phone}`} className="cta-splash">
            Call
          </a>
          <a href={`mailto:${COMPANY.email}`} className="cta-ghost">
            Email
          </a>
        </div>
      </HelpMast>

      <div className="grid md:grid-cols-2">
        <section className="field-ink flex flex-col justify-between px-5 py-14 md:min-h-[56vh] md:px-10 md:py-16">
          <div>
            <p className="eyebrow">Reach</p>
            <a href={`tel:${COMPANY.phone}`} className="display mt-6 block text-4xl md:text-6xl">
              {COMPANY.phoneDisplay}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="display mt-4 block text-2xl md:text-4xl">
              {COMPANY.email}
            </a>
            <p className="mt-10 max-w-sm text-sm leading-6">
              {SITE_NAME} is the shop. {COMPANY.legalName} is the company.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
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
            </p>
          </div>
          <address className="mt-16 text-sm leading-6 not-italic">
            {COMPANY.legalName}
            <br />
            {companyAddressLines().join(", ")}
            <br />
            KvK-Nummer {COMPANY.kvk}
            <br />
            Btw-Nummer {COMPANY.vatId}
          </address>
        </section>
        <section className="field-chartreuse px-5 py-14 md:px-10 md:py-16">
          <p className="eyebrow mb-8">Write</p>
          <ContactForm />
        </section>
      </div>

      <HelpStreet current="/contact" />
    </div>
  );
}
