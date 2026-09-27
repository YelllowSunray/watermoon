import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 py-24 md:px-10">
      <p className="eyebrow">404</p>
      <h1 className="display mt-3 mb-8 text-5xl">This room is empty.</h1>
      <Link href="/" className="cta">
        Home
      </Link>
    </div>
  );
}
