"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  IconAlertCircle,
  IconCheckCircle,
  IconChefHat,
  IconShoppingBag,
  IconSparkles,
} from "@/components/icons";

export function SignupForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"CUSTOMER" | "PARTNER">("CUSTOMER");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Restaurant Partner specific fields
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    accountType: "CUSTOMER" | "PARTNER";
    restaurantName?: string;
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    // Common validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage(
        accountType === "PARTNER"
          ? "Please enter the manager or owner's full name."
          : "Please enter your full name."
      );
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

    // Partner specific validation
    const trimmedRestName = restaurantName.trim();
    const trimmedRestAddress = restaurantAddress.trim();
    const trimmedPhone = contactPhone.trim();

    if (accountType === "PARTNER") {
      if (!trimmedRestName) {
        setErrorMessage("Please enter your restaurant or bakery name.");
        return;
      }
      if (trimmedRestName.length > 150) {
        setErrorMessage("Restaurant name must be 150 characters or fewer.");
        return;
      }
      if (!trimmedRestAddress) {
        setErrorMessage("Please enter the restaurant's complete address.");
        return;
      }
      if (!trimmedPhone) {
        setErrorMessage("Please enter a contact phone number.");
        return;
      }
      if (trimmedPhone.length > 20) {
        setErrorMessage("Contact phone number must be 20 characters or fewer.");
        return;
      }
    }

    setPending(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const metadata: Record<string, string> = {
        name: trimmedName,
      };

      if (accountType === "PARTNER") {
        metadata.restaurant_name = trimmedRestName;
        metadata.restaurant_address = trimmedRestAddress;
        metadata.contact_phone = trimmedPhone;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${origin}/auth/callback?next=/app`,
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

      // If user session is active immediately (e.g. auto-confirm enabled)
      if (data.session && data.user) {
        if (accountType === "PARTNER") {
          // If session exists, ensure the pending application row is recorded
          await supabase.from("restaurant_applications").insert({
            user_id: data.user.id,
            restaurant_name: trimmedRestName,
            restaurant_address: trimmedRestAddress,
            contact_phone: trimmedPhone,
            status: "PENDING",
          });
          router.replace("/partner/status");
        } else {
          router.replace("/marketplace");
        }
        router.refresh();
        return;
      }

      // If email confirmation is required
      setSuccessInfo({
        email: trimmedEmail,
        accountType,
        restaurantName: trimmedRestName || undefined,
      });
      setPending(false);
    } catch {
      setErrorMessage("An unexpected registration error occurred. Please try again.");
      setPending(false);
    }
  }

  if (successInfo) {
    const isPartner = successInfo.accountType === "PARTNER";
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
            We sent an activation link to{" "}
            <strong className="text-[var(--color-foreground)]">{successInfo.email}</strong>.
            Click the link in your email to confirm your account.
          </p>
          {isPartner && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <IconSparkles size={14} className="text-amber-600 shrink-0" />
                Restaurant Application Pending
              </p>
              Your application for <strong>{successInfo.restaurantName}</strong> will be
              automatically registered under review as soon as your email is verified.
            </div>
          )}
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
    <div className="space-y-4">
      {/* Account Type Toggle */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={accountType === "CUSTOMER"}
          onClick={() => {
            setAccountType("CUSTOMER");
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            accountType === "CUSTOMER"
              ? "bg-white text-[var(--color-primary)] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <IconShoppingBag size={16} />
          Customer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={accountType === "PARTNER"}
          onClick={() => {
            setAccountType("PARTNER");
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            accountType === "PARTNER"
              ? "bg-white text-[var(--color-primary)] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <IconChefHat size={16} />
          Restaurant Partner
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {accountType === "PARTNER" && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold flex items-center gap-1.5 mb-0.5 text-emerald-950">
              <IconSparkles size={14} className="text-emerald-700 shrink-0" />
              Partner with EcoEats
            </span>
            List surplus batches near closing time, cut food waste, and recover kitchen revenue.
            Applications are reviewed and approved by administrators.
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
          >
            {accountType === "PARTNER" ? "Manager / Owner Name" : "Full Name"}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={accountType === "PARTNER" ? "e.g. Ramesh Patel" : "e.g. Priya Sharma"}
            className="eco-field text-sm"
          />
        </div>

        {accountType === "PARTNER" && (
          <>
            <div>
              <label
                htmlFor="restaurantName"
                className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
              >
                Restaurant / Bakery Name
              </label>
              <input
                id="restaurantName"
                name="restaurantName"
                type="text"
                required
                maxLength={150}
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="e.g. Green Harvest Kitchen"
                className="eco-field text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="contactPhone"
                className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
              >
                Contact Phone Number
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                required
                maxLength={20}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="eco-field text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="restaurantAddress"
                className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
              >
                Restaurant Address
              </label>
              <textarea
                id="restaurantAddress"
                name="restaurantAddress"
                rows={2}
                required
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                placeholder="e.g. 104 100ft Road, Indiranagar, Bengaluru"
                className="eco-field text-sm resize-none"
              />
            </div>
          </>
        )}

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
          className="eco-button eco-button-primary w-full text-sm font-bold rounded-xl cursor-pointer"
        >
          {pending
            ? accountType === "PARTNER"
              ? "Submitting Application…"
              : "Creating Account…"
            : accountType === "PARTNER"
            ? "Submit Partner Application"
            : "Create EcoEats Account"}
        </button>
      </form>
    </div>
  );
}
