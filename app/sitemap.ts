import type { MetadataRoute } from "next";
import { getAllBrands, getProductHandles } from "@/lib/catalog";
import { LOOKS } from "@/lib/looks-data";
import { SITE_URL } from "@/lib/site";
import { STORIES } from "@/lib/stories-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/women",
    "/men",
    "/stories",
    "/looks",
    "/sale",
    "/brands",
    "/search",
    "/wishlist",
    "/sizes",
    "/cart",
    "/contact",
    "/about",
    "/faq",
    "/account",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    changeFrequency: "weekly" as const,
  }));

  let handles: string[] = [];
  let brands: Array<{ slug: string }> = [];
  try {
    handles = await getProductHandles();
  } catch {
    handles = [];
  }
  try {
    brands = await getAllBrands();
  } catch {
    brands = [];
  }

  try {
    return [
      ...staticRoutes,
      ...STORIES.map((story) => ({
        url: `${SITE_URL}/stories/${story.slug}`,
        changeFrequency: "weekly" as const,
      })),
      ...LOOKS.map((look) => ({
        url: `${SITE_URL}/looks/${look.slug}`,
        changeFrequency: "weekly" as const,
      })),
      ...brands.map((brand) => ({
        url: `${SITE_URL}/brands/${brand.slug}`,
        changeFrequency: "weekly" as const,
      })),
      ...handles.map((handle) => ({
        url: `${SITE_URL}/product/${handle}`,
        changeFrequency: "weekly" as const,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
