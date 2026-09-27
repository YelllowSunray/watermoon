import { GenderWorld } from "@/components/GenderWorld";
import { getGenderNavigation, getScopedShop } from "@/lib/catalog";
import { getLookWithImage, looksForGender } from "@/lib/looks";
import { getStoryPreviews, storiesOnlyForGender } from "@/lib/stories";

export const revalidate = 300;

export const metadata = {
  title: "Women",
  description: "Looks, cloth, leather. Then the doors.",
  alternates: { canonical: "/women" },
};

export default async function WomenPage() {
  const defs = looksForGender("women");
  const [nav, clothing, kits, stories] = await Promise.all([
    getGenderNavigation(),
    getScopedShop({ gender: "women", department: "clothing" }),
    Promise.all(defs.map((look) => getLookWithImage(look))),
    getStoryPreviews(storiesOnlyForGender("women").map((story) => story.slug)),
  ]);
  const women = nav.find((item) => item.gender === "women");

  return (
    <GenderWorld
      gender="women"
      headline="Cloth first. Then the rest of the day."
      departments={women?.departments ?? []}
      kits={kits.filter((item) => item.products.length >= 2)}
      stories={stories}
      products={clothing.slice(0, 8)}
    />
  );
}
