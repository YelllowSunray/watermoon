import { CURRENCY } from "@/lib/site";

export function formatMoney(amount: number, currency = CURRENCY) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
