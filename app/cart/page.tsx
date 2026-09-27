import { CartView } from "@/components/CartView";

export const metadata = {
  title: "Bag",
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return (
    <div>
      <section className="field-cobalt px-5 py-12 md:px-10 md:py-16">
        <p className="eyebrow">Bag</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">Take it with you.</h1>
      </section>
      <div className="px-5 py-14 md:px-10">
        <CartView />
      </div>
    </div>
  );
}
