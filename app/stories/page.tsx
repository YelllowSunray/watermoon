import Image from "next/image";
import Link from "next/link";
import { getStoryPreviews } from "@/lib/stories";
import { SPLASH_FIELD } from "@/lib/looks-data";
import type { StoryPreview } from "@/lib/stories-data";

export const revalidate = 300;

export const metadata = {
  title: "The edit",
  description: "Rooms from this shop.",
  alternates: { canonical: "/stories" },
};

export default async function StoriesPage() {
  const stories = await getStoryPreviews();
  const hers = stories.filter((story) => story.gender === "women");
  const his = stories.filter((story) => story.gender === "men");
  const both = stories.filter((story) => story.gender === "both");

  return (
    <div>
      <section className="field-violet flex items-end justify-between gap-6 px-5 py-8 md:px-10 md:py-10">
        <div>
          <p className="eyebrow">The edit</p>
          <h1 className="display mt-3 max-w-3xl text-4xl md:text-6xl">Rooms. Not a feed.</h1>
        </div>
      </section>

      <WorldStreet label="Women" splash="field-vermillion" stories={hers} />
      <WorldStreet label="Men" splash="field-ink" stories={his} />
      {both.length > 0 ? (
        <section className="field-ink px-5 py-8 md:px-10">
          <p className="eyebrow mb-4">Women · Men</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {both.map((story) => (
              <li key={story.slug}>
                <Link href={`/stories/${story.slug}`} className="display text-3xl md:text-4xl">
                  {story.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function WorldStreet({
  label,
  splash,
  stories,
}: {
  label: string;
  splash: string;
  stories: StoryPreview[];
}) {
  if (stories.length === 0) return null;

  return (
    <section>
      <div className={`${splash} px-5 py-4 md:px-10`}>
        <p className="display text-2xl">{label}</p>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3">
        {stories.map((story, index) => (
          <li key={story.slug}>
            <Link href={`/stories/${story.slug}`} className={`${SPLASH_FIELD[story.splash]} flex h-full flex-col`}>
              <div className="p-4">
                <div className="still">
                  {story.image ? (
                    <Image
                      src={story.image}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="33vw"
                      priority={index < 2}
                    />
                  ) : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-end px-4 pb-5">
                <p className="display text-2xl md:text-3xl">{story.title}</p>
                <p className="mt-1 line-clamp-2 max-w-xs text-sm">{story.line}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
