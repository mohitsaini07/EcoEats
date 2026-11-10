"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { IconAlertCircle, IconCheckCircle } from "@/components/icons";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setPending(false);
        return;
      }

      setSuccess(true);
      setPending(false);

      setTimeout(() => {
        router.replace("/app");
        router.refresh();
      }, 2000);
    } catch {
      setErrorMessage("Failed to update password. Your recovery session may have expired.");
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
            Password updated!
          </h3>
          <p className="text-xs sm:text-sm text-[var(--eco-ink-700)] mt-2">
            Your password has been changed successfully. Redirecting you to your account...
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/app"
            className="eco-button eco-button-primary w-full text-xs font-bold"
          >
            Continue to App
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="password"
            className="block text-xs font-bold text-[var(--eco-ink-700)]"
          >
            New Password (min 8 characters)
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
          placeholder="Enter your new password"
          className="eco-field text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
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
        {pending ? "Updating Password…" : "Update Password"}
      </button>
    </form>
  );
}

