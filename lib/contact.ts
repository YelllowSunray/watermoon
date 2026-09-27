import "server-only";

import { Resend } from "resend";
import { CONTACT_TO, RESEND_FROM, SITE_NAME } from "@/lib/site";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactMessage = {
  name: string;
  email: string;
  orderNumber?: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function parseContactPayload(payload: unknown): ContactMessage | string {
  const body = (payload ?? {}) as Record<string, unknown>;
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const orderNumber = clean(body.orderNumber, 80);
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

  if (!name) return "Enter your name.";
  if (!EMAIL.test(email)) return "Enter a valid email address.";
  if (!message) return "Enter a message.";

  return {
    name,
    email,
    ...(orderNumber ? { orderNumber } : {}),
    message,
  };
}

export async function sendContactEmail(input: ContactMessage) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  const from = RESEND_FROM;
  const to = CONTACT_TO;
  const resend = new Resend(apiKey);
  const order = input.orderNumber ? ` · order ${input.orderNumber}` : "";

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: input.email,
    subject: `${SITE_NAME} contact${order} — ${input.name}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      input.orderNumber ? `Order: ${input.orderNumber}` : null,
      "",
      input.message,
    ]
      .filter(Boolean)
      .join("\n"),
    html: `<p><strong>Name</strong> ${escapeHtml(input.name)}</p>
<p><strong>Email</strong> ${escapeHtml(input.email)}</p>
${input.orderNumber ? `<p><strong>Order</strong> ${escapeHtml(input.orderNumber)}</p>` : ""}
<p>${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>`,
  });

  if (error || !data?.id) {
    throw new Error(error?.message || "Resend did not send.");
  }
}
