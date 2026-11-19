"use client";

import { useState, useTransition } from "react";
import { submitPartnerApplication } from "@/app/partner/actions";
import { IconAlertCircle, IconCheckCircle, IconChefHat } from "@/components/icons";

interface ApplicationFormProps {
  initialValues?: {
    restaurantName?: string;
    restaurantAddress?: string;
    contactPhone?: string;
  };
  isReapplying?: boolean;
}

export function PartnerApplicationForm({
  initialValues,
  isReapplying = false,
}: ApplicationFormProps) {
  const [restaurantName, setRestaurantName] = useState(
    initialValues?.restaurantName || ""
  );
  const [restaurantAddress, setRestaurantAddress] = useState(
    initialValues?.restaurantAddress || ""
  );
  const [contactPhone, setContactPhone] = useState(
    initialValues?.contactPhone || ""
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("restaurantName", restaurantName);
    formData.set("restaurantAddress", restaurantAddress);
    formData.set("contactPhone", contactPhone);

    startTransition(async () => {
      const res = await submitPartnerApplication(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to submit application.");
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
        <div className="mx-auto grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <IconCheckCircle size={24} />
        </div>
        <h4 className="text-base font-bold text-emerald-950">
          Application Submitted Successfully
        </h4>
        <p className="text-xs text-emerald-800 max-w-md mx-auto">
          Your restaurant partner application is now under review. You will be
          notified as soon as our administrators verify your details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="app-restaurant-name"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Restaurant / Bakery Name
        </label>
        <input
          id="app-restaurant-name"
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
          htmlFor="app-contact-phone"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Contact Phone Number
        </label>
        <input
          id="app-contact-phone"
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
          htmlFor="app-restaurant-address"
          className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1"
        >
          Complete Restaurant Address
        </label>
        <textarea
          id="app-restaurant-address"
          rows={3}
          required
          value={restaurantAddress}
          onChange={(e) => setRestaurantAddress(e.target.value)}
          placeholder="e.g. 104 100ft Road, Indiranagar, Bengaluru, Karnataka"
          className="eco-field text-sm resize-none"
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
        disabled={isPending}
        className="eco-button eco-button-primary w-full text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
      >
        <IconChefHat size={16} />
        {isPending
          ? "Submitting..."
          : isReapplying
          ? "Submit Updated Application"
          : "Submit Partner Application"}
      </button>
    </form>
  );
}
