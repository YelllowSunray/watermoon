import { WishlistView } from "@/components/WishlistView";

export const metadata = {
  title: "Wishlist",
  alternates: { canonical: "/wishlist" },
};

export default function WishlistPage() {
  return (
    <div>
      <section className="field-chartreuse px-5 py-12 md:px-10 md:py-16">
        <p className="eyebrow">Wishlist</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">Kept.</h1>
      </section>
      <WishlistView />
    </div>
  );
}
