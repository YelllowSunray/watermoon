import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { PaymentMarks } from "@/components/PaymentMarks";
import { COMPANY, SHIPS_LINE, SITE_NAME, SOCIAL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line px-5 py-14 md:px-10 2xl:px-16">
      <div className="grid gap-12 md:grid-cols-4">
        <div>
          <p className="display text-3xl">{SITE_NAME}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-dust">
            {SHIPS_LINE}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {SOCIAL.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="me noopener noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-8 md:contents">
          <div>
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/women">Women</Link>
              </li>
              <li>
                <Link href="/men">Men</Link>
              </li>
              <li>
                <Link href="/looks">Looks</Link>
              </li>
              <li>
                <Link href="/stories">The edit</Link>
              </li>
              <li>
                <Link href="/sale">Sale</Link>
              </li>
              <li>
                <Link href="/brands">Brands</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Help</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" prefetch={false}>Contact</Link>
              </li>
              <li>
                <Link href="/about" prefetch={false}>About</Link>
              </li>
              <li>
                <Link href="/faq" prefetch={false}>FAQ</Link>
              </li>
              <li>
                <Link href="/sizes" prefetch={false}>Sizes</Link>
              </li>
              <li>
                <Link href="/shipping" prefetch={false}>Shipping</Link>
              </li>
              <li>
                <Link href="/returns" prefetch={false}>Returns</Link>
              </li>
              <li>
                <Link href="/account" prefetch={false}>Account</Link>
              </li>
              <li>
                <Link href="/privacy" prefetch={false}>Privacy</Link>
              </li>
              <li>
                <Link href="/terms" prefetch={false}>Terms</Link>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Notes</p>
          <NewsletterForm compact />
          <address className="mt-6 text-xs leading-5 text-dust not-italic">
            {COMPANY.legalName}
            <br />
            {COMPANY.streetAddress}
            <br />
            {COMPANY.postalCode} {COMPANY.addressLocality}
            <br />
            {COMPANY.addressCountryName}
            <br />
            KvK-Nummer {COMPANY.kvk}
            <br />
            Btw-Nummer {COMPANY.vatId}
            <br />
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            <br />
            <a href={`tel:${COMPANY.phone}`}>{COMPANY.phoneDisplay}</a>
          </address>
        </div>
      </div>
      <PaymentMarks className="mt-12" />
    </footer>
  );
}
