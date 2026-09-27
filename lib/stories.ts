import "server-only";

import { getProduct, getProductsByHandles, queryProducts } from "@/lib/catalog";
import {
  STORIES,
  getStoryDefinition,
  homeStoryDefinitions,
  storiesForGender,
  storiesOnlyForGender,
  type StoryDefinition,
  type StoryPreview,
} from "@/lib/stories-data";

export type Story = StoryDefinition;
export { STORIES, getStoryDefinition as getStory, homeStoryDefinitions as homeStories, storiesForGender, storiesOnlyForGender };

export async function getStoryProducts(story: Story, limit = 24) {
  if (story.handles?.length) {
    const products = await getProductsByHandles(story.handles.slice(0, 24));
    return products.slice(0, limit);
  }
  if (!story.query) return [];
  const products = await queryProducts(story.query, { maxPages: 1, first: 50 });
  return products.slice(0, limit);
}

export async function getStoryWithImage(story: Story) {
  const [products, named] = await Promise.all([
    getStoryProducts(story, 24),
    getProduct(story.heroHandle),
  ]);
  const hero =
    (named?.available ? named : undefined) ??
    products.find((product) => product.slug === story.heroHandle) ??
    products[0];
  return {
    story,
    products,
    image: hero?.images[0],
    hero,
  };
}

export type { StoryPreview } from "@/lib/stories-data";

export async function getStoryPreviews(slugs?: string[]): Promise<StoryPreview[]> {
  const selected = slugs
    ? STORIES.filter((story) => slugs.includes(story.slug))
    : STORIES;

  return Promise.all(
    selected.map(async (story) => {
      const { products, image } = await getStoryWithImage(story);
      return {
        slug: story.slug,
        title: story.title,
        line: story.line,
        splash: story.splash,
        gender: story.gender,
        image,
        count: products.length,
      };
    }),
  );
}

export function storyHref(slug: string) {
  return `/stories/${slug}`;
}
