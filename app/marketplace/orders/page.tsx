"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconCheckCircle,
  IconClock,
  IconMapPin,
  IconLeaf,
  IconShoppingBag,
} from "@/components/icons";

type MockOrder = {
  id: string;
  restaurant_name: string;
  restaurant_address: string;
  pickup_code: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  total_amount: number;
  pickup_window: string;
  created_at: string;
  co2_saved_kg: number;
  items: { title: string; quantity: number; unit_price: number }[];
};

const SAMPLE_ORDERS: MockOrder[] = [
  {
    id: "ord-882194",
    restaurant_name: "Test Cafe & Artisan Bakery",
    restaurant_address: "124 100ft Road, Indiranagar, Bengaluru",
    pickup_code: "ECO-4829",
    status: "CONFIRMED",
    total_amount: 298,
    pickup_window: "Today, 8:00 PM – 9:30 PM",
    created_at: "Just now",
    co2_saved_kg: 1.4,
    items: [
      {
        title: "Artisan Chocolate Croissant Box (Set of 3)",
        quantity: 2,
        unit_price: 149,
      },
    ],
  },
  {
    id: "ord-741203",
    restaurant_name: "Crust & Crumb Sourdough Co.",
    restaurant_address: "18 5th Cross, Koramangala 4th Block, Bengaluru",
    pickup_code: "ECO-1092",
    status: "COMPLETED",
    total_amount: 160,
    pickup_window: "Yesterday, 7:45 PM – 9:00 PM",
    created_at: "Yesterday",
    co2_saved_kg: 2.1,
    items: [
      {
        title: "Country Sourdough Loaf + Cinnamon Brioche Roll",
        quantity: 1,
        unit_price: 160,
      },
    ],
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getOrderItemCount(order: MockOrder) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);

  const activeOrders = useMemo(
    () => SAMPLE_ORDERS.filter((order) => order.status === "CONFIRMED"),
    [],
  );
  const pastOrders = useMemo(
    () => SAMPLE_ORDERS.filter((order) => order.status !== "CONFIRMED"),
    [],
  );

  const totalSpent = SAMPLE_ORDERS.reduce(
    (total, order) => total + order.total_amount,
    0,
  );
  const totalImpact = SAMPLE_ORDERS.reduce(
    (total, order) => total + order.co2_saved_kg,
    0,
  );

  async function copyCode(code: string) {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2200);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#FBFAF4] px-4 py-7 text-[#17251D] sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Page heading */}
        <section className="flex flex-col gap-5 border-b border-[#E5E8DE] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D6E9D9] bg-[#EAF5EA] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#286A41]">
              <IconLeaf size={13} /> Your EcoEats journey
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#17251D] sm:text-4xl lg:text-5xl">
              Your food, <span className="text-[#37814F]">ready to rescue.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#70796F] sm:text-base">
              Keep an eye on your pickups, find your collection code, and see
              the good your rescued food is doing.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-[#246B3F] px-5 py-3 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(36,107,63,0.16)] transition hover:-translate-y-0.5 hover:bg-[#1C5934] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#246B3F]/20"
          >
            <IconShoppingBag size={16} />
            Find more food
          </Link>
        </section>

        {/* Compact account stats */}
        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8E9E0] bg-white/85 p-4 shadow-[0_3px_14px_rgba(34,53,38,0.035)]">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF5EA] text-[#2D7548]">
              <IconShoppingBag size={19} />
            </div>
            <div>
              <p className="text-xs font-medium text-[#858B81]">Orders placed</p>
              <p className="mt-0.5 text-xl font-bold tracking-tight text-[#17251D]">{SAMPLE_ORDERS.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8E9E0] bg-white/85 p-4 shadow-[0_3px_14px_rgba(34,53,38,0.035)]">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F8F0DF] text-[#A56B1D]">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <p className="text-xs font-medium text-[#858B81]">Total spent</p>
              <p className="mt-0.5 text-xl font-bold tracking-tight text-[#17251D]">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8E9E0] bg-white/85 p-4 shadow-[0_3px_14px_rgba(34,53,38,0.035)]">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF5EA] text-[#2D7548]">
              <IconLeaf size={19} />
            </div>
            <div>
              <p className="text-xs font-medium text-[#858B81]">CO₂e avoided</p>
              <p className="mt-0.5 text-xl font-bold tracking-tight text-[#17251D]">{totalImpact.toFixed(1)} kg</p>
            </div>
          </div>
        </section>

        {/* Tabs and live count */}
        <section className="mt-9">
          <div className="flex flex-col gap-4 border-b border-[#E5E8DE] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                aria-pressed={activeTab === "active"}
                className={`relative -mb-px flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition ${
                  activeTab === "active"
                    ? "border-[#2D804D] text-[#246B3F]"
                    : "border-transparent text-[#858B81] hover:text-[#34453A]"
                }`}
              >
                Active pickups
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeTab === "active" ? "bg-[#E6F3E7] text-[#246B3F]" : "bg-[#ECEDE7] text-[#6E766C]"}`}>
                  {activeOrders.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                aria-pressed={activeTab === "history"}
                className={`relative -mb-px flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition ${
                  activeTab === "history"
                    ? "border-[#2D804D] text-[#246B3F]"
                    : "border-transparent text-[#858B81] hover:text-[#34453A]"
                }`}
              >
                Order history
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeTab === "history" ? "bg-[#E6F3E7] text-[#246B3F]" : "bg-[#ECEDE7] text-[#6E766C]"}`}>
                  {pastOrders.length}
                </span>
              </button>
            </div>
            <p className="pb-4 text-xs text-[#8A9086]">
              {activeTab === "active" ? "Your next pickup, at a glance" : "A little good goes a long way"}
            </p>
          </div>

          {/* Active pickups */}
          {activeTab === "active" && (
            <div className="mt-6 space-y-5">
              {activeOrders.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[#D8DFD4] bg-white/70 px-6 py-14 text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EAF5EA] text-[#2D7548]">
                    <IconShoppingBag size={25} />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-[#17251D]">Nothing waiting for pickup</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7A8378]">
                    When you place an order, your pickup details and collection code will appear here.
                  </p>
                  <Link
                    href="/marketplace"
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-[#246B3F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1C5934]"
                  >
                    Explore nearby food
                  </Link>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-[28px] border border-[#DCE7D9] bg-white shadow-[0_12px_35px_rgba(32,66,42,0.07)]"
                  >
                    {/* Active order strip */}
                    <div className="flex flex-col gap-3 border-b border-[#E9EEE5] bg-[#F4F8F0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                      <div className="flex items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#DCEEDC] text-[#246B3F]">
                          <IconCheckCircle size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#245C38]">Payment confirmed</p>
                          <p className="mt-0.5 text-xs text-[#788477]">Your food is waiting to be picked up</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start rounded-full border border-[#D8E8D6] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#42734C] sm:self-auto">
                        <span className="size-1.5 rounded-full bg-[#3E9858]" />
                        Pickup pending
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
                      {/* Order details */}
                      <div className="p-5 sm:p-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#183D2A] text-sm font-bold tracking-wide text-white">
                              {order.restaurant_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#92998E]">Pickup from</p>
                              <h2 className="mt-1 truncate text-lg font-bold tracking-tight text-[#17251D]">{order.restaurant_name}</h2>
                              <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-[#7C857A]">
                                <IconMapPin size={14} className="mt-0.5 shrink-0 text-[#37814F]" />
                                {order.restaurant_address}
                              </p>
                            </div>
                          </div>
                          <p className="shrink-0 text-xs font-medium text-[#9A9F96]">{order.created_at}</p>
                        </div>

                        {/* Pickup information */}
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-[#E9E8D9] bg-[#FBF8EF] p-4">
                            <div className="flex items-center gap-2 text-[#9A6A27]">
                              <IconClock size={17} />
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Pickup window</span>
                            </div>
                            <p className="mt-2 text-sm font-bold leading-5 text-[#3A3328]">{order.pickup_window}</p>
                            <p className="mt-1.5 text-[11px] leading-4 text-[#8D806B]">Show your pickup code at the restaurant counter.</p>
                          </div>
                          <div className="rounded-2xl border border-[#DCEBDD] bg-[#F2F8F0] p-4">
                            <div className="flex items-center gap-2 text-[#347A49]">
                              <IconLeaf size={17} />
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Your positive impact</span>
                            </div>
                            <p className="mt-2 text-sm font-bold text-[#245C38]">~{order.co2_saved_kg.toFixed(1)} kg CO₂e avoided</p>
                            <p className="mt-1.5 text-[11px] leading-4 text-[#718473]">Thanks for giving good food another chance.</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="mt-6 border-t border-[#E9EEE5] pt-5">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#8A9287]">Your rescued food</h3>
                            <span className="text-[11px] font-medium text-[#8A9287]">Order #{order.id.replace("ord-", "")}</span>
                          </div>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F5F2E9] text-[#8C744B]">
                                    <IconShoppingBag size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="line-clamp-2 text-sm font-semibold text-[#344238]">{item.title}</p>
                                    <p className="mt-0.5 text-xs text-[#8A9287]">Quantity: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="shrink-0 text-sm font-bold tabular-nums text-[#344238]">{formatCurrency(item.unit_price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#DDE5D9] pt-4">
                            <span className="text-sm font-semibold text-[#687568]">Total paid</span>
                            <span className="text-xl font-bold tracking-tight tabular-nums text-[#246B3F]">{formatCurrency(order.total_amount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pickup pass */}
                      <aside className="relative flex flex-col justify-between overflow-hidden bg-[#183D2A] p-5 text-white sm:p-6 lg:p-7">
                        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full border border-white/10" />
                        <div className="pointer-events-none absolute -right-7 -top-10 size-36 rounded-full border border-white/10" />
                        <div className="relative">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#B8D7BC]">Your pickup pass</span>
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-[#D6E9D6]">Show at counter</span>
                          </div>
                          <p className="mt-8 text-xs font-medium text-[#B8D7BC]">Collection code</p>
                          <p className="mt-2 select-all break-all font-mono text-3xl font-bold tracking-[0.12em] text-white sm:text-[2rem]">{order.pickup_code}</p>
                          <p className="mt-3 max-w-[220px] text-xs leading-5 text-[#C3D7C5]">The restaurant team will use this code to verify your pickup.</p>
                          <button
                            type="button"
                            onClick={() => void copyCode(order.pickup_code)}
                            className="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-xs font-bold text-[#204B31] transition hover:bg-[#EAF5EA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                          >
                            {copiedCode === order.pickup_code ? "Copied to clipboard ✓" : "Copy pickup code"}
                          </button>
                          {copyError && (
                            <p role="alert" className="mt-2 text-center text-[11px] text-[#F4D5B4]">Copy unavailable. Select the code to copy it.</p>
                          )}
                        </div>
                        <div className="relative mt-8 border-t border-dashed border-white/25 pt-5">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-[#B8D7BC]">Order total</span>
                            <span className="font-bold text-white">{formatCurrency(order.total_amount)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                            <span className="text-[#B8D7BC]">Items</span>
                            <span className="font-semibold text-white">{getOrderItemCount(order)}</span>
                          </div>
                          <p className="mt-5 text-[10px] leading-4 text-[#AFC9B3]">EcoEats is pickup-only. Please collect your order within the pickup window.</p>
                        </div>
                      </aside>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* Order history */}
          {activeTab === "history" && (
            <div className="mt-6 space-y-3">
              {pastOrders.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[#D8DFD4] bg-white/70 px-6 py-14 text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EAF5EA] text-[#2D7548]">
                    <IconClock size={25} />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-[#17251D]">Your story starts with a rescue</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7A8378]">Completed and cancelled orders will show up here.</p>
                  <Link href="/marketplace" className="mt-6 inline-flex rounded-full bg-[#246B3F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1C5934]">Explore food nearby</Link>
                </div>
              ) : (
                pastOrders.map((order) => {
                  const isCompleted = order.status === "COMPLETED";
                  return (
                    <article key={order.id} className="flex flex-col gap-4 rounded-2xl border border-[#E6E9DF] bg-white p-4 shadow-[0_3px_14px_rgba(34,53,38,0.035)] transition hover:border-[#D3E3D1] hover:shadow-[0_8px_24px_rgba(34,53,38,0.06)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${isCompleted ? "bg-[#EAF5EA] text-[#2D804D]" : "bg-[#F8EEEE] text-[#A45C54]"}`}>
                          {isCompleted ? <IconCheckCircle size={21} /> : <IconClock size={21} />}
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${isCompleted ? "bg-[#EAF5EA] text-[#2D7548]" : "bg-[#F8EEEE] text-[#A45C54]"}`}>
                              {isCompleted ? "Picked up" : "Cancelled"}
                            </span>
                            <span className="text-[11px] text-[#9A9F96]">{order.created_at}</span>
                          </div>
                          <h3 className="truncate text-sm font-bold text-[#26372B]">{order.restaurant_name}</h3>
                          <p className="mt-1 line-clamp-1 text-xs text-[#818A7F]">
                            {order.items.map((item) => `${item.title} × ${item.quantity}`).join(", ")}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-[#92998E]">
                            <IconMapPin size={12} /> {order.restaurant_address}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-5 border-t border-[#EEF0E9] pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-bold tabular-nums text-[#26372B]">{formatCurrency(order.total_amount)}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-[#37814F]">~{order.co2_saved_kg.toFixed(1)} kg CO₂e avoided</p>
                        </div>
                        <span className="text-[10px] font-medium text-[#A0A69B]">#{order.id.replace("ord-", "")}</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* Bottom reminder */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#DCEBDD] bg-[#F1F7EF] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[#347A49]"><IconLeaf size={18} /></div>
            <p className="text-xs leading-5 text-[#647767]">
              Every rescued order makes a difference. Thanks for choosing good food with a smaller footprint.
            </p>
          </div>
          <Link href="/marketplace" className="shrink-0 text-xs font-bold text-[#286A41] underline-offset-4 hover:underline">
            Discover more deals
          </Link>
        </div>
      </div>
    </main>
  );
}
