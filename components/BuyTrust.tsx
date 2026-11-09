import Link from "next/link";
import { RETURNS_DAYS } from "@/lib/site";

export function BuyTrust({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-[13px] tracking-[0.08em] uppercase ${className}`}>
      <li>
        <Link href="/shipping">Ships worldwide</Link>
      </li>
      <li>
        <Link href="/returns">{RETURNS_DAYS}-day returns</Link>
      </li>
      <li>
        <Link href="/sizes">Sizes</Link>
      </li>
    </ul>
  );
}

export function EmptyBag() {
  return (
    <div>
      <p className="display text-3xl">Empty.</p>
      <p className="deck mt-3">Start with an outfit. Then the pieces.</p>
      <Link href="/looks" className="cta mt-8 inline-flex">
        Shop the look
      </Link>
      <p className="mt-5 flex gap-5 text-sm">
        <Link href="/women">Women</Link>
        <Link href="/men">Men</Link>
      </p>
    </div>
  );
}
