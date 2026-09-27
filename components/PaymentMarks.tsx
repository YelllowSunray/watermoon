import type { ReactNode } from "react";
import { PAYMENT_MARKS } from "@/lib/payments";

function Mark({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <span className="pay-mark" title={title} aria-label={title}>
      <svg viewBox="0 0 46 30" width="46" height="30" aria-hidden>
        {children}
      </svg>
    </span>
  );
}

function Logo({ id }: { id: string }) {
  switch (id) {
    case "ideal":
      return (
        <Mark title="iDEAL">
          <rect width="46" height="30" rx="3" fill="#CC0066" />
          <text x="23" y="19" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            iDEAL
          </text>
        </Mark>
      );
    case "visa":
      return (
        <Mark title="Visa">
          <rect width="46" height="30" rx="3" fill="#1A1F71" />
          <text x="23" y="19.5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="ui-serif, Georgia, serif" fontStyle="italic">
            VISA
          </text>
        </Mark>
      );
    case "mastercard":
      return (
        <Mark title="Mastercard">
          <rect width="46" height="30" rx="3" fill="#fff" stroke="#e5e5e5" />
          <circle cx="19" cy="15" r="7" fill="#EB001B" />
          <circle cx="27" cy="15" r="7" fill="#F79E1B" />
          <path d="M23 10.2a7 7 0 0 1 0 9.6 7 7 0 0 1 0-9.6Z" fill="#FF5F00" />
        </Mark>
      );
    case "amex":
      return (
        <Mark title="American Express">
          <rect width="46" height="30" rx="3" fill="#2E77BB" />
          <text x="23" y="19" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            AMEX
          </text>
        </Mark>
      );
    case "apple-pay":
      return (
        <Mark title="Apple Pay">
          <rect width="46" height="30" rx="3" fill="#111" />
          <path
            fill="#fff"
            d="M13.8 12.2c.3-.4.8-.7 1.2-.8 0 .5.2.9.4 1.2.3.4.7.7 1.2.8-.5.4-1.1.4-1.6 0-.4-.3-.8-.7-1.2-1.2Zm2.2 1.3c.7 0 1.1.4 1.7.4.6 0 1-.5 1.8-.5.7 0 1.2.2 1.6.7-1.3.8-1.1 2.6.2 3.1-.3.6-.6 1.2-1.1 1.6-.4.4-.9.7-1.4.7-.5 0-.8-.2-1.3-.2s-.8.2-1.3.2c-.6 0-1-.3-1.5-.7-.5-.5-1-1.3-1.2-2.3.8 0 1.5-.5 1.9-1.2.3-.5.3-1.1.1-1.6.4-.1.9-.2 1.3-.2Z"
          />
          <text x="30" y="19" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="600" fontFamily="ui-sans-serif, system-ui">
            Pay
          </text>
        </Mark>
      );
    case "google-pay":
      return (
        <Mark title="Google Pay">
          <rect width="46" height="30" rx="3" fill="#fff" stroke="#e5e5e5" />
          <text x="23" y="19" textAnchor="middle" fill="#3c4043" fontSize="8" fontWeight="600" fontFamily="ui-sans-serif, system-ui">
            G Pay
          </text>
        </Mark>
      );
    case "shop-pay":
      return (
        <Mark title="Shop Pay">
          <rect width="46" height="30" rx="3" fill="#5433EB" />
          <text x="23" y="19" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            Shop Pay
          </text>
        </Mark>
      );
    case "bancontact":
      return (
        <Mark title="Bancontact">
          <rect width="46" height="30" rx="3" fill="#005498" />
          <rect x="0" y="22" width="46" height="8" rx="0" fill="#F7C600" />
          <text x="23" y="17" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            Bancontact
          </text>
        </Mark>
      );
    case "klarna":
      return (
        <Mark title="Klarna">
          <rect width="46" height="30" rx="3" fill="#FFB3C7" />
          <text x="23" y="19" textAnchor="middle" fill="#0a0a0a" fontSize="8" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            Klarna
          </text>
        </Mark>
      );
    default:
      return null;
  }
}

export function PaymentMarks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {PAYMENT_MARKS.map((mark) => (
        <li key={mark.id}>
          <Logo id={mark.id} />
        </li>
      ))}
    </ul>
  );
}
