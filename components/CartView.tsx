"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { track } from "@/components/pixel";
import { useStore } from "@/components/store";
import { formatMoney } from "@/lib/format";
import { sizeLine } from "@/lib/kit";
import { pixelCommerce } from "@/lib/meta-pixel";
import { BuyTrust, EmptyBag } from "@/components/BuyTrust";
import { PaymentMarks } from "@/components/PaymentMarks";
import { isBagVariantId } from "@/lib/storage";

export function CartView() {
  const { bag, updateQty, removeFromBag } = useStore();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const total = bag.reduce((sum, line) => sum + line.price * line.quantity, 0);

  async function checkout() {
    setError("");
    if (bag.some((line) => !isBagVariantId(line.variantId))) {
      setError("Remove that line and add the piece again.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: bag.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
          })),
        }),
      });
      const json = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!response.ok || !json.checkoutUrl) {
        setError(json.error || "Could not start checkout.");
        return;
      }
      track(
        "InitiateCheckout",
        pixelCommerce(
          bag.map((line) => ({
            id: line.variantId,
            quantity: line.quantity,
            price: line.price,
          })),
          { num_items: bag.reduce((sum, line) => sum + line.quantity, 0) },
        ),
      );
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Could not start checkout.");
    } finally {
      setPending(false);
    }
  }

  if (bag.length === 0) {
    return <EmptyBag />;
  }

  return (
    <div className="max-w-3xl">
      <ul className="space-y-8">
        {bag.map((line) => (
          <li key={line.variantId} className="flex gap-5 border-b border-line pb-8">
            <Link href={`/product/${line.handle}`} className="relative block h-36 w-28 overflow-hidden bg-white">
              {line.image ? (
                <Image
                  src={line.image}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="112px"
                />
              ) : null}
            </Link>
            <div className="flex-1">
              <p className="eyebrow">{line.brand}</p>
              <p className="mt-1">{line.name}</p>
              <p className="mt-1 text-sm text-dust">
                {[line.color, sizeLine(line.size)].filter(Boolean).join(" · ")}
              </p>
              {isBagVariantId(line.variantId) ? null : (
                <p className="mt-2 text-sm text-dust">
                  Remove this line and add the piece again.
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 text-sm">
                <button type="button" onClick={() => updateQty(line.variantId, line.quantity - 1)}>
                  −
                </button>
                <span>{line.quantity}</span>
                <button type="button" onClick={() => updateQty(line.variantId, line.quantity + 1)}>
                  +
                </button>
                <button
                  type="button"
                  className="ml-4 text-dust"
                  onClick={() => removeFromBag(line.variantId)}
                >
                  Remove
                </button>
              </div>
            </div>
            <p>{formatMoney(line.price * line.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between text-sm">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
        <button type="button" className="cta w-full min-h-14" disabled={pending} onClick={checkout}>
          {pending ? "Reserving…" : `Checkout · ${formatMoney(total)}`}
        </button>
        <BuyTrust className="mt-4" />
      </div>
      <PaymentMarks className="mt-6" />
      {error ? <p className="mt-4 text-sm text-dust">{error}</p> : null}
    </div>
  );
}
