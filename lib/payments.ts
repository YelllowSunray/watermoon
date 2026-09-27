export type PaymentMark = {
  id: string;
  name: string;
};

/** Shopify Payments methods for a Netherlands shop, plus Bancontact. */
export const PAYMENT_MARKS: PaymentMark[] = [
  { id: "ideal", name: "iDEAL" },
  { id: "visa", name: "Visa" },
  { id: "mastercard", name: "Mastercard" },
  { id: "amex", name: "American Express" },
  { id: "apple-pay", name: "Apple Pay" },
  { id: "google-pay", name: "Google Pay" },
  { id: "shop-pay", name: "Shop Pay" },
  { id: "bancontact", name: "Bancontact" },
  { id: "klarna", name: "Klarna" },
];
