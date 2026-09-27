import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { PaymentMarks } from "@/components/PaymentMarks";
import { COMPANY, RETURNS_DAYS, SITE_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line px-5 py-14 md:px-10">
      <div className="grid gap-12 md:grid-cols-4">
        <div>
          <p className="display text-3xl">{SITE_NAME}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-dust">
            Ships to the Netherlands. Returns within {RETURNS_DAYS} days.
          </p>
        </div>
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
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/sizes">Sizes</Link>
            </li>
            <li>
              <Link href="/shipping">Shipping</Link>
            </li>
            <li>
              <Link href="/returns">Returns</Link>
            </li>
            <li>
              <Link href="/account">Account</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
          </ul>
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
