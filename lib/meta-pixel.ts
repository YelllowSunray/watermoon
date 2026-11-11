import { CURRENCY } from "@/lib/site";

const PIXEL = /^\d{5,20}$/;
const VARIANT_ID = /(?:gid:\/\/shopify\/ProductVariant\/)?(\d+)\s*$/;

export function getMetaPixelId() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return PIXEL.test(id) ? id : null;
}

/** Numeric Shopify variant id — the Meta catalog item id from the Facebook & Instagram app. */
export function catalogItemId(gid: string) {
  return VARIANT_ID.exec(gid)?.[1] ?? "";
}

export function pixelContents(
  items: Array<{ id: string; quantity: number; price: number }>,
) {
  return items
    .map((item) => {
      const id = catalogItemId(item.id);
      if (!id) return null;
      return { id, quantity: item.quantity, item_price: item.price };
    })
    .filter((item): item is { id: string; quantity: number; item_price: number } => Boolean(item));
}

export function pixelCommerce(
  items: Array<{ id: string; quantity: number; price: number }>,
  extra?: { content_name?: string; num_items?: number },
) {
  const contents = pixelContents(items);
  return {
    content_ids: contents.map((item) => item.id),
    content_type: "product" as const,
    contents,
    value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    currency: CURRENCY,
    ...(extra?.content_name ? { content_name: extra.content_name } : {}),
    ...(extra?.num_items != null ? { num_items: extra.num_items } : {}),
  };
}
