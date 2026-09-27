import "server-only";

import { randomBytes } from "node:crypto";
import { CUSTOMER_CREATE_MUTATION } from "@/lib/shopify/queries";
import { shopifyStorefrontGraphql } from "@/lib/shopify/storefront";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UserErrors = Array<{
  field?: string[] | null;
  message: string;
  code?: string | null;
}>;

type StorefrontCustomerCreateResponse = {
  customerCreate: {
    customer: { id: string } | null;
    customerUserErrors: UserErrors;
  };
};

function alreadyOnFile(errors: UserErrors) {
  return errors.some((error) => {
    const haystack = `${error.code ?? ""} ${error.message}`;
    return /taken|already exists|already been taken/i.test(haystack);
  });
}

export function normalizeNewsletterEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isNewsletterEmail(value: string) {
  return value.length <= 254 && EMAIL.test(value);
}

export async function subscribeToShopifyMarketing(email: string) {
  const password = `Wm-${randomBytes(16).toString("hex")}aA1`;
  const data = await shopifyStorefrontGraphql<StorefrontCustomerCreateResponse>(
    CUSTOMER_CREATE_MUTATION,
    {
      input: {
        email,
        password,
        acceptsMarketing: true,
      },
    },
  );

  const { customer, customerUserErrors } = data.customerCreate;
  if (customer) return;
  if (alreadyOnFile(customerUserErrors)) return;

  throw new Error(
    customerUserErrors.map((error) => error.message).join("; ") ||
      "Shopify did not accept that email.",
  );
}
