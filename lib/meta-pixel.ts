const PIXEL = /^\d{5,20}$/;

export function getMetaPixelId() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return PIXEL.test(id) ? id : null;
}
