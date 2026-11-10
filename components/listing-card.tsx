"use client";

import { IconClock, IconMapPin, IconPlus, IconMinus } from "@/components/icons";
import type { FoodListing } from "@/lib/types/marketplace";

interface ListingCardProps {
  listing: FoodListing;
  cartQuantity: number;
  onAddToCart: (listing: FoodListing) => void;
  onUpdateQuantity: (listingId: string, quantity: number) => void;
  disabled?: boolean;
}

export function ListingCard({
  listing,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  disabled = false,
}: ListingCardProps) {
  const discountPercent = Math.round(
    ((listing.original_price - listing.discounted_price) / listing.original_price) * 100
  );

  const isSoldOut = listing.available_quantity <= 0;
  const isLowStock = listing.available_quantity > 0 && listing.available_quantity <= 3;

  return (
    <article className="eco-panel eco-panel-interactive flex flex-col justify-between overflow-hidden bg-white">
      <div>
        {/* Card Header & Scenery */}
        <div className="relative p-5 pb-3 border-b border-[var(--color-border)] bg-[var(--eco-canvas-100)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="eco-badge eco-badge-neutral font-semibold">
              {listing.category}
            </span>
            <span className="eco-badge eco-badge-warning font-bold">
              {discountPercent}% OFF
            </span>
          </div>

          <h3 className="font-bold text-lg text-[var(--color-foreground)] leading-snug tracking-tight">
            {listing.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--eco-ink-700)]">
            <IconMapPin size={14} className="text-[var(--color-primary)] shrink-0" />
            <span className="font-semibold text-[var(--color-foreground)] truncate">
              {listing.restaurant_name}
            </span>
            <span className="text-[var(--eco-ink-500)]">• {listing.distance_km} km</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--eco-ink-700)] line-clamp-2 leading-relaxed">
            {listing.description}
          </p>

          {/* Pickup Window */}
          <div className="flex items-center justify-between rounded-lg bg-[var(--eco-canvas-50)] p-2.5 text-xs border border-[var(--eco-line-200)]">
            <div className="flex items-center gap-1.5 text-[var(--eco-ink-700)]">
              <IconClock size={15} className="text-[var(--color-primary)] shrink-0" />
              <span>Pickup Window:</span>
            </div>
            <span className="font-bold text-[var(--color-foreground)] tabular-nums">
              {listing.pickup_start} – {listing.pickup_end}
            </span>
          </div>

          {/* Inventory scarcity indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--eco-ink-500)]">Available surplus:</span>
              <span
                className={`font-semibold tabular-nums ${
                  isLowStock ? "text-[var(--eco-amber-700)]" : "text-[var(--color-foreground)]"
                }`}
              >
                {isSoldOut ? "Sold out" : `${listing.available_quantity} units left`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--eco-canvas-200)]">
              <div
                className={`h-full transition-all duration-300 ${
                  isLowStock ? "bg-[var(--eco-amber-600)]" : "bg-[var(--color-primary)]"
                }`}
                style={{
                  width: `${Math.min(100, (listing.available_quantity / listing.quantity) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Dietary tags */}
          {listing.dietary_tags && listing.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {listing.dietary_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--eco-canvas-100)] px-2 py-0.5 text-[11px] font-medium text-[var(--eco-ink-700)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Pricing and Cart action */}
      <div className="p-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-3 bg-[var(--eco-canvas-50)]/50">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[var(--color-foreground)] tabular-nums tracking-tight">
              ₹{listing.discounted_price}
            </span>
            <span className="text-xs text-[var(--eco-ink-500)] line-through tabular-nums">
              ₹{listing.original_price}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[var(--color-primary)]">
            Save ₹{listing.original_price - listing.discounted_price}
          </span>
        </div>

        {/* Action Button */}
        {isSoldOut ? (
          <button
            type="button"
            disabled
            className="eco-button eco-button-secondary text-xs opacity-60 cursor-not-allowed"
          >
            Sold Out
          </button>
        ) : cartQuantity > 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(listing.id, cartQuantity - 1)}
              className="flex size-7 items-center justify-center rounded-md text-[var(--eco-ink-700)] hover:bg-[var(--eco-canvas-100)] transition"
              aria-label={`Decrease quantity of ${listing.title}`}
            >
              <IconMinus size={14} />
            </button>
            <span className="min-w-6 text-center text-sm font-bold tabular-nums text-[var(--color-foreground)]">
              {cartQuantity}
            </span>
            <button
              type="button"
              disabled={cartQuantity >= listing.available_quantity}
              onClick={() => onUpdateQuantity(listing.id, cartQuantity + 1)}
              className="flex size-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={`Increase quantity of ${listing.title}`}
            >
              <IconPlus size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(listing)}
            disabled={disabled}
            className="eco-button eco-button-primary text-xs px-3.5 py-2 font-semibold"
          >
            <IconPlus size={15} />
            Reserve
          </button>
        )}
      </div>
    </article>
  );
}
