import type {
  Department,
  Gender,
  Product,
  ProductColor,
  ProductTag,
  ProductVariant,
} from "@/lib/products";

export type ShopifyNavNode = {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  images: { nodes: Array<{ url: string }> };
};

export type ShopifyProductNode = ShopifyNavNode & {
  id: string;
  descriptionHtml: string;
  variants: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      quantityAvailable?: number | null;
      price: { amount: string };
      compareAtPrice: { amount: string } | null;
      selectedOptions: Array<{ name: string; value: string }>;
    }>;
  };
};

const COLOR_HEX: Record<string, string> = {
  beige: "#d9c7a7",
  black: "#141414",
  blue: "#2b4c7e",
  bordeaux: "#5c1f2a",
  brown: "#6b4226",
  fuchsia: "#b54a7a",
  gold: "#9a7b45",
  green: "#4a5d3a",
  grey: "#8c8c8c",
  gray: "#8c8c8c",
  lilac: "#c8a2c8",
  "light blue": "#a8c6e5",
  navy: "#1c2a44",
  orange: "#c86a34",
  pink: "#d8a0ad",
  purple: "#6b3fa0",
  red: "#a82b2b",
  silver: "#b8b8b8",
  white: "#f2efe8",
  yellow: "#d9b74a",
};

const COUNTRIES: Record<string, string> = {
  BD: "Bangladesh",
  BG: "Bulgaria",
  CN: "China",
  DE: "Germany",
  EG: "Egypt",
  ID: "Indonesia",
  IN: "India",
  IT: "Italy",
  KH: "Cambodia",
  LA: "Laos",
  LK: "Sri Lanka",
  NL: "the Netherlands",
  PH: "Philippines",
  PK: "Pakistan",
  TH: "Thailand",
  TN: "Tunisia",
  TR: "Türkiye",
  VN: "Vietnam",
};

const SECTION_HEADINGS = ["PRODUCT DETAIL", "COMPOSITION AND MATERIAL"];

const DETAIL_FIELDS = [
  "Composition",
  "Material",
  "Lining",
  "Sleeves",
  "Collar",
  "Neckline",
  "Fastening",
  "Pockets",
  "Pattern",
  "Sole",
  "Details",
  "Size (cm)",
  "Washing",
  "Made in",
  "Season",
  "Article code",
];

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function parseDescription(html: string) {
  let text = html.replace(/<br\s*\/?>/gi, "\n");
  for (const heading of SECTION_HEADINGS) {
    text = text.split(heading).join(`\n${heading}\n`);
  }
  text = decodeEntities(text.replace(/<[^>]+>/g, ""));

  const fields = new Map<string, string>();
  for (const line of text.split("\n")) {
    const clean = line.replace(/\s+/g, " ").replace(/^[•\u2022-]\s*/, "").trim();
    const separator = clean.indexOf(":");
    if (separator <= 0) continue;
    const key = clean.slice(0, separator).trim();
    const value = clean.slice(separator + 1).trim();
    if (value && !fields.has(key)) fields.set(key, value);
  }
  return fields;
}

function formatFeedList(value: string) {
  return value
    .split(/(?:^|\s)-\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

const ALWAYS_PLURAL = new Set([
  "boots",
  "jeans",
  "sandals",
  "sneakers",
  "sunglasses",
]);

function singularize(subcategory: string) {
  const word = subcategory.toLowerCase();
  if (ALWAYS_PLURAL.has(word)) return word;
  if (word.endsWith("ves")) return `${word.slice(0, -3)}f`;
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function normalizeColorName(value: string) {
  const name = value
    .toLowerCase()
    .replace(/-\d+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return name === "liliac" ? "lilac" : name;
}

function toDisplayColor(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function tagValue(tags: string[], prefix: string) {
  const match = tags.find((tag) => tag.startsWith(`${prefix}_`));
  return match ? match.slice(prefix.length + 1) : undefined;
}

export function resolveGender(node: Pick<ShopifyNavNode, "tags" | "title">): Gender {
  const tag = tagValue(node.tags, "Gender")?.toLowerCase();
  if (tag === "women" || tag === "men") return tag;
  return /\bwomen\b/i.test(node.title) ? "women" : "men";
}

export function resolveDepartment(
  node: Pick<ShopifyNavNode, "tags" | "productType">,
): Department {
  const source = tagValue(node.tags, "Category") ?? node.productType;
  const value = source.toLowerCase();
  if (value.startsWith("accessories")) return "accessories";
  if (value.startsWith("shoes")) return "shoes";
  return "clothing";
}

export function resolveSubcategory(
  node: Pick<ShopifyNavNode, "tags" | "productType">,
) {
  const tag = tagValue(node.tags, "Subcategory");
  if (tag) return tag;
  const [, ...rest] = node.productType.split(" ");
  return rest.join(" ") || node.productType;
}

/** Titles arrive as "Blauer. Women Blazer" — the brand is shown separately. */
export function cleanName(title: string, vendor: string) {
  let name = title.replace(/\s+/g, " ").trim();
  if (name.toLowerCase().startsWith(vendor.toLowerCase())) {
    name = name.slice(vendor.length).trim();
  }
  name = name.replace(/^(women|men)\s+/i, "").trim();
  return name || title.replace(/\s+/g, " ").trim();
}

function buildDetails(fields: Map<string, string>) {
  const details: string[] = [];
  for (const key of DETAIL_FIELDS) {
    const raw = fields.get(key);
    if (!raw) continue;
    if (key === "Made in") {
      details.push(`Made in ${COUNTRIES[raw.toUpperCase()] ?? raw}`);
      continue;
    }
    details.push(`${key}: ${formatFeedList(raw)}`);
  }
  return details;
}

function buildDescription(
  gender: Gender,
  subcategory: string,
  fields: Map<string, string>,
) {
  const composition = fields.get("Composition");
  const madeIn = fields.get("Made in");
  const season = fields.get("Season");
  const material = composition ? ` in ${formatFeedList(composition)}` : "";
  const sentences = [
    `${gender === "women" ? "Women's" : "Men's"} ${singularize(subcategory)}${material}.`,
  ];
  if (season) sentences.push(`${season} season.`);
  if (madeIn) {
    sentences.push(`Made in ${COUNTRIES[madeIn.toUpperCase()] ?? madeIn}.`);
  }
  return sentences.join(" ");
}

export function mapShopifyProduct(node: ShopifyProductNode): Product {
  const fields = parseDescription(node.descriptionHtml);
  const gender = resolveGender(node);
  const department = resolveDepartment(node);
  const subcategory = resolveSubcategory(node);

  const variants: ProductVariant[] = node.variants.nodes.map((variant) => {
    const options = new Map(
      variant.selectedOptions.map((option) => [option.name, option.value]),
    );
    const price = Number(variant.price.amount);
    const compareAtPrice = variant.compareAtPrice
      ? Number(variant.compareAtPrice.amount)
      : undefined;

    return {
      id: variant.id,
      color: toDisplayColor(normalizeColorName(options.get("Color") ?? "")),
      size: options.get("Size") ?? "One Size",
      price,
      compareAtPrice:
        compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
      quantity:
        variant.quantityAvailable == null
          ? undefined
          : variant.quantityAvailable,
      available: variant.availableForSale,
    };
  });

  const cheapest = variants.reduce<ProductVariant | undefined>(
    (lowest, variant) =>
      !lowest || variant.price < lowest.price ? variant : lowest,
    undefined,
  );
  const price = cheapest?.price ?? 0;
  const compareAtPrice = cheapest?.compareAtPrice;

  const colors: ProductColor[] = [];
  for (const variant of variants) {
    if (!variant.color) continue;
    if (colors.some((color) => color.name === variant.color)) continue;
    colors.push({
      name: variant.color,
      hex: COLOR_HEX[variant.color.toLowerCase()] ?? "#c9c4bb",
    });
  }

  const sizes: string[] = [];
  for (const variant of variants) {
    if (!sizes.includes(variant.size)) sizes.push(variant.size);
  }

  const tags: ProductTag[] = [];
  if (compareAtPrice) tags.push("sale");

  return {
    id: node.id,
    slug: node.handle,
    name: cleanName(node.title, node.vendor),
    brand: node.vendor.trim(),
    price,
    compareAtPrice,
    gender,
    department,
    subcategory,
    season: fields.get("Season"),
    tags,
    colors,
    sizes,
    images: [...new Set(node.images.nodes.map((image) => image.url))],
    variants,
    description: buildDescription(gender, subcategory, fields),
    details: buildDetails(fields),
    available: variants.some((variant) => variant.available),
  };
}
