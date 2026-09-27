"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        orderNumber: data.get("orderNumber"),
        message: data.get("message"),
        company: data.get("company"),
      }),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus("error");
      setMessage(json.error || "Could not send.");
      return;
    }
    setStatus("ok");
    setMessage("Sent.");
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-6">
      <label className="block">
        <span className="eyebrow">Name</span>
        <input
          name="name"
          required
          className="mt-2 w-full border-b border-current bg-transparent py-2 outline-none"
        />
      </label>
      <label className="block">
        <span className="eyebrow">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full border-b border-current bg-transparent py-2 outline-none"
        />
      </label>
      <label className="block">
        <span className="eyebrow">Order</span>
        <input
          name="orderNumber"
          className="mt-2 w-full border-b border-current bg-transparent py-2 outline-none"
        />
      </label>
      <label className="block">
        <span className="eyebrow">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          className="mt-2 w-full border-b border-current bg-transparent py-2 outline-none"
        />
      </label>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="cta">
        Send
      </button>
      {status !== "idle" ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
