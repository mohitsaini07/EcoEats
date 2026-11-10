"use client";

import { useState } from "react";
import {
  IconChefHat,
  IconPlus,
  IconCheckCircle,
  IconAlertCircle,
  IconX,
} from "@/components/icons";
import type { FoodListing } from "@/lib/types/marketplace";

type PickupQueueItem = {
  order_id: string;
  customer_name: string;
  pickup_code: string;
  items_summary: string;
  total_amount: number;
  pickup_window: string;
  status: "READY_FOR_PICKUP" | "COMPLETED";
};

const INITIAL_QUEUE: PickupQueueItem[] = [
  {
    order_id: "ord-882194",
    customer_name: "Aarav Sharma",
    pickup_code: "ECO-4829",
    items_summary: "Artisan Chocolate Croissant Box (Set of 3) × 2",
    total_amount: 298,
    pickup_window: "8:00 PM – 9:30 PM",
    status: "READY_FOR_PICKUP",
  },
  {
    order_id: "ord-882201",
    customer_name: "Priya Nair",
    pickup_code: "ECO-9124",
    items_summary: "Country Sourdough Loaf + Brioche Roll × 1",
    total_amount: 160,
    pickup_window: "8:00 PM – 9:30 PM",
    status: "READY_FOR_PICKUP",
  },
];

const INITIAL_MANAGER_LISTINGS: FoodListing[] = [
  {
    id: "fl-001",
    restaurant_id: "rest-001",
    restaurant_name: "Test Cafe & Artisan Bakery",
    restaurant_address: "124 100ft Road, Indiranagar, Bengaluru",
    distance_km: 0.4,
    title: "Artisan Chocolate Croissant Box (Set of 3)",
    description: "Flaky all-butter French croissants baked this morning, filled with Belgian dark chocolate ganache.",
    category: "Bakery",
    quantity: 10,
    available_quantity: 7,
    original_price: 380,
    discounted_price: 149,
    pickup_start: "8:00 PM",
    pickup_end: "9:30 PM",
    status: "ACTIVE",
    dietary_tags: ["Vegetarian", "Baked Today"],
  },
  {
    id: "fl-003",
    restaurant_id: "rest-001",
    restaurant_name: "Test Cafe & Artisan Bakery",
    restaurant_address: "124 100ft Road, Indiranagar, Bengaluru",
    distance_km: 0.4,
    title: "Cinnamon Brioche Spirals (Set of 2)",
    description: "Spiced cinnamon rolls with cream cheese icing drizzle, packaged fresh for evening pickup.",
    category: "Bakery",
    quantity: 8,
    available_quantity: 2,
    original_price: 260,
    discounted_price: 110,
    pickup_start: "8:00 PM",
    pickup_end: "9:30 PM",
    status: "ACTIVE",
    dietary_tags: ["Vegetarian"],
  },
];

export function ManagerView() {
  const [listings, setListings] = useState<FoodListing[]>(INITIAL_MANAGER_LISTINGS);
  const [queue, setQueue] = useState<PickupQueueItem[]>(INITIAL_QUEUE);
  const [codeInput, setCodeInput] = useState("");
  const [verifyMessage, setVerifyMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);

  // New listing form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Bakery" | "Meals" | "Cafe" | "Dessert" | "Vegan">("Bakery");
  const [newQuantity, setNewQuantity] = useState("10");
  const [newOriginalPrice, setNewOriginalPrice] = useState("350");
  const [newDiscountedPrice, setNewDiscountedPrice] = useState("140");
  const [newPickupStart, setNewPickupStart] = useState("8:00 PM");
  const [newPickupEnd, setNewPickupEnd] = useState("9:30 PM");
  const [newDescription, setNewDescription] = useState("");

  const pendingPickupsCount = queue.filter((q) => q.status === "READY_FOR_PICKUP").length;
  const totalRescuedToday = 14;
  const todayRevenue = 2180;

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = codeInput.trim().toUpperCase();
    if (!trimmed) return;

    const foundItem = queue.find(
      (item) => item.pickup_code.toUpperCase() === trimmed && item.status === "READY_FOR_PICKUP"
    );

    if (foundItem) {
      setQueue((prev) =>
        prev.map((item) =>
          item.order_id === foundItem.order_id ? { ...item, status: "COMPLETED" } : item
        )
      );
      setVerifyMessage({
        text: `Success! Code ${trimmed} confirmed for ${foundItem.customer_name}. Order marked completed.`,
        success: true,
      });
      setCodeInput("");
    } else {
      setVerifyMessage({
        text: `Invalid or already fulfilled pickup code "${trimmed}". Please check the customer's app screen.`,
        success: false,
      });
    }

    setTimeout(() => setVerifyMessage(null), 5000);
  }

  function handleCompletePickup(orderId: string) {
    setQueue((prev) =>
      prev.map((item) =>
        item.order_id === orderId ? { ...item, status: "COMPLETED" } : item
      )
    );
  }

  function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: FoodListing = {
      id: `fl-${Date.now().toString().slice(-4)}`,
      restaurant_id: "rest-001",
      restaurant_name: "Test Cafe & Artisan Bakery",
      restaurant_address: "124 100ft Road, Indiranagar, Bengaluru",
      distance_km: 0.4,
      title: newTitle.trim(),
      description: newDescription.trim() || "Fresh surplus batch prepared by our kitchen staff today.",
      category: newCategory,
      quantity: Number(newQuantity) || 5,
      available_quantity: Number(newQuantity) || 5,
      original_price: Number(newOriginalPrice) || 200,
      discounted_price: Number(newDiscountedPrice) || 99,
      pickup_start: newPickupStart,
      pickup_end: newPickupEnd,
      status: "ACTIVE",
      dietary_tags: ["Fresh Batch", "Packaged for Pickup"],
    };

    setListings([created, ...listings]);
    setIsNewListingOpen(false);

    // Reset fields
    setNewTitle("");
    setNewDescription("");
  }

  return (
    <main className="eco-container py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="eco-badge eco-badge-neutral">
              <IconChefHat size={14} className="text-[var(--color-primary)]" />
              The Artisan Oven & Cafe
            </span>
            <span className="text-xs text-[var(--eco-ink-500)]">Indiranagar Branch</span>
          </div>
          <h1 className="eco-title mt-2 text-3xl sm:text-4xl">Kitchen Manager Hub</h1>
          <p className="eco-copy mt-2 text-sm sm:text-base">
            List today&apos;s unsold surplus batches, manage pickup queues, and verify customer pickup codes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewListingOpen(true)}
          className="eco-button eco-button-primary text-xs self-start sm:self-auto cursor-pointer"
        >
          <IconPlus size={16} />
          Create Surplus Batch
        </button>
      </div>

      {/* Metrics Row */}
      <section className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <article className="eco-panel eco-stat bg-white">
          <div className="eco-stat-label">
            <span>Pending Pickups</span>
            <span className="size-2 rounded-full bg-[var(--eco-amber-500)] animate-pulse" />
          </div>
          <p className="eco-stat-value text-[var(--eco-amber-700)]">{pendingPickupsCount}</p>
        </article>

        <article className="eco-panel eco-stat bg-white">
          <div className="eco-stat-label">Active Surplus Batches</div>
          <p className="eco-stat-value">{listings.length}</p>
        </article>

        <article className="eco-panel eco-stat bg-white">
          <div className="eco-stat-label">Units Rescued Today</div>
          <p className="eco-stat-value text-[var(--color-primary)]">{totalRescuedToday}</p>
        </article>

        <article className="eco-panel eco-stat bg-white">
          <div className="eco-stat-label">Rescued Revenue</div>
          <p className="eco-stat-value">₹{todayRevenue}</p>
        </article>
      </section>

      {/* Quick Counter Pickup Code Validator Bar */}
      <section className="mt-8 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--eco-leaf-50)] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
              <IconCheckCircle size={18} className="text-[var(--color-primary)]" />
              Counter Pickup Code Verification
            </h2>
            <p className="text-xs text-[var(--eco-ink-700)] mt-0.5">
              Ask the customer to show their 4-digit code (e.g. ECO-4829) to verify and hand over the meal.
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="flex gap-2 min-w-[280px]">
            <input
              type="text"
              placeholder="e.g. ECO-4829"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="eco-field font-mono font-bold tracking-wider text-sm uppercase bg-white max-w-[180px]"
            />
            <button
              type="submit"
              className="eco-button eco-button-primary text-xs px-4 font-bold whitespace-nowrap cursor-pointer"
            >
              Verify Code
            </button>
          </form>
        </div>

        {verifyMessage && (
          <div
            className={`mt-4 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 ${
              verifyMessage.success
                ? "bg-white text-[var(--color-primary)] border border-[var(--color-primary)]"
                : "bg-[var(--eco-rose-50)] text-[var(--color-danger)] border border-[var(--eco-rose-100)]"
            }`}
          >
            {verifyMessage.success ? <IconCheckCircle size={16} /> : <IconAlertCircle size={16} />}
            <span>{verifyMessage.text}</span>
          </div>
        )}
      </section>

      {/* Two Column Section: Live Pickup Queue & Active Food Batches */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Live Pickup Queue */}
        <section id="pickups" className="eco-panel p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div>
              <h2 className="font-bold text-lg text-[var(--color-foreground)]">
                Today&apos;s Pickup Orders
              </h2>
              <p className="text-xs text-[var(--eco-ink-500)]">
                Orders placed by local customers waiting for collection
              </p>
            </div>
            <span className="eco-badge eco-badge-neutral text-xs">
              {queue.length} Total Orders
            </span>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.order_id}
                className={`rounded-xl border p-4 transition ${
                  item.status === "COMPLETED"
                    ? "bg-[var(--eco-canvas-100)] border-[var(--eco-line-200)] opacity-75"
                    : "bg-white border-[var(--color-border)] shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--eco-leaf-50)] text-[var(--color-primary)] border border-[var(--eco-leaf-100)]">
                        {item.pickup_code}
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-foreground)]">
                        {item.customer_name}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--eco-ink-700)] mt-1">
                      {item.items_summary}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--eco-ink-500)]">
                      <span>Window: {item.pickup_window}</span>
                      <span>•</span>
                      <span className="font-bold text-[var(--color-foreground)] tabular-nums">
                        ₹{item.total_amount} (Paid)
                      </span>
                    </div>
                  </div>

                  <div>
                    {item.status === "COMPLETED" ? (
                      <span className="eco-badge eco-badge-neutral text-[11px]">
                        ✓ Handed Over
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCompletePickup(item.order_id)}
                        className="eco-button eco-button-primary text-xs px-3 py-1.5 cursor-pointer"
                      >
                        Hand Over
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Active Food Batches */}
        <section id="listings" className="eco-panel p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div>
              <h2 className="font-bold text-lg text-[var(--color-foreground)]">
                Active Surplus Batches
              </h2>
              <p className="text-xs text-[var(--eco-ink-500)]">
                Inventory currently listed on the customer marketplace
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewListingOpen(true)}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              + New Batch
            </button>
          </div>

          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-xl border border-[var(--color-border)] p-4 bg-[var(--eco-canvas-50)] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="eco-badge eco-badge-neutral text-[10px] mb-1">
                      {listing.category}
                    </span>
                    <h3 className="font-bold text-sm text-[var(--color-foreground)]">
                      {listing.title}
                    </h3>
                  </div>
                  <span className="eco-badge eco-badge-success text-xs font-mono">
                    {listing.available_quantity}/{listing.quantity} left
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--eco-line-200)] text-xs">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-[var(--color-foreground)] tabular-nums">
                      ₹{listing.discounted_price}
                    </span>
                    <span className="text-[var(--eco-ink-500)] line-through tabular-nums text-[11px]">
                      ₹{listing.original_price}
                    </span>
                  </div>
                  <span className="text-[var(--eco-ink-500)] text-[11px]">
                    Pickup: {listing.pickup_start} – {listing.pickup_end}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* New Listing Batch Modal */}
      {isNewListingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                  <IconChefHat size={18} />
                </span>
                <h3 className="text-base font-bold text-[var(--color-foreground)]">
                  Create New Surplus Batch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewListingOpen(false)}
                className="rounded-lg p-1 text-[var(--color-muted)] hover:bg-[var(--eco-canvas-100)] transition"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                  Food Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Loaf & Baguette Surprise Pack"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="eco-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as "Bakery" | "Meals" | "Cafe" | "Dessert" | "Vegan")}
                    className="eco-field text-sm"
                  >
                    <option value="Bakery">Bakery</option>
                    <option value="Meals">Meals</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                    Quantity (Batch Units) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="eco-field text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                    Original Dine-in Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="eco-field text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                    Surplus Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newDiscountedPrice}
                    onChange={(e) => setNewDiscountedPrice(e.target.value)}
                    className="eco-field text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                    Pickup Window Start *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8:00 PM"
                    value={newPickupStart}
                    onChange={(e) => setNewPickupStart(e.target.value)}
                    className="eco-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                    Pickup Window End *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9:30 PM"
                    value={newPickupEnd}
                    onChange={(e) => setNewPickupEnd(e.target.value)}
                    className="eco-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--eco-ink-700)] mb-1">
                  Description & Dietary Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the batch, freshness, ingredients, or allergens..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="eco-field p-3 text-sm h-auto"
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewListingOpen(false)}
                  className="eco-button eco-button-secondary text-xs flex-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="eco-button eco-button-primary text-xs flex-2 font-bold cursor-pointer"
                >
                  Publish Surplus Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
