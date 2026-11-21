"use client";

import { useState, useEffect } from "react";
import {
  IconClock,
  IconShieldCheck,
  IconCheckCircle,
  IconMapPin,
  IconX,
  IconAlertCircle,
} from "@/components/icons";
import type { ActiveCart } from "@/lib/types/marketplace";
import { checkoutActiveCartAction } from "@/app/marketplace/cart-actions";

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
  const [step, setStep] = useState<"review" | "processing" | "confirmed">(
    "review",
  );
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes = 600s
  const [pickupCode, setPickupCode] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);

    try {
      const result = await checkoutActiveCartAction();
      if (!result.success) {
        setErrorMessage(result.error);
        setStep("review");
        return;
      }

      const confirmedOrderId = result.data.orderId;
      const generatedCode = `ECO-${confirmedOrderId.replace(/-/g, "").slice(-4).toUpperCase()}`;
      setPickupCode(generatedCode);
      setOrderId(confirmedOrderId);
      setStep("confirmed");
      onOrderSuccess(confirmedOrderId);
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      setErrorMessage("An unexpected error occurred during checkout. Please try again.");
      setStep("review");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102319]/55 p-3 backdrop-blur-md motion-fade-in sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-[#FCFDF9] shadow-[0_30px_100px_rgba(0,0,0,0.28)] motion-modal-enter">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#DCEBDD]/50 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-[#E9EEE7] px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#EAF3E9] text-[#28623C]">
              <IconShieldCheck size={21} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#829283]">
                ECOEATS CHECKOUT
              </p>
              <h3
                id="checkout-title"
                className="mt-0.5 text-lg font-extrabold tracking-tight text-[#203C2A]"
              >
                {step === "confirmed"
                  ? "Reservation confirmed!"
                  : step === "processing"
                    ? "Securing your order"
                    : "Complete your reservation"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={step === "processing"}
            className="grid size-9 place-items-center rounded-full text-[#849187] transition-all duration-200 hover:rotate-90 hover:bg-[#EEF3EC] hover:text-[#294B34] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close checkout"
          >
            <IconX size={19} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="relative flex items-center gap-2 px-6 pt-5 sm:px-8">
          {[
            { label: "Review", value: "review" },
            { label: "Payment", value: "processing" },
            { label: "Confirmed", value: "confirmed" },
          ].map((item, index) => {
            const currentIndex =
              step === "review" ? 0 : step === "processing" ? 1 : 2;

            const completed = index < currentIndex;
            const active = index === currentIndex;

            return (
              <div key={item.value} className="flex flex-1 items-center gap-2">
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`grid size-6 place-items-center rounded-full text-[10px] font-bold transition-all duration-500 ${
                      completed || active
                        ? "bg-[#285B39] text-white shadow-[0_3px_10px_rgba(40,91,57,0.2)]"
                        : "bg-[#E9EEE7] text-[#98A398]"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </span>
                  <span
                    className={`hidden text-[10px] font-bold sm:inline ${
                      active ? "text-[#285B39]" : "text-[#A0AAA0]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {index !== 2 && (
                  <div
                    className={`h-px flex-1 transition-colors duration-500 ${
                      completed ? "bg-[#6A9B70]" : "bg-[#E6EBE3]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Scrollable content */}
        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {/* REVIEW */}
          {step === "review" && (
            <div className="space-y-5 motion-fade-in">
              {/* Reservation timer */}
              <div className="relative overflow-hidden rounded-2xl border border-[#F0DFB9] bg-[#FFF9EB] p-4">
                <div className="absolute -right-8 -top-10 size-28 rounded-full bg-[#F5DFAF]/30 blur-2xl" />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#B47A25] shadow-sm">
                      <IconClock size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-[#79551F]">
                        Your food is reserved!
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#967747]">
                        Complete payment before your hold expires.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div
                      className={`font-mono text-xl font-black tabular-nums tracking-tight ${
                        minutes === 0 && seconds < 30
                          ? "animate-pulse text-rose-600"
                          : "text-[#A36C19]"
                      }`}
                    >
                      {String(minutes).padStart(2, "0")}:
                      {String(seconds).padStart(2, "0")}
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#AA8B59]">
                      Time remaining
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-[#EEDFBF]">
                  <div
                    className="h-full rounded-full bg-[#C58B36] transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((minutes * 60 + seconds) / 600) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Restaurant */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A094]">
                  Your pickup order
                </p>

                <div className="rounded-2xl border border-[#E8EDE5] bg-white p-4 shadow-[0_3px_15px_rgba(30,60,40,0.025)] sm:p-5">
                  <div className="flex items-center gap-3 border-b border-[#EDF0EA] pb-4">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#EDF4EA] text-[#326343]">
                      <IconMapPin size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#99A398]">
                        Restaurant
                      </p>
                      <p className="mt-0.5 truncate text-sm font-extrabold text-[#294633]">
                        {cart.restaurant_name}
                      </p>
                    </div>

                    <span className="ml-auto shrink-0 rounded-full bg-[#EFF5ED] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#48724F]">
                      Pickup
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-4 py-4">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#344B38] transition-colors group-hover:text-[#267342]">
                            {item.listing.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#96A096]">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-bold tabular-nums text-[#304A36]">
                          ₹{item.listing.discounted_price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex items-end justify-between border-t border-dashed border-[#DFE7DC] pt-4">
                    <div>
                      <p className="text-xs font-bold text-[#647466]">
                        Total payable
                      </p>
                      <p className="mt-1 text-[10px] text-[#9AA49A]">
                        Final reservation amount
                      </p>
                    </div>

                    <p className="text-2xl font-black tracking-tight text-[#285B39] tabular-nums">
                      ₹{cart.total_amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 rounded-xl bg-[#F0F5EE] px-4 py-3">
                <IconShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[#39754A]"
                />
                <p className="text-[10px] leading-relaxed text-[#657A67]">
                  Secure checkout powered by Razorpay. Your inventory is
                  temporarily held while you complete payment.
                </p>
              </div>
            </div>
          )}

          {/* PROCESSING */}
          {step === "processing" && (
            <div className="flex min-h-[340px] flex-col items-center justify-center text-center motion-fade-in">
              <div className="relative mb-8 grid size-28 place-items-center">
                <div className="absolute inset-0 rounded-full border border-[#DCEADB] animate-ping opacity-30" />
                <div className="absolute inset-2 rounded-full border-2 border-[#DDEADD]" />
                <div className="absolute inset-2 rounded-full border-2 border-[#39784A] border-t-transparent animate-spin" />

                <div className="grid size-16 place-items-center rounded-full bg-[#EAF3E8] text-[#326943]">
                  <IconShieldCheck size={29} />
                </div>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#729276]">
                Please wait
              </p>

              <h4 className="mt-3 text-xl font-black tracking-tight text-[#264832]">
                Securing your food
              </h4>

              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#879487]">
                We&apos;re processing your payment and confirming your reservation.
                Please don&apos;t close this window.
              </p>

              <div className="mt-8 flex items-center gap-2 rounded-full border border-[#E6EDE3] bg-white px-4 py-2.5 shadow-sm">
                <span className="size-2 animate-pulse rounded-full bg-[#4D985C]" />
                <span className="text-[10px] font-semibold text-[#6F826F]">
                  Waiting for payment confirmation
                </span>
              </div>
            </div>
          )}

          {/* CONFIRMED */}
          {step === "confirmed" && (
            <div className="space-y-6 text-center motion-fade-in">
              {/* Success animation */}
              <div className="relative mx-auto grid size-24 place-items-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#D8EED8] opacity-30" />
                <div className="relative grid size-20 place-items-center rounded-full bg-[#E5F2E3] text-[#327447] shadow-[0_8px_30px_rgba(50,116,71,0.12)]">
                  <IconCheckCircle size={43} />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF5EA] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#397449]">
                  <IconCheckCircle size={12} />
                  Payment successful
                </div>

                <h4 className="mt-4 text-2xl font-black tracking-tight text-[#23442D]">
                  You rescued food! 🎉
                </h4>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-[#829082]">
                  Your reservation is confirmed. Show your pickup code at the
                  restaurant counter when you arrive.
                </p>
              </div>

              {/* Pickup code */}
              <div className="relative overflow-hidden rounded-[24px] border border-[#CFE2CE] bg-gradient-to-br from-[#F0F7ED] to-[#E4F0E1] p-6 shadow-[0_8px_30px_rgba(40,90,50,0.07)]">
                <div className="absolute -right-10 -top-10 size-32 rounded-full bg-white/50 blur-2xl" />
                <div className="absolute -bottom-12 -left-8 size-32 rounded-full bg-[#BFDDBD]/30 blur-2xl" />

                <div className="relative">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#59815D]">
                    Your secret pickup code
                  </p>

                  <p className="my-4 select-all font-mono text-4xl font-black tracking-[0.18em] text-[#285B39] sm:text-5xl">
                    {pickupCode}
                  </p>

                  <div className="mx-auto h-px max-w-[180px] bg-[#C9DCC7]" />

                  <p className="mt-3 text-[10px] text-[#789078]">
                    Order ID:{" "}
                    <span className="font-mono font-bold text-[#476A4C]">
                      {orderId}
                    </span>
                  </p>
                </div>
              </div>

              {/* Pickup information */}
              <div className="rounded-2xl border border-[#E8EDE5] bg-white p-4 text-left shadow-sm">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#98A397]">
                  Pickup information
                </p>

                <div className="flex gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#EEF4EB] text-[#376B43]">
                    <IconMapPin size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#304C36]">
                      {cart.restaurant_name}
                    </p>
                    <p className="mt-1 text-xs text-[#8A988A]">
                      Indiranagar 100ft Road, Bengaluru
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-[#EDF0EA] pt-4">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FFF5E6] text-[#B27B2B]">
                    <IconClock size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#455B45]">
                      Pickup deadline
                    </p>
                    <p className="mt-1 text-xs text-[#89968A]">
                      Today before 9:30 PM
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[#8A998A]">
                Thank you for helping reduce food waste. 🌱
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative border-t border-[#E8EDE5] bg-white/90 px-5 py-4 sm:px-8 sm:py-5">
          {errorMessage && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#F4C7C7] bg-[#FEF2F2] p-3 text-xs font-medium text-[#991B1B]">
              <IconAlertCircle size={16} className="shrink-0 text-[#DC2626]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "review" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-[#E0E7DE] bg-white px-4 py-3 text-xs font-bold text-[#718071] transition-all duration-200 hover:border-[#BCCDBA] hover:bg-[#F6F9F4] active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayAndConfirm}
                disabled={isExpired}
                className="group flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-[#285B39] px-4 py-3 text-xs font-extrabold text-white shadow-[0_5px_15px_rgba(40,91,57,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1E492E] hover:shadow-[0_8px_20px_rgba(40,91,57,0.25)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#A6B5A7] disabled:shadow-none"
              >
                {isExpired ? (
                  "Reservation expired"
                ) : (
                  <>
                    Pay ₹{cart.total_amount}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex items-center justify-center gap-2 py-1 text-[10px] font-semibold text-[#8A998A]">
              <IconShieldCheck size={14} className="text-[#52845B]" />
              Secure payment processing
            </div>
          )}

          {step === "confirmed" && (
            <button
              type="button"
              onClick={onClose}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#285B39] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_5px_15px_rgba(40,91,57,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1E492E] hover:shadow-lg active:scale-[0.98]"
            >
              Done & View Order
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
