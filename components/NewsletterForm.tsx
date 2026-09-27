"use client";

import { useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        company: data.get("company"),
      }),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus("error");
      setMessage(json.error || "Could not subscribe.");
      return;
    }
    setStatus("ok");
    setMessage("You are on the list.");
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className={`relative ${compact ? "" : "max-w-md"}`}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email
      </label>
      <div className="flex border-b border-current">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full bg-transparent py-2 text-sm outline-none placeholder:opacity-55"
        />
        <button type="submit" className="eyebrow px-2" style={{ color: "inherit" }}>
          Join
        </button>
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="company" tabIndex={-1} autoComplete="off" />
      </div>
      {status !== "idle" ? (
        <p className="mt-2 text-xs opacity-70">{message}</p>
      ) : null}
    </form>
  );
}
