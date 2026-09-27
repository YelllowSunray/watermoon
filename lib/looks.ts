import "server-only";

import { getProduct, getProductsByHandles } from "@/lib/catalog";
import {
  LOOKS,
  getLookDefinition,
  homeLookDefinitions,
  looksForBrand,
  looksForGender,
  looksForShop,
  type LookDefinition,
} from "@/lib/looks-data";

export type Look = LookDefinition;
export {
  LOOKS,
  getLookDefinition as getLook,
  homeLookDefinitions as homeLooks,
  looksForBrand,
  looksForGender,
  looksForShop,
};

export async function getLookProducts(look: Look) {
  return getProductsByHandles(look.handles);
}

export async function getLookWithImage(look: Look) {
  const [products, named] = await Promise.all([
    getLookProducts(look),
    getProduct(look.heroHandle),
  ]);
  const hero =
    (named?.available ? named : undefined) ??
    products.find((product) => product.slug === look.heroHandle) ??
    products[0];
  return {
    look,
    products,
    image: hero?.images[0],
    hero,
  };
}

export async function getLookPreviews(slugs?: string[]) {
  const selected = slugs
    ? LOOKS.filter((look) => slugs.includes(look.slug))
    : LOOKS;

  const previews = await Promise.all(
    selected.map(async (look) => {
      const { products, image } = await getLookWithImage(look);
      return {
        slug: look.slug,
        title: look.title,
        line: look.line,
        splash: look.splash,
        gender: look.gender,
        image,
        count: products.length,
      };
    }),
  );

  return previews.filter((preview) => preview.count >= 2);
}

export async function getHomeKits(need = 3) {
  const featured = await Promise.all(homeLookDefinitions().map((look) => getLookWithImage(look)));
  const kits = featured.filter((item) => item.products.length >= 2);
  if (kits.length >= need) return kits.slice(0, need);

  const used = new Set(kits.map((item) => item.look.slug));
  const extras = await Promise.all(
    LOOKS.filter((look) => !used.has(look.slug)).map((look) => getLookWithImage(look)),
  );
  return [...kits, ...extras.filter((item) => item.products.length >= 2)].slice(0, need);
}
