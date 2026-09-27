import { NextResponse } from "next/server";
import {
  isNewsletterEmail,
  normalizeNewsletterEmail,
  subscribeToShopifyMarketing,
} from "@/lib/shopify/newsletter";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = (payload ?? {}) as { email?: unknown; company?: unknown };
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeNewsletterEmail(String(body.email ?? ""));
  if (!isNewsletterEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    await subscribeToShopifyMarketing(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter failed", error);
    return NextResponse.json(
      { error: "Could not subscribe. Try again." },
      { status: 502 },
    );
  }
}
