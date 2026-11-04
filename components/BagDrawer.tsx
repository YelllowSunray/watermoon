"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/store";
import { track } from "@/components/pixel";
import { formatMoney } from "@/lib/format";
import { CURRENCY } from "@/lib/site";
import { BuyTrust, EmptyBag } from "@/components/BuyTrust";
import { PaymentMarks } from "@/components/PaymentMarks";
import { isBagVariantId } from "@/lib/storage";

export function BagDrawer() {
  const { bag, bagOpen, setBagOpen, updateQty, removeFromBag } = useStore();
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
        variantIds?: string[];
      };
      if (!response.ok || !json.checkoutUrl) {
        setError(json.error || "Could not start checkout.");
        return;
      }
      track("InitiateCheckout", {
        content_ids: bag.map((line) => line.handle),
        value: total,
        currency: CURRENCY,
        num_items: bag.length,
      });
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Could not start checkout.");
    } finally {
      setPending(false);
    }
  }

  if (!bagOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="bag-scrim absolute inset-0 bg-ink/20"
        aria-label="Close bag"
        onClick={() => setBagOpen(false)}
      />
      <aside className="bag-sheet absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-[-16px_0_40px_rgba(12,12,12,0.08)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="display text-2xl">Bag</p>
          <button type="button" className="flex h-11 items-center eyebrow" onClick={() => setBagOpen(false)}>
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {bag.length === 0 ? (
            <EmptyBag />
          ) : (
            <ul className="space-y-6">
              {bag.map((line) => (
                <li key={line.variantId} className="flex gap-4">
                  <Link
                    href={`/product/${line.handle}`}
                    className="relative block h-28 w-[90px] overflow-hidden bg-white"
                    onClick={() => setBagOpen(false)}
                  >
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="90px"
                      />
                    ) : null}
                  </Link>
                  <div className="flex-1">
                    <p className="eyebrow">{line.brand}</p>
                    <p className="mt-1 text-sm">{line.name}</p>
                    <p className="mt-1 text-xs text-dust">
                      {[line.color, line.size].filter(Boolean).join(" · ")}
                    </p>
                    {isBagVariantId(line.variantId) ? null : (
                      <p className="mt-2 text-xs text-dust">
                        Remove this line and add the piece again.
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => updateQty(line.variantId, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(line.variantId, line.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs text-dust"
                        onClick={() => removeFromBag(line.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm">{formatMoney(line.price * line.quantity)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-line px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {error ? <p className="mb-3 text-sm text-dust">{error}</p> : null}
          <div className="mb-4 flex justify-between text-sm">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
          <button
            type="button"
            className="cta w-full min-h-14"
            disabled={bag.length === 0 || pending}
            onClick={checkout}
          >
            {pending ? "Reserving…" : bag.length === 0 ? "Bag is empty" : `Checkout · ${formatMoney(total)}`}
          </button>
          <BuyTrust className="mt-4 justify-center" />
          <PaymentMarks className="mt-4 justify-center" />
          <Link
            href="/cart"
            className="mt-3 block text-center text-xs text-dust"
            onClick={() => setBagOpen(false)}
          >
            View bag
          </Link>
        </div>
      </aside>
    </div>
  );
}
