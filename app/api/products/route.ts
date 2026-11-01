import { NextResponse } from "next/server";
import { getProductsByHandles } from "@/lib/catalog";
import { toCard } from "@/lib/products";

export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const handles = url.searchParams.get("handles")?.split(",").filter(Boolean) ?? [];
  const products = await getProductsByHandles(handles);
  return NextResponse.json(
    { products: products.map(toCard) },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
