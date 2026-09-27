import Image from "next/image";
import Link from "next/link";

export function LinedShot({
  href,
  image,
  alt,
  kicker,
  title,
  meta,
  priority,
  sizes = "(min-width: 768px) 25vw, 50vw",
}: {
  href: string;
  image?: string;
  alt: string;
  kicker: string;
  title: string;
  meta?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="packshot">
        {image ? (
          <Image
            src={image}
            alt={alt}
            fill
            priority={priority}
            className="object-contain transition-opacity duration-200 ease-out group-hover:opacity-80"
            sizes={sizes}
          />
        ) : null}
      </div>
      <div className="px-3 py-3 md:px-4">
        <p className="eyebrow">{kicker}</p>
        <p className="mt-1 text-[15px] leading-snug">{title}</p>
        {meta ? <p className="mt-1 text-[13px]">{meta}</p> : null}
      </div>
    </Link>
  );
}
