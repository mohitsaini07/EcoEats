"use client";

import { useState, useEffect } from "react";
import {
  IconClock,
  IconShieldCheck,
  IconCheckCircle,
  IconMapPin,
  IconX,
} from "@/components/icons";
import type { ActiveCart } from "@/lib/types/marketplace";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: ActiveCart | null;
  onOrderSuccess: (orderId: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"review" | "processing" | "confirmed">("review");
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes = 600s
  const [pickupCode, setPickupCode] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

  // Countdown timer for 10-minute inventory reservation
  useEffect(() => {
    if (!isOpen || step === "confirmed") return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, step]);

  if (!isOpen || !cart) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isExpired = secondsRemaining === 0;

  async function handlePayAndConfirm() {
    setStep("processing");

    // Simulate backend checkout transaction & 10-min reservation conversion
    setTimeout(() => {
      const generatedCode = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedOrderId = `ord-${Date.now().toString().slice(-6)}`;
      setPickupCode(generatedCode);
      setOrderId(generatedOrderId);
      setStep("confirmed");
      onOrderSuccess(generatedOrderId);
    }, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
              <IconShieldCheck size={18} />
            </span>
            <h3 className="text-base font-bold text-[var(--color-foreground)]">
              {step === "confirmed" ? "Order Confirmed!" : "Complete Reservation"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-muted)] hover:bg-[var(--eco-canvas-100)] transition"
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Content depending on step */}
        <div className="py-4 overflow-y-auto space-y-4">
          {step === "review" && (
            <>
              {/* 10-Minute Fair Reservation Banner */}
              <div className="rounded-xl bg-[var(--eco-amber-50)] p-4 border border-[var(--eco-amber-100)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[var(--eco-amber-700)]">
                  <IconClock size={18} className="text-[var(--color-accent)] shrink-0" />
                  <div>
                    <span className="font-bold block">10-Minute Inventory Hold</span>
                    <span className="text-[11px] text-[var(--eco-ink-700)]">
                      Locked to prevent double-booking while you pay.
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-1 text-sm font-extrabold text-[var(--color-accent)] tabular-nums shadow-xs reservation-pulse">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
              </div>

              {/* Order breakdown */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--eco-canvas-50)] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--eco-ink-700)] pb-2 border-b border-[var(--eco-line-200)]">
                  <IconMapPin size={14} className="text-[var(--color-primary)]" />
                  <span className="font-semibold text-[var(--color-foreground)]">
                    {cart.restaurant_name}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-[var(--eco-ink-700)]">
                        {item.listing.title} <strong className="text-[var(--color-foreground)]">× {item.quantity}</strong>
                      </span>
                      <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                        ₹{item.listing.discounted_price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[var(--eco-line-200)] flex justify-between items-center text-sm font-black text-[var(--color-foreground)]">
                  <span>Total Amount (Locked)</span>
                  <span className="text-base text-[var(--color-primary)] tabular-nums">
                    ₹{cart.total_amount}
                  </span>
                </div>
              </div>

              {/* Payment Details Note */}
              <div className="text-xs text-[var(--eco-ink-500)] flex items-center gap-2">
                <IconShieldCheck size={14} className="text-[var(--color-primary)] shrink-0" />
                <span>
                  Razorpay Secure Gateway • Instant refund if pickup cannot be fulfilled.
                </span>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <h4 className="font-bold text-base text-[var(--color-foreground)]">
                Securing Inventory & Processing Payment
              </h4>
              <p className="text-xs text-[var(--color-muted)] max-w-xs">
                Contacting banking gateway and converting your 10-minute hold into a confirmed pickup code...
              </p>
            </div>
          )}

          {step === "confirmed" && (
            <div className="space-y-5 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--eco-leaf-50)] text-[var(--color-primary)]">
                <IconCheckCircle size={32} />
              </div>

              <div>
                <h4 className="text-xl font-black text-[var(--color-foreground)] tracking-tight">
                  You Rescued Food! 🎉
                </h4>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Your reservation is confirmed. Present this code at the restaurant counter.
                </p>
              </div>

              {/* Prominent Pickup Code Card */}
              <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--eco-leaf-50)]/60 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Your Secret Pickup Code
                </span>
                <div className="font-mono text-3xl font-black tracking-widest text-[var(--eco-leaf-700)] select-all py-1">
                  {pickupCode}
                </div>
                <p className="text-[11px] text-[var(--eco-ink-500)]">
                  Order ID: <span className="font-mono">{orderId}</span>
                </p>
              </div>

              {/* Pickup location and timing */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--eco-canvas-50)] p-3 text-left text-xs space-y-1.5">
                <div className="font-semibold text-[var(--color-foreground)] flex items-center gap-1.5">
                  <IconMapPin size={14} className="text-[var(--color-primary)]" />
                  {cart.restaurant_name}
                </div>
                <p className="text-[var(--eco-ink-500)] pl-5">
                  Indiranagar 100ft Road, Bengaluru
                </p>
                <div className="text-[var(--color-accent)] font-semibold pl-5 pt-1">
                  Pickup window: Today before 9:30 PM
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          {step === "review" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="eco-button eco-button-secondary text-xs flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayAndConfirm}
                disabled={isExpired}
                className="eco-button eco-button-primary text-sm flex-2 font-bold"
              >
                Pay ₹{cart.total_amount} & Confirm Hold
              </button>
            </div>
          )}

          {step === "confirmed" && (
            <button
              type="button"
              onClick={onClose}
              className="eco-button eco-button-primary w-full text-sm font-bold"
            >
              Done & View Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
