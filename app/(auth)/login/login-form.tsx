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

const DEMO_ACCOUNTS = [
  {
    label: "Customer",
    description: "Explore surplus food and manage pickups",
    email: "customer@gmail.com",
    password: "password123",
    icon: IconShoppingBag,
  },
  {
    label: "Kitchen manager",
    description: "Manage a restaurant and its listings",
    email: "manager@gmail.com",
    password: "password123",
    icon: IconChefHat,
  },
] as const;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(urlError);
  const [pending, setPending] = useState(false);

  // Demo accounts are useful locally, but public test credentials should not
  // be exposed as a production sign-in shortcut.
  const showDemoAccess = process.env.NODE_ENV !== "production";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Enter the email address associated with your account.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Enter your password to continue.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const normalizedMessage = error.message.toLowerCase();

        if (normalizedMessage.includes("invalid login credentials")) {
          setErrorMessage("Those details don't match an account. Check your email and password and try again.");
        } else if (normalizedMessage.includes("email not confirmed")) {
          setErrorMessage("Your email hasn't been confirmed yet. Check your inbox for the confirmation link.");
        } else if (normalizedMessage.includes("too many requests")) {
          setErrorMessage("Too many sign-in attempts. Please wait a moment before trying again.");
        } else {
          setErrorMessage("We couldn't sign you in right now. Please try again in a moment.");
        }

        setPending(false);
        return;
      }

      // Only accept same-site relative destinations. Reject protocol-relative
      // URLs and backslash variants that can be interpreted unexpectedly.
      const safeDestination =
        redirectTo &&
        redirectTo.startsWith("/") &&
        !redirectTo.startsWith("//") &&
        !redirectTo.includes("\\")
          ? redirectTo
          : "/app";

      router.replace(safeDestination);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try signing in again.");
      setPending(false);
    }
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    if (pending) return;
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage(null);
  }

  return (
    <div className="space-y-6">
      {showDemoAccess && (
        <section
          aria-label="Demo account shortcuts"
          className="overflow-hidden rounded-2xl border border-[#dce9dd] bg-[#f3f8f1]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#e2ecdf] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-white text-[#286342] shadow-sm">
                <IconSparkles size={15} />
              </span>
              <div>
                <p className="text-xs font-extrabold text-[#1d3e2c]">Explore the demo</p>
                <p className="text-[10px] text-[#647768]">Fill a test account in one click</p>
              </div>
            </div>
            <span className="rounded-full border border-[#d7e6d6] bg-white/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#52745c]">
              Demo access
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => {
              const DemoIcon = account.icon;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email, account.password)}
                  disabled={pending}
                  className="group flex min-w-0 items-start gap-3 rounded-xl border border-[#e1e9df] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-[#83aa8b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d7048] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf5eb] text-[#286342] transition group-hover:bg-[#286342] group-hover:text-white">
                    <DemoIcon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold capitalize text-[#23362a]">{account.label}</span>
                      <IconArrowRight size={13} className="shrink-0 text-[#8a9a8c] transition group-hover:translate-x-0.5 group-hover:text-[#286342]" />
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-[#647768]">{account.email}</span>
                    <span className="mt-1 block text-[10px] leading-relaxed text-[#859187]">{account.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="login-email" className="block text-xs font-bold text-[#293b30]">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? "login-error" : undefined}
            className="w-full rounded-xl border border-[#dfe5dc] bg-[#fffefa] px-4 py-3.5 text-sm text-[#24352a] outline-none transition placeholder:text-[#a0aaa0] hover:border-[#bccdbd] focus:border-[#39734d] focus:ring-4 focus:ring-[#39734d]/10"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="block text-xs font-bold text-[#293b30]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-[#52745c] transition hover:text-[#1d4b31] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39734d] focus-visible:ring-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "login-error" : undefined}
              className="w-full rounded-xl border border-[#dfe5dc] bg-[#fffefa] px-4 py-3.5 pr-16 text-sm text-[#24352a] outline-none transition placeholder:text-[#a0aaa0] hover:border-[#bccdbd] focus:border-[#39734d] focus:ring-4 focus:ring-[#39734d]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-3 my-auto rounded-lg px-2 text-[11px] font-bold text-[#52745c] transition hover:bg-[#edf5eb] hover:text-[#1d4b31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39734d]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            id="login-error"
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-xl border border-[#f0d4ce] bg-[#fff5f2] px-3.5 py-3 text-xs leading-relaxed text-[#9a3e32]"
          >
            <IconAlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4b31] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(29,75,49,0.18)] transition hover:-translate-y-0.5 hover:bg-[#286342] hover:shadow-[0_12px_24px_rgba(29,75,49,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39734d] focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
        >
          {pending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
              Signing you in...
            </>
          ) : (
            <>
              Sign in to EcoEats
              <IconArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
