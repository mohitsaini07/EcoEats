"use client";

import { IconShoppingBag, IconTrash, IconClock, IconShieldCheck, IconX, IconSparkles } from "@/components/icons";
import type { ActiveCart } from "@/lib/types/marketplace";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: ActiveCart | null;
  onUpdateQuantity: (listingId: string, quantity: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const originalTotal =
    cart?.items.reduce((sum, item) => sum + item.listing.original_price * item.quantity, 0) ?? 0;
  const savings = originalTotal - (cart?.total_amount ?? 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-gradient-to-b from-stone-50 via-[#fcfbf9] to-[#f4f2ed] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] border-l border-white/60 flex flex-col justify-between transform transition-transform duration-300 animate-in slide-in-from-right">
          
          {/* Header with 3D floating effect */}
          <div className="p-6 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl shadow-xs relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-700/25">
                  <IconShoppingBag size={22} />
                </div>
                <div>
                  <h2 id="cart-drawer-title" className="text-lg font-black tracking-tight text-stone-900">
                    Your Active Cart
                  </h2>
                  <p className="text-xs font-medium text-stone-500">
                    {totalItems} {totalItems === 1 ? "item" : "items"} selected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition shadow-inner cursor-pointer"
                aria-label="Close cart"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Single restaurant constraint banner with soft depth */}
            {cart && cart.items.length > 0 && (
              <div className="mt-4 rounded-2xl bg-emerald-50/90 p-3.5 border border-emerald-200/70 flex items-start gap-3 shadow-xs">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white mt-0.5 shadow-sm">
                  <IconShieldCheck size={16} />
                </div>
                <div className="text-xs text-stone-700">
                  <span className="font-extrabold text-emerald-900">
                    {cart.restaurant_name}
                  </span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Orders are packed fresh together from this single kitchen.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {!cart || cart.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-8">
                <span className="grid size-20 place-items-center rounded-3xl bg-white shadow-md text-stone-300 mb-4 border border-stone-200/60">
                  <IconShoppingBag size={36} />
                </span>
                <h3 className="font-extrabold text-lg text-stone-900">
                  Your cart is empty
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                  Discover delicious surplus meals near you and reserve them before closing time.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-2xl bg-stone-900 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-stone-800 transition cursor-pointer"
                >
                  Browse Food
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-3xl border border-stone-200/80 bg-white p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">
                        {item.listing.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1 font-medium">
                        <IconClock size={12} className="text-emerald-600" />
                        {item.listing.pickup_start} – {item.listing.pickup_end}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.food_listing_id, 0)}
                      className="grid size-8 place-items-center rounded-xl bg-stone-50 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      aria-label={`Remove ${item.listing.title}`}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-stone-900 tabular-nums">
                        ₹{item.listing.discounted_price * item.quantity}
                      </span>
                      <span className="text-xs text-stone-400 line-through tabular-nums">
                        ₹{item.listing.original_price * item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-stone-50/80 p-1 shadow-inner">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.food_listing_id, item.quantity - 1)}
                        className="flex size-7 items-center justify-center rounded-lg bg-white text-stone-700 font-bold shadow-xs hover:bg-stone-100 transition cursor-pointer active:scale-95"
                        aria-label="Decrease"
                      >
                        -
                      </button>
                      <span className="min-w-5 text-center text-xs font-black text-stone-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.food_listing_id, item.quantity + 1)}
                        disabled={item.quantity >= item.listing.available_quantity}
                        className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-700 transition disabled:opacity-30 cursor-pointer active:scale-95"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary with 3D Glass Layer */}
          {cart && cart.items.length > 0 && (
            <div className="p-6 border-t border-stone-200/80 bg-white/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)] space-y-4 relative z-10">
              <div className="space-y-2 text-xs text-stone-600 font-medium">
                <div className="flex justify-between">
                  <span>Original value</span>
                  <span className="line-through tabular-nums text-stone-400">₹{originalTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <IconSparkles size={13} />
                    Surplus savings
                  </span>
                  <span className="tabular-nums">-₹{savings}</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-3 border-t border-stone-200/80">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-emerald-700">₹{cart.total_amount}</span>
                </div>
              </div>

              {/* 10-minute hold reminder */}
              <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 shadow-xs">
                <div className="grid size-7 shrink-0 place-items-center rounded-xl bg-amber-500 text-stone-950 font-bold shadow-sm">
                  <IconClock size={15} />
                </div>
                <span>
                  Checkout temporarily reserves inventory for <strong className="font-extrabold">10 minutes</strong>.
                </span>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="rounded-2xl border border-stone-300/80 bg-white px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-rose-600 transition shadow-xs cursor-pointer active:scale-95"
                  aria-label="Clear cart"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3.5 px-6 text-xs font-black text-white shadow-lg shadow-emerald-700/30 hover:shadow-xl hover:from-emerald-500 hover:to-teal-600 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span className="bg-emerald-800/60 px-2 py-0.5 rounded-lg text-[11px] tabular-nums">
                    ₹{cart.total_amount}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
