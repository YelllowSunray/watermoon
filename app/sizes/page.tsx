import { HelpMast, HelpStreet } from "@/components/HelpStreet";
import { SizePrefs } from "@/components/SizePrefs";

export const metadata = {
  title: "Sizes",
  description: "Keep your cloth, trouser, and shoe sizes on this browser.",
  alternates: { canonical: "/sizes" },
};

export default function SizesPage() {
  return (
    <div>
      <HelpMast
        eyebrow="Sizes"
        title="Yours. Then the shop is faster."
        line="Cloth, trousers, shoes. The chips are sizes this shop actually has. They stay on this browser."
        splash="ink"
      />
      <SizePrefs />
      <HelpStreet current="/sizes" />
    </div>
  );
}
