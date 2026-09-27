export type LookSplash = "cobalt" | "vermillion" | "chartreuse" | "violet" | "orange" | "ink";

export type LookDefinition = {
  slug: string;
  title: string;
  line: string;
  gender: "women" | "men";
  splash: LookSplash;
  heroHandle: string;
  handles: string[];
  home?: boolean;
};

/**
 * Shoppable outfits from live syi12w-cq handles only.
 * getProductsByHandles drops anything not in stock. Never pad.
 */
export const LOOKS: LookDefinition[] = [
  {
    slug: "desk-jacket",
    title: "The desk jacket",
    line: "Blauer, a jean, a boot that means it.",
    gender: "women",
    splash: "cobalt",
    heroHandle: "2477820-blauer-women-blazer",
    home: true,
    handles: [
      "2477820-blauer-women-blazer",
      "2476405-armani-exchange-women-jeans",
      "475668-timberland-women-boots",
    ],
  },
  {
    slug: "milan-close",
    title: "Milan, closed",
    line: "Pinko on the body. A bag in the hand.",
    gender: "women",
    splash: "vermillion",
    heroHandle: "486981-pinko-women-dress",
    handles: [
      "486981-pinko-women-dress",
      "2478115-armani-exchange-women-bag",
      "2476156-voile-blanche-women-sneakers",
    ],
  },
  {
    slug: "after-dark",
    title: "After dark",
    line: "A dress that stays out. Then the boot.",
    gender: "women",
    splash: "violet",
    heroHandle: "486977-diesel-women-dress",
    home: true,
    handles: [
      "486977-diesel-women-dress",
      "2476011-love-moschino-women-bag",
      "423820-dr-martens-women-boots",
    ],
  },
  {
    slug: "white-and-blue",
    title: "White and blue",
    line: "Sweatshirt. Jean. The walk between them.",
    gender: "men",
    splash: "cobalt",
    heroHandle: "2477740-dickies-men-sweatshirts",
    home: true,
    handles: [
      "2477740-dickies-men-sweatshirts",
      "2477615-superdry-men-jeans",
      "496992-calvin-klein-jeans-men-sneakers",
    ],
  },
  {
    slug: "wet-street",
    title: "Wet street",
    line: "Rains does the jacket. The rest follows.",
    gender: "women",
    splash: "chartreuse",
    heroHandle: "2477771-rains-women-blazer",
    handles: [
      "2477771-rains-women-blazer",
      "2476497-only-women-jeans",
      "519963-armani-exchange-women-bag",
    ],
  },
  {
    slug: "timber-walk",
    title: "Timber walk",
    line: "The boot first. Denim second.",
    gender: "women",
    splash: "orange",
    heroHandle: "475677-timberland-women-boots",
    handles: [
      "475677-timberland-women-boots",
      "2477503-g-star-women-jeans",
      "2476090-desigual-women-blazer",
    ],
  },
  {
    slug: "guess-step",
    title: "The white step",
    line: "A sneaker. Then the jacket.",
    gender: "women",
    splash: "ink",
    heroHandle: "2476423-armani-exchange-women-sneakers",
    handles: [
      "2476423-armani-exchange-women-sneakers",
      "2476497-only-women-jeans",
      "2477600-only-women-blazer",
    ],
  },
  {
    slug: "pinko-knit",
    title: "Pinko at dusk",
    line: "The Milan house, then the bag.",
    gender: "women",
    splash: "cobalt",
    heroHandle: "486880-pinko-women-dress",
    handles: [
      "486880-pinko-women-dress",
      "2478124-armani-exchange-women-bag",
      "2476491-converse-women-sneakers",
    ],
  },
  {
    slug: "boss-cut",
    title: "Boss cut",
    line: "Three pieces. One house.",
    gender: "men",
    splash: "vermillion",
    heroHandle: "2476072-boss-men-jeans",
    handles: [
      "2476072-boss-men-jeans",
      "2476022-boss-men-sneakers",
      "2476096-boss-men-belt",
    ],
  },
  {
    slug: "barbour-cut",
    title: "Barbour cut",
    line: "The field jacket. Then the boot.",
    gender: "men",
    splash: "violet",
    heroHandle: "2476352-barbour-men-blazer",
    handles: [
      "2476352-barbour-men-blazer",
      "2476067-replay-men-jeans",
      "475661-timberland-men-boots",
    ],
  },
  {
    slug: "kway-blue",
    title: "K-Way blue",
    line: "The jacket first. Then the walk.",
    gender: "men",
    splash: "orange",
    heroHandle: "2476181-kway-men-blazer",
    handles: [
      "2476181-kway-men-blazer",
      "2477723-dickies-men-trousers",
      "475794-new-balance-men-sneakers",
    ],
  },
  {
    slug: "timber-shirt",
    title: "Timber shirt",
    line: "The shirt. Then the boot.",
    gender: "men",
    splash: "chartreuse",
    heroHandle: "2477730-timberland-men-shirt",
    handles: [
      "2477730-timberland-men-shirt",
      "2476131-levi-s-men-jeans",
      "490198-dr-martens-men-boots",
    ],
  },
  {
    slug: "napa-grey",
    title: "Napa grey",
    line: "The mountain house. Then the jean.",
    gender: "men",
    splash: "ink",
    heroHandle: "2477924-napapijri-men-sweatshirts",
    handles: [
      "2477924-napapijri-men-sweatshirts",
      "2476037-only-sons-men-jeans",
      "475665-timberland-men-sneakers",
    ],
  },
  {
    slug: "replay-cut",
    title: "Replay cut",
    line: "Shirt. Jean. The pair.",
    gender: "men",
    splash: "cobalt",
    heroHandle: "2476064-replay-men-shirt",
    handles: [
      "2476064-replay-men-shirt",
      "2476331-replay-men-jeans",
      "2476071-boss-men-sneakers",
    ],
  },
  {
    slug: "ax-desk",
    title: "AX desk",
    line: "The jacket, the trouser, the bag.",
    gender: "men",
    splash: "vermillion",
    heroHandle: "2476419-armani-exchange-men-blazer",
    handles: [
      "2476419-armani-exchange-men-blazer",
      "2476799-armani-exchange-men-trousers",
      "2476393-armani-exchange-men-bag",
    ],
  },
  {
    slug: "ea7-run",
    title: "EA7 run",
    line: "The jacket. Then the pair.",
    gender: "men",
    splash: "violet",
    heroHandle: "2478090-ea7-men-jacket",
    handles: [
      "2478090-ea7-men-jacket",
      "2476147-the-north-face-men-trousers",
      "2476141-ea7-men-sneakers",
    ],
  },
  {
    slug: "docs-night",
    title: "Docs night",
    line: "The shirt. Then the boot that means it.",
    gender: "men",
    splash: "orange",
    heroHandle: "489412-neil-barrett-men-shirt",
    handles: [
      "489412-neil-barrett-men-shirt",
      "493153-county-of-milan-men-trousers",
      "490198-dr-martens-men-boots",
    ],
  },
  {
    slug: "dark-glasses",
    title: "Last on",
    line: "The dress. Then the bag.",
    gender: "women",
    splash: "vermillion",
    heroHandle: "486597-pinko-women-dress",
    handles: [
      "486597-pinko-women-dress",
      "2478129-armani-exchange-women-bag",
      "2476127-voile-blanche-women-sneakers",
    ],
  },
  {
    slug: "converse-city",
    title: "Converse city",
    line: "The sneaker you already own, dressed.",
    gender: "women",
    splash: "violet",
    heroHandle: "2476491-converse-women-sneakers",
    handles: [
      "2476491-converse-women-sneakers",
      "2477418-pepe-jeans-women-jeans",
      "2476494-only-women-shirt",
    ],
  },
  {
    slug: "barbour-field",
    title: "Barbour field",
    line: "The shirt. Then the boot.",
    gender: "women",
    splash: "chartreuse",
    heroHandle: "2477693-barbour-women-shirt",
    handles: [
      "2477693-barbour-women-shirt",
      "130247-only-women-jeans",
      "475677-timberland-women-boots",
    ],
  },
];

export function getLookDefinition(slug: string) {
  return LOOKS.find((look) => look.slug === slug);
}

export function lookForHandle(handle: string) {
  return LOOKS.find(
    (look) => look.heroHandle === handle || look.handles.includes(handle),
  );
}

const HOME_LOOK_SLUGS = [
  "desk-jacket",
  "after-dark",
  "white-and-blue",
  "wet-street",
  "boss-cut",
] as const;

export function homeLookDefinitions() {
  return HOME_LOOK_SLUGS.map((slug) => LOOKS.find((look) => look.slug === slug)).filter(
    (look): look is LookDefinition => Boolean(look),
  );
}

export function looksForGender(gender: "women" | "men") {
  return LOOKS.filter((look) => look.gender === gender);
}

export const STREET_SPLASH: LookSplash[] = [
  "cobalt",
  "vermillion",
  "violet",
  "orange",
  "chartreuse",
  "ink",
];

export function streetSplash(index: number, offset = 0): LookSplash {
  return STREET_SPLASH[(index + offset + STREET_SPLASH.length) % STREET_SPLASH.length];
}

export function hoverLooks(need = 4) {
  return {
    hers: looksForGender("women").slice(0, need),
    his: looksForGender("men").slice(0, need),
  };
}

function roomOfHandle(handle: string) {
  const tail = handle.toLowerCase();
  if (/(boots?|sneakers?|shoes?|moccasins?|slippers?|sandals?|loafers?)$/.test(tail)) {
    return "shoes";
  }
  if (/(bags?|sunglasses?|belts?|wallets?|hats?|scarves|scarf)$/.test(tail)) {
    return "accessories";
  }
  return "clothing";
}

export function looksForShop(gender: "women" | "men", slug?: string) {
  const gendered = looksForGender(gender);
  if (!slug) return gendered;

  if (slug === "clothing" || slug === "shoes" || slug === "accessories") {
    const heroHit = gendered.filter((look) => roomOfHandle(look.heroHandle) === slug);
    if (heroHit.length > 0) return heroHit;
    return gendered.filter((look) => look.handles.some((handle) => roomOfHandle(handle) === slug));
  }

  const needle = slug.toLowerCase().replace(/-/g, "");
  return gendered.filter(
    (look) =>
      look.handles.some((handle) => handle.replace(/-/g, "").includes(needle)) ||
      look.title.toLowerCase().replace(/[\s,]/g, "").includes(needle),
  );
}

export function looksForBrand(slug: string) {
  const needle = `-${slug}-`;
  return LOOKS.filter(
    (look) => look.heroHandle.includes(needle) || look.handles.some((handle) => handle.includes(needle)),
  );
}

export const SPLASH_FIELD: Record<LookSplash, string> = {
  cobalt: "field-cobalt",
  vermillion: "field-vermillion",
  chartreuse: "field-chartreuse",
  violet: "field-violet",
  orange: "field-orange",
  ink: "field-ink",
};
