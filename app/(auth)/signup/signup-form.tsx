"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { IconAlertCircle, IconCheckCircle } from "@/components/icons";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    requiresConfirmation: boolean;
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
          },
          emailRedirectTo: `${origin}/auth/callback?next=/marketplace`,
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("unique constraint") ||
          error.status === 422
        ) {
          setErrorMessage(
            "An account with this email address already exists. Try signing in instead."
          );
        } else if (error.message.toLowerCase().includes("rate limit")) {
          setErrorMessage(
            "Too many registration requests. Please wait a few minutes before trying again."
          );
        } else {
          setErrorMessage(error.message);
        }
        setPending(false);
        return;
      }

      // Check if user session was immediately created (e.g., auto-confirm enabled)
      if (data.session) {
        router.replace("/marketplace");
        router.refresh();
        return;
      }

      // If no session, email confirmation was sent
      setSuccessInfo({
        email: trimmedEmail,
        requiresConfirmation: true,
      });
      setPending(false);
    } catch {
      setErrorMessage("An unexpected registration error occurred. Please try again.");
      setPending(false);
    }
  }

  if (successInfo) {
    return (
      <div className="space-y-5 text-center py-4">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--eco-leaf-50)] text-[var(--color-primary)]">
          <IconCheckCircle size={28} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-[var(--color-foreground)] tracking-tight">
            Check your email
          </h3>
          <p className="text-xs sm:text-sm text-[var(--eco-ink-700)] mt-2 leading-relaxed">
            We sent a verification link to{" "}
            <strong className="text-[var(--color-foreground)]">{successInfo.email}</strong>.
            Click the link in your email to activate your EcoEats account.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--color-border)] flex flex-col gap-2">
          <Link
            href="/login"
            className="eco-button eco-button-primary w-full text-xs font-bold"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="name"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          className="eco-field text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Email address
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
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="password"
            className="block text-xs font-bold text-[var(--eco-ink-700)]"
          >
            Password (min 8 characters)
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="eco-field text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
          className="eco-field text-sm"
        />
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
        {pending ? "Creating Account…" : "Create EcoEats Account"}
      </button>

      <div className="text-center text-xs text-[var(--eco-ink-500)] pt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}

