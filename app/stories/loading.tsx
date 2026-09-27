export default function Loading() {
  return (
    <div className="px-5 py-14 md:px-10">
      <div className="mb-4 h-3 w-24 shimmer" />
      <div className="mb-12 h-16 w-80 shimmer" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-h-[86vh] shimmer md:col-span-2" />
        <div className="min-h-[72vh] shimmer" />
        <div className="min-h-[64vh] shimmer" />
        <div className="min-h-[70vh] shimmer md:col-span-2" />
      </div>
    </div>
  );
}
