"use client";

import { useState, type FormEvent } from "react";
import { CONTACT, NEWSLETTER_FORM_ACTION } from "@/lib/env";

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterSignup() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const value = new FormData(form).get("email");
    if (typeof value !== "string" || !value.trim()) return;

    const email = value.trim();

    if (!NEWSLETTER_FORM_ACTION) {
      const subject = encodeURIComponent("Newsletter signup");
      const body = encodeURIComponent(
        `Please add ${email} to the Golden Bay Holiday Homes newsletter.`,
      );
      window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const body = new FormData();
      body.set("email", email);
      body.set("_subject", "Golden Bay Holiday Homes newsletter signup");

      const response = await fetch(NEWSLETTER_FORM_ACTION, {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Signup failed (${response.status})`);
      }

      form.reset();
      setStatus("success");
      setMessage("Thanks — you are on the list for local stay tips.");
    } catch {
      setStatus("error");
      setMessage(
        `Something went wrong. Email ${CONTACT.email} and we will add you.`,
      );
    }
  }

  const configured = Boolean(NEWSLETTER_FORM_ACTION);

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-y border-drift bg-sand py-14 md:py-16"
    >
      <div className="mx-auto grid max-w-6xl items-end gap-8 px-4 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-sea">
            From Golden Bay
          </p>
          <h2
            id="newsletter-heading"
            className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-sea-deep md:text-4xl"
          >
            Local tips for your next stay
          </h2>
          <p id="newsletter-description" className="mt-3 text-ink/80">
            Get occasional local stay ideas, new holiday homes and direct
            booking news from our Golden Bay team.
          </p>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="font-medium text-sea-deep">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={status === "submitting"}
              aria-describedby="newsletter-description newsletter-note"
              placeholder="you@example.com"
              className="min-h-11 min-w-0 flex-1 rounded-sm border border-drift bg-white px-3 py-2 text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="min-h-11 rounded-sm bg-sea px-5 py-2.5 font-semibold text-white transition hover:bg-sea-deep disabled:opacity-60"
            >
              {status === "submitting" ? "Signing up…" : "Sign up"}
            </button>
          </div>
          <p id="newsletter-note" className="text-xs text-muted">
            {configured
              ? "We only use your email for occasional Golden Bay stay tips. Unsubscribe any time."
              : `Signing up opens your email app so you can send the request to ${CONTACT.email}.`}
          </p>
          {message ? (
            <p
              role="status"
              className={`text-sm ${
                status === "error" ? "text-red-700" : "text-sea-deep"
              }`}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
