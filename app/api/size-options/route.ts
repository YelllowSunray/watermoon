import { NextResponse } from "next/server";
import { getSizeOptions } from "@/lib/catalog";

export const revalidate = 900;

export async function GET() {
  const options = await getSizeOptions();
  return NextResponse.json({ options });
}
