export function CardSkeleton() {
  return (
    <div>
      <div className="packshot shimmer" />
      <div className="px-3 py-3 md:px-4">
        <div className="h-2 w-16 shimmer" />
        <div className="mt-2 h-3 w-28 shimmer" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="card-grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div>
      <div className="h-40 bg-ink md:h-52" />
      <div className="px-5 py-14 md:px-10">
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 w-24 shimmer" />
          ))}
        </div>
        <GridSkeleton />
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div>
      <div className="h-1.5 bg-ink" />
      <div className="px-5 py-8 md:px-10 md:py-10">
        <div className="h-3 w-24 shimmer" />
        <div className="mt-4 h-12 w-64 shimmer" />
      </div>
      <div className="bg-ivory px-5 py-6 md:px-10">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-14 w-28 shimmer" />
          ))}
        </div>
      </div>
      <div className="card-grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div>
      <div className="h-10 bg-ink" />
      <div className="grid md:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="still shimmer" />
        <div className="px-5 py-12 md:px-10">
          <div className="h-3 w-24 shimmer" />
          <div className="mt-6 h-14 w-4/5 shimmer" />
          <div className="mt-6 h-6 w-20 shimmer" />
          <div className="mt-10 flex gap-2">
            <div className="h-12 w-14 shimmer" />
            <div className="h-12 w-14 shimmer" />
            <div className="h-12 w-14 shimmer" />
          </div>
          <div className="mt-12 h-14 w-full shimmer" />
        </div>
      </div>
    </div>
  );
}

export function LookSkeleton() {
  return (
    <div className="grid md:grid-cols-2">
      <div className="still shimmer" />
      <div className="field-ink min-h-[48vh] px-5 py-12 md:px-10">
        <div className="h-3 w-24 bg-white/20" />
        <div className="mt-6 h-16 w-3/4 bg-white/20" />
      </div>
    </div>
  );
}
