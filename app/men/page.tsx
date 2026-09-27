import { GenderWorld } from "@/components/GenderWorld";
import { getGenderNavigation, getScopedShop } from "@/lib/catalog";
import { getLookWithImage, looksForGender } from "@/lib/looks";
import { getStoryPreviews, storiesOnlyForGender } from "@/lib/stories";

export const revalidate = 300;

export const metadata = {
  title: "Men",
  description: "Looks, shirts, jackets. Then the doors.",
  alternates: { canonical: "/men" },
};

export default async function MenPage() {
  const defs = looksForGender("men");
  const [nav, clothing, kits, stories] = await Promise.all([
    getGenderNavigation(),
    getScopedShop({ gender: "men", department: "clothing" }),
    Promise.all(defs.map((look) => getLookWithImage(look))),
    getStoryPreviews(storiesOnlyForGender("men").map((story) => story.slug)),
  ]);
  const men = nav.find((item) => item.gender === "men");

  return (
    <GenderWorld
      gender="men"
      headline="Shirts, jackets, the walk between them."
      departments={men?.departments ?? []}
      kits={kits.filter((item) => item.products.length >= 2)}
      stories={stories}
      products={clothing.slice(0, 8)}
    />
  );
}
