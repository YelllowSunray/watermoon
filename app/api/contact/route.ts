import { NextResponse } from "next/server";
import { parseContactPayload, sendContactEmail } from "@/lib/contact";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const trap = (payload ?? {}) as { company?: unknown };
  if (typeof trap.company === "string" && trap.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseContactPayload(payload);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact failed", error);
    return NextResponse.json(
      { error: "Could not send. Write us by email instead." },
      { status: 502 },
    );
  }
}
