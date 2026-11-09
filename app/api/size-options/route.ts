import { NextResponse } from "next/server";
import { getSizeOptions } from "@/lib/catalog";

export const revalidate = 300;

export async function GET() {
  const options = await getSizeOptions();
  return NextResponse.json({ options });
}
