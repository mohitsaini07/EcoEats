"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { IconAlertCircle, IconCheckCircle } from "@/components/icons";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        setPending(false);
        return;
      }

      setSuccess(true);
      setPending(false);
    } catch {
      setErrorMessage("An unexpected error occurred while requesting password reset.");
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--eco-leaf-50)] text-[var(--color-primary)]">
          <IconCheckCircle size={28} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-[var(--color-foreground)] tracking-tight">
            Reset link dispatched
          </h3>
          <p className="text-xs sm:text-sm text-[var(--eco-ink-700)] mt-2 leading-relaxed">
            If an account exists for <strong className="text-[var(--color-foreground)]">{email}</strong>,
            you will receive an email shortly with instructions to reset your password.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <Link
            href="/login"
            className="eco-button eco-button-primary w-full text-xs font-bold"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Registered Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="eco-field text-sm"
        />
        <p className="text-[11px] text-[var(--eco-ink-500)] mt-1">
          We&apos;ll send a secure one-time link to create a new password.
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="eco-status-note text-xs">
          <IconAlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="eco-button eco-button-primary w-full text-sm font-bold cursor-pointer"
      >
        {pending ? "Sending link…" : "Send Reset Instructions"}
      </button>

      <div className="text-center text-xs text-[var(--eco-ink-500)] pt-2 border-t border-[var(--color-border)]">
        Remembered your password?{" "}
        <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
