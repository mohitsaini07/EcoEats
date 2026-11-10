"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  IconAlertCircle,
  IconChefHat,
  IconShoppingBag,
  IconSparkles,
  IconArrowRight,
} from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError ? decodeURIComponent(urlError) : null
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setPending(true);

    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please verify your credentials.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage("Please confirm your email address before signing in. Check your inbox.");
        } else {
          setErrorMessage(error.message);
        }
        setPending(false);
        return;
      }

      // Safe redirection: only allow relative paths to prevent open redirect attacks
      const destination =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/app";

      router.replace(destination);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
      setPending(false);
    }
  }

  function fillDemo(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  }

  return (
    <div className="space-y-6">
      {/* Interactive 1-Click Demo Section */}
      <div className="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-b from-[var(--eco-canvas-100)] to-[var(--eco-canvas-50)] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <IconSparkles size={14} className="text-[var(--color-primary)] animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--eco-ink-700)]">
              Quick Demo Access
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
            Click to auto-fill
          </span>
        </div>

        <p className="text-xs text-[var(--eco-ink-500)]">
          Select a test account below to automatically fill credentials:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => fillDemo("customer@gmail.com", "password123")}
            className="group relative flex flex-col items-start p-2.5 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                <IconShoppingBag size={14} className="text-[var(--color-primary)]" />
                Test Customer
              </span>
              <IconArrowRight size={12} className="text-[var(--color-muted)] group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)] transition-transform" />
            </div>
            <span className="text-[10px] text-[var(--eco-ink-500)]">customer@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("manager@gmail.com", "password123")}
            className="group relative flex flex-col items-start p-2.5 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                <IconChefHat size={14} className="text-[var(--color-primary)]" />
                Kitchen Manager
              </span>
              <IconArrowRight size={12} className="text-[var(--color-muted)] group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)] transition-transform" />
            </div>
            <span className="text-[10px] text-[var(--eco-ink-500)]">manager@gmail.com</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1.5"
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
            className="eco-field text-sm w-full focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-[var(--eco-ink-700)]"
            >
              Password
            </label>
            <div className="flex items-center gap-3">
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:underline"
              >
                Forgot?
              </Link>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="eco-field text-sm w-full focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
          />
        </div>

        {errorMessage && (
          <div role="alert" className="eco-status-note text-xs flex items-center gap-2">
            <IconAlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="eco-button eco-button-primary w-full text-sm font-bold cursor-pointer py-2.5 transition-transform active:scale-[0.99]"
        >
          {pending ? "Signing in…" : "Sign In to EcoEats"}
        </button>
      </form>

      <div className="text-center text-xs text-[var(--eco-ink-500)] pt-3 border-t border-[var(--color-border)]">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="font-bold text-[var(--color-primary)] hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
