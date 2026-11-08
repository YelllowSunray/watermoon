import type { LookSplash } from "@/lib/looks-data";

export type StoryGender = "women" | "men" | "both";

export type StoryDefinition = {
  slug: string;
  title: string;
  line: string;
  heroHandle: string;
  splash: LookSplash;
  gender: StoryGender;
  home?: boolean;
  query?: string;
  handles?: string[];
};

function tag(value: string) {
  return `tag:'${value.replace(/'/g, "\\'")}'`;
}

function genderClause(gender: "women" | "men") {
  const label = gender === "women" ? "Women" : "Men";
  return `(${tag(`Gender_${gender}`)} OR ${tag(`Gender_${label}`)} OR ${tag(label)})`;
}

function vendor(name: string) {
  return `vendor:'${name.replace(/'/g, "\\'")}'`;
}

/**
 * Eight rooms from the live syi12w-cq catalog.
 * Each query was counted in-stock before shipping. Mixed dumps deleted.
 */
export const STORIES: StoryDefinition[] = [
  {
    slug: "city-tailoring",
    title: "City tailoring",
    line: "A jacket first. Then the rest of the day.",
    heroHandle: "2477820-blauer-women-blazer",
    splash: "cobalt",
    gender: "women",
    query: `${genderClause("women")} AND ${tag("Subcategory_Blazer")}`,
  },
  {
    slug: "italian-leather",
    title: "Italian leather",
    line: "A bag from a house that still stamps Italy.",
    heroHandle: "2476011-love-moschino-women-bag",
    splash: "vermillion",
    gender: "women",
    query: `${genderClause("women")} AND ${tag("Subcategory_Bags")} AND (${vendor("Pinko")} OR ${vendor("Liu Jo")} OR ${vendor("Love Moschino")} OR ${vendor("Alviero Martini Prima Classe")})`,
  },
  {
    slug: "after-midnight",
    title: "After midnight",
    line: "A black dress. Then the walk home.",
    heroHandle: "486977-diesel-women-dress",
    splash: "violet",
    gender: "women",
    query: `${genderClause("women")} AND ${tag("Subcategory_Dresses")} AND black`,
  },
  {
    slug: "white-shirt",
    title: "White shirt",
    line: "The piece that outlasts the rest of the bag.",
    heroHandle: "489452-twinset-women-shirt",
    splash: "ink",
    gender: "both",
    query: `${tag("Subcategory_Shirts")} AND white`,
  },
  {
    slug: "blue-jeans",
    title: "Blue jeans",
    line: "The pair you already know how to wear.",
    heroHandle: "2477503-g-star-women-jeans",
    splash: "orange",
    gender: "women",
    query: `${genderClause("women")} AND ${tag("Subcategory_Jeans")}`,
  },
  {
    slug: "rains",
    title: "Rains",
    line: "Cloth that keeps going when the street does not.",
    heroHandle: "2477771-rains-women-blazer",
    splash: "chartreuse",
    gender: "both",
    query: vendor("Rains"),
  },
  {
    slug: "timberlands",
    title: "Timberlands",
    line: "The boot that does the walking.",
    heroHandle: "475668-timberland-women-boots",
    splash: "orange",
    gender: "both",
    query: `${vendor("Timberland")} AND ${tag("Subcategory_Boots")}`,
  },
  {
    slug: "dark-glasses",
    title: "Dark glasses",
    line: "The last thing you put on.",
    heroHandle: "2476023-versace-men-sunglasses",
    splash: "violet",
    gender: "both",
    query: `${tag("Subcategory_Sunglasses")}`,
  },
  {
    slug: "pinko",
    title: "Pinko",
    line: "The Milan house, in cloth.",
    heroHandle: "486981-pinko-women-dress",
    splash: "chartreuse",
    gender: "women",
    home: true,
    query: `${vendor("Pinko")} AND ${genderClause("women")} AND ${tag("Category_Clothing")}`,
  },
  {
    slug: "replay-denim",
    title: "Levi's denim",
    line: "The jean that already knows you.",
    heroHandle: "2476131-levi-s-men-jeans",
    splash: "ink",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Jeans")}`,
  },
  {
    slug: "city-jacket",
    title: "City jacket",
    line: "A jacket first. Then the rest of the day.",
    heroHandle: "2476181-kway-men-blazer",
    splash: "cobalt",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Blazer")}`,
  },
  {
    slug: "white-trainer",
    title: "The trainer",
    line: "The pair that does the rest of the outfit.",
    heroHandle: "475794-new-balance-men-sneakers",
    splash: "vermillion",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Sneakers")}`,
  },
  {
    slug: "open-shirt",
    title: "Open shirt",
    line: "The piece that outlasts the rest of the bag.",
    heroHandle: "2477730-timberland-men-shirt",
    splash: "chartreuse",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Shirts")}`,
  },
  {
    slug: "field-jacket",
    title: "Field jacket",
    line: "The jacket that does the weather.",
    heroHandle: "2476351-barbour-men-jacket",
    splash: "orange",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Jackets")}`,
  },
  {
    slug: "his-boots",
    title: "His boots",
    line: "The boot that does the walking.",
    heroHandle: "475661-timberland-men-boots",
    splash: "violet",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Boots")}`,
  },
  {
    slug: "the-carry",
    title: "The carry",
    line: "The bag. Then the walk.",
    heroHandle: "2476078-boss-men-bag",
    splash: "ink",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Bags")}`,
  },
  {
    slug: "napa-house",
    title: "Napapijri",
    line: "The mountain house, in cloth.",
    heroHandle: "2477924-napapijri-men-sweatshirts",
    splash: "chartreuse",
    gender: "men",
    query: `${vendor("Napapijri")} AND ${genderClause("men")}`,
  },
  {
    slug: "the-belt",
    title: "The belt",
    line: "The last thing you put on.",
    heroHandle: "489737-boss-men-belt",
    splash: "orange",
    gender: "men",
    query: `${genderClause("men")} AND ${tag("Subcategory_Belts")}`,
  },
  {
    slug: "guess-sneakers",
    title: "The white pair",
    line: "A sneaker that does the rest of the outfit.",
    heroHandle: "2476156-voile-blanche-women-sneakers",
    splash: "ink",
    gender: "women",
    home: true,
    query: `${genderClause("women")} AND ${tag("Subcategory_Sneakers")}`,
  },
  {
    slug: "north-face",
    title: "North Face",
    line: "The house that does the mountain and the platform.",
    heroHandle: "2476108-the-north-face-men-bag",
    splash: "orange",
    gender: "both",
    home: true,
    query: vendor("The North Face"),
  },
];

export function getStoryDefinition(slug: string) {
  return STORIES.find((story) => story.slug === slug);
}

export function storiesForGender(gender: "women" | "men") {
  return STORIES.filter((story) => story.gender === gender || story.gender === "both");
}

export function storiesOnlyForGender(gender: "women" | "men") {
  return STORIES.filter((story) => story.gender === gender);
}

export function hoverStories(need = 4) {
  const hers = STORIES.filter((story) => story.gender === "women");
  const his = STORIES.filter((story) => story.gender === "men");
  const both = STORIES.filter((story) => story.gender === "both");
  const womenStreet = [...hers];
  const menStreet = [...his];
  for (const story of both) {
    if (menStreet.length < need) menStreet.push(story);
    else if (womenStreet.length < need) womenStreet.push(story);
  }
  return {
    hers: womenStreet.slice(0, need),
    his: menStreet.slice(0, need),
  };
}

const HOME_STORY_SLUGS = ["north-face", "guess-sneakers", "timberlands", "pinko"] as const;

export function homeStoryDefinitions() {
  return HOME_STORY_SLUGS.map((slug) => STORIES.find((story) => story.slug === slug)).filter(
    (story): story is StoryDefinition => Boolean(story),
  );
}

export type StoryPreview = {
  slug: string;
  title: string;
  line: string;
  splash: LookSplash;
  gender: StoryGender;
  image?: string;
  count: number;
};
