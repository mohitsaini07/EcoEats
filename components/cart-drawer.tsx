"use client";

import { useEffect } from "react";
import {
  IconShoppingBag,
  IconTrash,
  IconClock,
  IconShieldCheck,
  IconX,
  IconSparkles,
  IconLeaf,
  IconMapPin,
  IconPlus,
  IconMinus,
} from "@/components/icons";
import type { ActiveCart } from "@/lib/types/marketplace";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: ActiveCart | null;
  onUpdateQuantity: (listingId: string, quantity: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const originalTotal = items.reduce(
    (sum, item) => sum + item.listing.original_price * item.quantity,
    0,
  );
  const itemTotal = items.reduce(
    (sum, item) => sum + item.listing.discounted_price * item.quantity,
    0,
  );
  const savings = Math.max(0, originalTotal - itemTotal);
  const hasItems = items.length > 0;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close shopping cart"
        className="absolute inset-0 cursor-default bg-[#10251a]/45 backdrop-blur-[3px] animate-in fade-in duration-200"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[500px] flex-col overflow-hidden border-l border-[#e4e9df] bg-[#fbfaf4] shadow-[-24px_0_70px_rgba(18,42,28,0.2)] animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <header className="relative shrink-0 overflow-hidden bg-[#173d2a] px-5 pb-5 pt-6 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-7 -top-14 size-36 rounded-full border border-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/12 text-[#d7f1dd] ring-1 ring-white/15">
                <IconShoppingBag size={23} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b9d7c0]">
                  EcoEats · Pickup only
                </p>
                <h2 id="cart-drawer-title" className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  Your cart
                </h2>
                <p className="mt-0.5 text-xs text-white/70">
                  {totalItems} {totalItems === 1 ? "item" : "items"} from your local kitchen
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white/85 transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <IconX size={19} />
            </button>
          </div>

          {hasItems && cart && (
            <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-3.5 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#dff2e3] text-[#226a3d]">
                <IconShieldCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{cart.restaurant_name}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/65">
                  Your items are from one kitchen, ready for one pickup.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#d9f0df]">
                One kitchen
              </span>
            </div>
          )}
        </header>

        {/* Items */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {!hasItems ? (
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">
              <div className="relative mb-6 grid size-24 place-items-center rounded-[2rem] border border-[#e4eadf] bg-white text-[#2d804d] shadow-[0_12px_35px_rgba(35,83,49,0.08)]">
                <IconShoppingBag size={39} />
                <span className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-[#e5f4e7] text-[#347d4c]">
                  <IconLeaf size={15} />
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66816c]">
                A little room for something good
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#17291d]">
                Your cart is empty
              </h3>
              <p className="mt-2 max-w-[270px] text-sm leading-6 text-[#758078]">
                Discover delicious surplus food from kitchens nearby and give it a second chance.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#246b3e] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(36,107,62,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1c5832] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246b3e] focus-visible:ring-offset-2"
              >
                Explore nearby food <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#1d3023]">Your rescued picks</p>
                  <p className="mt-0.5 text-[11px] text-[#879087]">Review quantities before checkout</p>
                </div>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-[#8a625b] transition hover:bg-[#f8e9e5] hover:text-[#a34435] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c66a58]"
                >
                  <IconTrash size={13} /> Clear cart
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const listing = item.listing;
                  const quantity = item.quantity;
                  const lineTotal = listing.discounted_price * quantity;
                  const lineOriginal = listing.original_price * quantity;
                  const lineSavings = Math.max(0, lineOriginal - lineTotal);
                  const discountPercent = listing.original_price > 0
                    ? Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100)
                    : 0;
                  const canAddMore = quantity < listing.available_quantity;

                  return (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-[22px] border border-[#e6e9df] bg-white p-3.5 shadow-[0_3px_14px_rgba(27,54,34,0.035)] transition hover:border-[#cbdcc9] hover:shadow-[0_8px_24px_rgba(27,54,34,0.07)] sm:p-4"
                    >
                      <div className="flex gap-3.5">
                        <div className="relative size-[94px] shrink-0 overflow-hidden rounded-2xl bg-[#f0f1e9] sm:size-[108px]">
                          {listing.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={listing.image_url}
                              alt={listing.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[#8ba18e]">
                              <IconShoppingBag size={27} />
                            </div>
                          )}
                          {discountPercent > 0 && (
                            <span className="absolute left-1.5 top-1.5 rounded-full bg-[#e4f3e6] px-2 py-1 text-[9px] font-extrabold text-[#246b3e] shadow-sm">
                              {discountPercent}% off
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#1b2c20]">
                              {listing.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.food_listing_id, 0)}
                              aria-label={`Remove ${listing.title} from cart`}
                              className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-[#9aa29b] transition hover:bg-[#faeeeb] hover:text-[#b44e3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c66a58]"
                            >
                              <IconTrash size={15} />
                            </button>
                          </div>

                          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#7c897e]">
                            <IconClock size={12} className="shrink-0 text-[#3b8051]" />
                            <span className="truncate">Pickup {listing.pickup_start} – {listing.pickup_end}</span>
                          </p>

                          <div className="mt-3 flex items-end justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="text-base font-extrabold tabular-nums text-[#1b3021]">
                                  {formatINR(lineTotal)}
                                </span>
                                <span className="text-[11px] tabular-nums text-[#a2aaa1] line-through">
                                  {formatINR(lineOriginal)}
                                </span>
                              </div>
                              {lineSavings > 0 && (
                                <p className="mt-0.5 text-[10px] font-semibold text-[#34794a]">
                                  You save {formatINR(lineSavings)}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#e1e9dd] bg-[#f7faf5] p-1">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.food_listing_id, quantity - 1)}
                                aria-label={`Decrease ${listing.title} quantity`}
                                className="grid size-7 place-items-center rounded-full bg-white text-[#315b3b] shadow-sm transition hover:bg-[#e9f3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246b3e]"
                              >
                                <IconMinus size={13} />
                              </button>
                              <span className="min-w-4 text-center text-xs font-bold tabular-nums text-[#203a28]" aria-live="polite">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.food_listing_id, quantity + 1)}
                                disabled={!canAddMore}
                                aria-label={`Increase ${listing.title} quantity`}
                                className="grid size-7 place-items-center rounded-full bg-[#246b3e] text-white shadow-sm transition hover:bg-[#1d5933] disabled:cursor-not-allowed disabled:bg-[#d6ded4] disabled:text-[#879087] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246b3e] focus-visible:ring-offset-2"
                              >
                                <IconPlus size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!canAddMore && (
                        <p className="mt-2 pl-[108px] text-[10px] font-medium text-[#9b7650] sm:pl-[122px]">
                          Maximum currently available quantity reached.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[#dce9d9] bg-[#eef6eb] p-3.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-[#34794a] shadow-sm">
                  <IconMapPin size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#285c37]">Pickup from {cart?.restaurant_name}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#637967]">
                    EcoEats is pickup-only. Visit the kitchen during the pickup window shown on each item.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Summary / Checkout */}
        {hasItems && cart && (
          <footer className="shrink-0 border-t border-[#e4e8de] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-10px_30px_rgba(27,54,34,0.045)] sm:px-6 sm:pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-[#203326]">Order summary</p>
              <span className="rounded-full bg-[#edf6ed] px-2.5 py-1 text-[10px] font-bold text-[#36764a]">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#758078]">
                <span>Original value</span>
                <span className="tabular-nums line-through">{formatINR(originalTotal)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-[#34794a]">
                <span className="inline-flex items-center gap-1.5">
                  <IconSparkles size={14} /> Surplus savings
                </span>
                <span className="tabular-nums">−{formatINR(savings)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#e1e7dd] pt-3">
                <span className="text-sm font-bold text-[#203326]">Total amount</span>
                <span className="text-xl font-extrabold tracking-tight tabular-nums text-[#1e6538]">
                  {formatINR(cart.total_amount)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#f0dfbd] bg-[#fff8e9] px-3 py-2.5">
              <IconClock size={16} className="mt-0.5 shrink-0 text-[#aa7931]" />
              <p className="text-[10px] leading-relaxed text-[#80643a]">
                <strong className="font-bold text-[#745325]">10-minute inventory hold:</strong> Items are not reserved while in your cart. The hold begins when you start checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#246b3e] px-5 py-4 text-sm font-bold text-white shadow-[0_9px_22px_rgba(36,107,62,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1c5932] hover:shadow-[0_12px_26px_rgba(36,107,62,0.25)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246b3e] focus-visible:ring-offset-2"
            >
              Continue to checkout
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs tabular-nums">
                {formatINR(cart.total_amount)}
              </span>
              <span aria-hidden="true" className="text-base">→</span>
            </button>
            <p className="mt-2.5 text-center text-[10px] text-[#8a948b]">
              Secure checkout · Pay online · Pick up locally
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}

