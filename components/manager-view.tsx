"use client";

import { useMemo, useState, type FormEvent } from "react";
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
    description:
      "Flaky all-butter French croissants baked this morning, filled with Belgian dark chocolate ganache.",
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
    description:
      "Spiced cinnamon rolls with cream cheese icing drizzle, packaged fresh for evening pickup.",
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

const categories = ["Bakery", "Meals", "Cafe", "Dessert", "Vegan"] as const;

type Category = (typeof categories)[number];

export function ManagerView() {
  const [listings, setListings] = useState<FoodListing[]>(INITIAL_MANAGER_LISTINGS);
  const [queue, setQueue] = useState<PickupQueueItem[]>(INITIAL_QUEUE);
  const [codeInput, setCodeInput] = useState("");
  const [verifyMessage, setVerifyMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<"ALL" | "READY_FOR_PICKUP" | "COMPLETED">("ALL");

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("Bakery");
  const [newQuantity, setNewQuantity] = useState("10");
  const [newOriginalPrice, setNewOriginalPrice] = useState("350");
  const [newDiscountedPrice, setNewDiscountedPrice] = useState("140");
  const [newPickupStart, setNewPickupStart] = useState("8:00 PM");
  const [newPickupEnd, setNewPickupEnd] = useState("9:30 PM");
  const [newDescription, setNewDescription] = useState("");

  const pendingPickupsCount = queue.filter((item) => item.status === "READY_FOR_PICKUP").length;
  const completedPickupsCount = queue.filter((item) => item.status === "COMPLETED").length;
  const activeListingsCount = listings.filter((item) => item.status === "ACTIVE").length;
  const totalRescuedToday = 14;
  const todayRevenue = 2180;

  const visibleQueue = useMemo(
    () => queue.filter((item) => queueFilter === "ALL" || item.status === queueFilter),
    [queue, queueFilter],
  );

  function showVerificationMessage(message: { text: string; success: boolean }) {
    setVerifyMessage(message);
    window.setTimeout(() => setVerifyMessage(null), 5000);
  }

  function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = codeInput.trim().toUpperCase();
    if (!trimmed) return;

    const foundItem = queue.find(
      (item) => item.pickup_code.toUpperCase() === trimmed && item.status === "READY_FOR_PICKUP",
    );

    if (!foundItem) {
      showVerificationMessage({
        text: `No pending pickup was found for “${trimmed}”. Check the code and try again.`,
        success: false,
      });
      return;
    }

    setQueue((previous) =>
      previous.map((item) =>
        item.order_id === foundItem.order_id ? { ...item, status: "COMPLETED" } : item,
      ),
    );
    setCodeInput("");
    showVerificationMessage({
      text: `Pickup verified for ${foundItem.customer_name}. The order is marked as handed over.`,
      success: true,
    });
  }

  function handleCompletePickup(orderId: string) {
    const selected = queue.find((item) => item.order_id === orderId);
    if (!selected || selected.status !== "READY_FOR_PICKUP") return;

    setQueue((previous) =>
      previous.map((item) =>
        item.order_id === orderId ? { ...item, status: "COMPLETED" } : item,
      ),
    );
  }

  function resetListingForm() {
    setNewTitle("");
    setNewCategory("Bakery");
    setNewQuantity("10");
    setNewOriginalPrice("350");
    setNewDiscountedPrice("140");
    setNewPickupStart("8:00 PM");
    setNewPickupEnd("9:30 PM");
    setNewDescription("");
    setListingError(null);
  }

  function handleCreateListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setListingError(null);

    const quantity = Number(newQuantity);
    const originalPrice = Number(newOriginalPrice);
    const discountedPrice = Number(newDiscountedPrice);

    if (!newTitle.trim()) {
      setListingError("Add a name for this surplus batch.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setListingError("Quantity must be a whole number greater than zero.");
      return;
    }
    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      setListingError("Enter a valid original price.");
      return;
    }
    if (!Number.isFinite(discountedPrice) || discountedPrice <= 0 || discountedPrice > originalPrice) {
      setListingError("Surplus price must be positive and no higher than the original price.");
      return;
    }

    const created: FoodListing = {
      id: `fl-${Date.now().toString().slice(-6)}`,
      restaurant_id: "rest-001",
      restaurant_name: "Test Cafe & Artisan Bakery",
      restaurant_address: "124 100ft Road, Indiranagar, Bengaluru",
      distance_km: 0.4,
      title: newTitle.trim(),
      description:
        newDescription.trim() || "Fresh surplus batch prepared by our kitchen staff today.",
      category: newCategory,
      quantity,
      available_quantity: quantity,
      original_price: originalPrice,
      discounted_price: discountedPrice,
      pickup_start: newPickupStart.trim(),
      pickup_end: newPickupEnd.trim(),
      status: "ACTIVE",
      dietary_tags: ["Fresh Batch", "Packaged for Pickup"],
    };

    setListings((previous) => [created, ...previous]);
    setIsNewListingOpen(false);
    resetListingForm();
  }

  return (
    <main className="min-h-screen bg-[#FBFAF4] px-4 py-7 text-[#1B2B21] sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Page heading — navigation is intentionally handled by the parent layout. */}
        <header className="flex flex-col gap-5 border-b border-[#E6E8DF] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D8E8D9] bg-[#EDF5EC] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#285D3B]">
                <IconChefHat size={14} /> The Artisan Oven & Cafe
              </span>
              <span className="text-xs font-medium text-[#788279]">Indiranagar Branch</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#568064]">Kitchen operations</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#193B28] sm:text-4xl">
              Inventory & pickups<span className="text-[#D99A3D]">.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B756D]">
              Keep surplus batches moving and make every customer pickup smooth.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNewListingOpen(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1D4A30] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,74,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#173C27] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1D4A30]/20"
          >
            <IconPlus size={17} /> Create surplus batch
          </button>
        </header>

        {/* Operational metrics */}
        <section aria-label="Today's performance" className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Pending pickups" value={String(pendingPickupsCount)} detail="Ready for collection" tone="amber" marker="01" />
          <MetricCard label="Active batches" value={String(activeListingsCount)} detail={`${listings.length} total listings`} tone="green" marker="02" />
          <MetricCard label="Units rescued today" value={String(totalRescuedToday)} detail="Food kept in circulation" tone="green" marker="03" />
          <MetricCard label="Today's revenue" value={`₹${todayRevenue.toLocaleString("en-IN")}`} detail="From surplus orders" tone="cream" marker="04" />
        </section>

        {/* Pickup verification panel */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#D6E5D7] bg-[#EAF3E9] shadow-[0_12px_35px_rgba(34,75,47,0.06)]">
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#39704A]">
                <span className="size-1.5 rounded-full bg-[#3D9558]" /> Counter desk
              </div>
              <h2 className="mt-3 text-xl font-black tracking-tight text-[#193B28] sm:text-2xl">Verify a customer pickup</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#607365]">
                Ask the customer for the code in their order confirmation, verify it, then hand over the packed order.
              </p>
            </div>
            <form onSubmit={handleVerifyCode} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label htmlFor="pickup-code" className="sr-only">Pickup code</label>
              <input
                id="pickup-code"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                placeholder="ECO-4829"
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                className="min-h-12 w-full rounded-2xl border border-[#CADCCB] bg-white px-4 font-mono text-sm font-bold tracking-[0.12em] text-[#193B28] outline-none placeholder:font-medium placeholder:tracking-wider placeholder:text-[#A0AAA1] focus:border-[#2F7446] focus:ring-4 focus:ring-[#2F7446]/10 sm:w-44"
              />
              <button
                type="submit"
                disabled={!codeInput.trim()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1D4A30] px-5 text-sm font-bold text-white transition hover:bg-[#173C27] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <IconCheckCircle size={16} /> Verify code
              </button>
            </form>
          </div>
          {verifyMessage && (
            <div
              role="status"
              className={`mx-5 mb-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium sm:mx-7 sm:mb-7 ${
                verifyMessage.success
                  ? "border-[#C9E2CE] bg-white text-[#28633B]"
                  : "border-[#F0D1C8] bg-[#FFF3EF] text-[#A34332]"
              }`}
            >
              {verifyMessage.success ? <IconCheckCircle size={17} /> : <IconAlertCircle size={17} />}
              <span>{verifyMessage.text}</span>
            </div>
          )}
        </section>

        {/* Work areas */}
        <div className="mt-7 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section id="pickups" className="rounded-[28px] border border-[#E6E8DF] bg-white p-5 shadow-[0_8px_28px_rgba(34,49,37,0.035)] sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[#EEF0E9] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B8B72]">Collection desk</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-[#193B28]">Today&apos;s pickup queue</h2>
                <p className="mt-1 text-xs text-[#788279]">Orders waiting to be collected or already handed over.</p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-[#F2F5EE] px-3 py-1.5 text-xs font-bold text-[#526B56]">
                {queue.length} orders · {pendingPickupsCount} pending
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter pickup orders">
              {([
                ["ALL", "All orders"],
                ["READY_FOR_PICKUP", "Awaiting pickup"],
                ["COMPLETED", "Handed over"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQueueFilter(value)}
                  aria-pressed={queueFilter === value}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                    queueFilter === value
                      ? "bg-[#1D4A30] text-white shadow-sm"
                      : "border border-[#E5E9E1] bg-white text-[#667268] hover:border-[#BDD2BF] hover:text-[#285D3B]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {visibleQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DDE5DA] bg-[#FBFCF8] px-5 py-10 text-center">
                  <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#EEF5EC] text-[#4A8056]">✓</div>
                  <p className="mt-3 text-sm font-bold text-[#2B4933]">No orders in this view</p>
                  <p className="mt-1 text-xs text-[#859087]">Try another filter or check back when a customer places an order.</p>
                </div>
              ) : (
                visibleQueue.map((item) => (
                  <article
                    key={item.order_id}
                    className={`rounded-2xl border p-4 transition ${
                      item.status === "COMPLETED"
                        ? "border-[#E8ECE5] bg-[#F8FAF6]"
                        : "border-[#DCE8DC] bg-white hover:border-[#BBD3BE] hover:shadow-[0_8px_24px_rgba(34,75,47,0.06)]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-[#EDF5EC] px-2.5 py-1 font-mono text-xs font-extrabold tracking-wider text-[#285D3B]">{item.pickup_code}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.status === "COMPLETED" ? "bg-[#EEF0EC] text-[#69756A]" : "bg-[#FFF3D9] text-[#93651E]"}`}>
                            {item.status === "COMPLETED" ? "Handed over" : "Awaiting pickup"}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-extrabold text-[#263A2B]">{item.customer_name}</h3>
                        <p className="mt-1 text-xs leading-5 text-[#727D73]">{item.items_summary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#7D887E]">
                          <span>{item.pickup_window}</span>
                          <span className="font-bold text-[#344C38]">₹{item.total_amount.toLocaleString("en-IN")} paid</span>
                        </div>
                      </div>
                      {item.status === "READY_FOR_PICKUP" ? (
                        <button
                          type="button"
                          onClick={() => handleCompletePickup(item.order_id)}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#C9DCCB] bg-[#F0F6EF] px-4 text-xs font-extrabold text-[#2C6840] transition hover:bg-[#E5F0E4]"
                        >
                          Mark handed over
                        </button>
                      ) : (
                        <span className="inline-flex min-h-9 shrink-0 items-center gap-1.5 text-xs font-bold text-[#6E846F]">
                          <IconCheckCircle size={15} /> Completed
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
            {completedPickupsCount > 0 && (
              <p className="mt-4 text-[11px] text-[#879087]">{completedPickupsCount} pickup{completedPickupsCount === 1 ? "" : "s"} completed today.</p>
            )}
          </section>

          <section id="listings" className="rounded-[28px] border border-[#E6E8DF] bg-white p-5 shadow-[0_8px_28px_rgba(34,49,37,0.035)] sm:p-6">
            <div className="flex items-end justify-between gap-3 border-b border-[#EEF0E9] pb-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B8B72]">Surplus inventory</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-[#193B28]">Your active batches</h2>
                <p className="mt-1 text-xs text-[#788279]">Track remaining units and pickup windows.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewListingOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#EAF3E9] px-3.5 py-2 text-xs font-extrabold text-[#2D6A40] transition hover:bg-[#DDECDD]"
              >
                <IconPlus size={14} /> New batch
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {listings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DDE5DA] bg-[#FBFCF8] px-5 py-10 text-center">
                  <p className="text-sm font-bold text-[#2B4933]">No batches yet</p>
                  <p className="mt-1 text-xs text-[#859087]">Create your first surplus listing to make it available to customers.</p>
                </div>
              ) : (
                listings.map((listing) => {
                  const soldUnits = Math.max(0, listing.quantity - listing.available_quantity);
                  const soldPercent = listing.quantity > 0 ? Math.min(100, (soldUnits / listing.quantity) * 100) : 0;
                  const discount = listing.original_price > 0
                    ? Math.round((1 - listing.discounted_price / listing.original_price) * 100)
                    : 0;

                  return (
                    <article key={listing.id} className="rounded-2xl border border-[#E7EBE4] bg-[#FCFDF9] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-flex rounded-full bg-[#EEF4EA] px-2.5 py-1 text-[10px] font-bold text-[#5E765D]">{listing.category}</span>
                          <h3 className="mt-2 text-sm font-extrabold leading-5 text-[#263A2B]">{listing.title}</h3>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#7B857B]">{listing.description}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${listing.available_quantity <= 2 ? "bg-[#FFF1DC] text-[#9A6721]" : "bg-[#E9F4E9] text-[#347047]"}`}>
                          {listing.available_quantity === 0 ? "Sold out" : `${listing.available_quantity} left`}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-[#7B867B]">
                          <span>{soldUnits} of {listing.quantity} units claimed</span>
                          <span>{Math.round(soldPercent)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#E9EDE6]">
                          <div className="h-full rounded-full bg-[#4D8A59] transition-all" style={{ width: `${soldPercent}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#EDF0E9] pt-3">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black tabular-nums text-[#1D4A30]">₹{listing.discounted_price}</span>
                            <span className="text-xs text-[#9AA39A] line-through">₹{listing.original_price}</span>
                            {discount > 0 && <span className="rounded-full bg-[#F9EEDC] px-2 py-0.5 text-[9px] font-extrabold text-[#946B2D]">{discount}% off</span>}
                          </div>
                          <p className="mt-1 text-[10px] text-[#879087]">Pickup {listing.pickup_start} – {listing.pickup_end}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#718073]">{listing.status.replaceAll("_", " ")}</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Create listing modal */}
      {isNewListingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102719]/55 p-3 backdrop-blur-sm sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsNewListingOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-listing-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[#E3E9DE] bg-[#FBFAF4] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E6EAE1] pb-5">
              <div>
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#E8F1E6] text-[#2D6A40]"><IconChefHat size={19} /></span>
                <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B8B72]">New surplus listing</p>
                <h2 id="new-listing-title" className="mt-1 text-xl font-black tracking-tight text-[#193B28]">Create a batch</h2>
                <p className="mt-1 text-xs leading-5 text-[#788279]">Share the details customers need to discover and pick up this food.</p>
              </div>
              <button
                type="button"
                onClick={() => { setIsNewListingOpen(false); setListingError(null); }}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[#E3E8DF] bg-white text-[#69766B] transition hover:bg-[#F0F3EC] hover:text-[#233C2A]"
                aria-label="Close create listing dialog"
              >
                <IconX size={17} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="mt-5 space-y-4">
              <div>
                <label htmlFor="listing-title" className="mb-1.5 block text-xs font-bold text-[#405746]">Food item title <span className="text-[#B76E42]">*</span></label>
                <input id="listing-title" type="text" required maxLength={150} placeholder="e.g. Sourdough loaf and baguette pack" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none transition placeholder:text-[#A3ACA3] focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="listing-category" className="mb-1.5 block text-xs font-bold text-[#405746]">Category</label>
                  <select id="listing-category" value={newCategory} onChange={(event) => setNewCategory(event.target.value as Category)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10">
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="listing-quantity" className="mb-1.5 block text-xs font-bold text-[#405746]">Available units</label>
                  <input id="listing-quantity" type="number" min="1" step="1" required value={newQuantity} onChange={(event) => setNewQuantity(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="listing-original-price" className="mb-1.5 block text-xs font-bold text-[#405746]">Original price (₹)</label>
                  <input id="listing-original-price" type="number" min="0.01" step="0.01" required value={newOriginalPrice} onChange={(event) => setNewOriginalPrice(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
                <div>
                  <label htmlFor="listing-discounted-price" className="mb-1.5 block text-xs font-bold text-[#405746]">Surplus price (₹)</label>
                  <input id="listing-discounted-price" type="number" min="0.01" step="0.01" required value={newDiscountedPrice} onChange={(event) => setNewDiscountedPrice(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5EBDD] bg-white/70 p-4">
                <p className="mb-3 text-xs font-extrabold text-[#405746]">Customer pickup window</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pickup-start" className="mb-1.5 block text-[11px] font-semibold text-[#748075]">Starts at</label>
                    <input id="pickup-start" type="text" required placeholder="8:00 PM" value={newPickupStart} onChange={(event) => setNewPickupStart(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                  </div>
                  <div>
                    <label htmlFor="pickup-end" className="mb-1.5 block text-[11px] font-semibold text-[#748075]">Ends at</label>
                    <input id="pickup-end" type="text" required placeholder="9:30 PM" value={newPickupEnd} onChange={(event) => setNewPickupEnd(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="listing-description" className="mb-1.5 block text-xs font-bold text-[#405746]">Description <span className="font-medium text-[#8A958A]">(optional)</span></label>
                <textarea id="listing-description" rows={3} maxLength={500} placeholder="Describe the batch, freshness, ingredients or allergens..." value={newDescription} onChange={(event) => setNewDescription(event.target.value)} className="w-full resize-y rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none placeholder:text-[#A3ACA3] focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
              </div>

              {listingError && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#F0D1C8] bg-[#FFF3EF] px-3.5 py-3 text-xs font-medium text-[#A34332]">
                  <IconAlertCircle size={16} className="shrink-0" /> {listingError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[#E6EAE1] pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setIsNewListingOpen(false); setListingError(null); }} className="min-h-11 rounded-full border border-[#D8E1D6] bg-white px-5 text-sm font-bold text-[#5C6B5E] transition hover:bg-[#F4F6F0]">Cancel</button>
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1D4A30] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,74,48,0.16)] transition hover:bg-[#173C27]">
                  <IconPlus size={16} /> Publish batch
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
  marker,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "green" | "amber" | "cream";
  marker: string;
}) {
  const toneStyles = {
    green: "bg-[#EDF5EC] text-[#2E7143]",
    amber: "bg-[#FBF2E3] text-[#9A702D]",
    cream: "bg-[#F4F1E7] text-[#746743]",
  };

  return (
    <article className="rounded-[22px] border border-[#E6E8DF] bg-white p-4 shadow-[0_6px_20px_rgba(34,49,37,0.03)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#7D897E]">{label}</p>
        <span className={`rounded-lg px-2 py-1 text-[9px] font-black tracking-wider ${toneStyles[tone]}`}>{marker}</span>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-[#193B28] sm:text-3xl">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-[#8A948A]">{detail}</p>
    </article>
  );
}
