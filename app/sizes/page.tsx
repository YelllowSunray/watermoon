import { HelpMast, HelpStreet } from "@/components/HelpStreet";
import { SizePrefs } from "@/components/SizePrefs";
import { getSizeOptions } from "@/lib/catalog";

export const revalidate = 300;

export const metadata = {
  title: "Sizes",
  description: "Keep your cloth, trouser, and shoe sizes on this browser.",
  alternates: { canonical: "/sizes" },
};

export default async function SizesPage() {
  const options = await getSizeOptions();
  return (
    <div>
      <HelpMast
        eyebrow="Sizes"
        title="Yours. Then the shop is faster."
        line="Cloth, trousers, shoes. The chips are sizes this shop actually has. They stay on this browser."
        splash="ink"
      />
      <SizePrefs options={options} />
      <HelpStreet current="/sizes" />
    </div>
  );
}
