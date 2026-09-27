import Image from "next/image";
import Link from "next/link";
import { SPLASH_FIELD } from "@/lib/looks-data";
import type { StoryPreview } from "@/lib/stories-data";

export function StoryTiles({
  stories,
  large = false,
}: {
  stories: StoryPreview[];
  large?: boolean;
}) {
  const shown = large ? stories.slice(0, 2) : stories.slice(0, 8);

  if (large) {
    return (
      <div className="grid">
        {shown.map((story, index) => (
          <Tile key={story.slug} story={story} priority={index === 0} huge />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2">
      {shown.map((story, index) => (
        <div key={story.slug} className={index === 0 ? "md:col-span-2" : undefined}>
          <Tile story={story} priority={index === 0} huge={index === 0} />
        </div>
      ))}
    </div>
  );
}

function Tile({
  story,
  priority,
  huge,
}: {
  story: StoryPreview;
  priority?: boolean;
  huge?: boolean;
}) {
  return (
    <Link href={`/stories/${story.slug}`} className={`group grid ${huge ? "md:grid-cols-2" : ""}`}>
      <div className={`${SPLASH_FIELD[story.splash]} ${huge ? "p-8 md:p-12" : "p-5"}`}>
        <div className="still">
          {story.image ? (
            <Image
              src={story.image}
              alt=""
              fill
              className="object-contain"
              sizes={huge ? "50vw" : "50vw"}
              priority={priority}
            />
          ) : null}
        </div>
      </div>
      <div className={`${SPLASH_FIELD[story.splash]} flex flex-col justify-end px-5 py-8 md:px-10 ${huge ? "md:min-h-[48vh] md:justify-center" : ""}`}>
        <p className="eyebrow">{story.title}</p>
        <p className={`display mt-3 max-w-xl ${huge ? "text-4xl md:text-6xl" : "text-3xl"}`}>
          {story.line}
        </p>
      </div>
    </Link>
  );
}
