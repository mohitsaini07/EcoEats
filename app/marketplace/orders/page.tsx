"use client";

import { useState } from "react";
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

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeOrders = SAMPLE_ORDERS.filter((o) => o.status === "CONFIRMED");
  const pastOrders = SAMPLE_ORDERS.filter((o) => o.status !== "CONFIRMED");

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <main className="eco-container py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[var(--color-border)]">
        <div>
          <p className="eco-eyebrow">Your EcoEats Account</p>
          <h1 className="eco-title mt-2 text-3xl sm:text-4xl">My Orders & Pickups</h1>
          <p className="eco-copy mt-2 text-sm sm:text-base">
            Track active food reservations, view pickup codes, and see your cumulative environmental impact.
          </p>
        </div>

        <Link href="/marketplace" className="eco-button eco-button-primary text-xs self-start sm:self-auto">
          <IconShoppingBag size={15} />
          Explore Marketplace
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === "active"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--eco-ink-500)] hover:text-[var(--color-foreground)]"
          }`}
        >
          Active Pickups ({activeOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ml-4 ${
            activeTab === "history"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--eco-ink-500)] hover:text-[var(--color-foreground)]"
          }`}
        >
          Order History ({pastOrders.length})
        </button>
      </div>

      {/* Active Pickups View */}
      {activeTab === "active" && (
        <div className="mt-8 space-y-6">
          {activeOrders.length === 0 ? (
            <div className="eco-panel border-dashed p-12 text-center bg-white">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--eco-canvas-100)] text-[var(--color-muted)] text-xl mb-3">
                🛍️
              </span>
              <h3 className="font-bold text-lg text-[var(--color-foreground)]">
                No active pickups right now
              </h3>
              <p className="eco-copy mx-auto mt-1 max-w-sm text-xs">
                When you reserve surplus food, your secret counter pickup code will appear here.
              </p>
              <Link href="/marketplace" className="eco-button eco-button-primary mt-6 text-xs">
                Find Surplus Food Near You
              </Link>
            </div>
          ) : (
            activeOrders.map((order) => (
              <div
                key={order.id}
                className="eco-panel p-6 sm:p-8 bg-white border-2 border-[var(--color-primary)]/40 shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="eco-badge eco-badge-success">
                        <IconCheckCircle size={13} />
                        Confirmed & Awaiting Pickup
                      </span>
                      <span className="text-xs text-[var(--eco-ink-500)] font-mono">
                        {order.id}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-[var(--color-foreground)]">
                      {order.restaurant_name}
                    </h2>
                    <p className="text-xs text-[var(--eco-ink-700)] flex items-center gap-1.5 mt-1">
                      <IconMapPin size={14} className="text-[var(--color-primary)] shrink-0" />
                      {order.restaurant_address}
                    </p>
                  </div>

                  {/* High Contrast Pickup Code Box */}
                  <div className="rounded-2xl border-2 border-dashed border-[var(--color-primary)] bg-[var(--eco-leaf-50)] p-4 text-center min-w-[220px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] block">
                      Show at counter to collect
                    </span>
                    <div className="my-1 font-mono text-3xl font-black tracking-widest text-[var(--eco-leaf-700)] select-all">
                      {order.pickup_code}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCode(order.pickup_code)}
                      className="text-xs font-semibold text-[var(--color-primary)] underline hover:no-underline cursor-pointer"
                    >
                      {copiedCode === order.pickup_code ? "Copied! ✓" : "Click to copy"}
                    </button>
                  </div>
                </div>

                {/* Pickup Window & Instructions */}
                <div className="py-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl bg-[var(--eco-amber-50)] p-4 border border-[var(--eco-amber-100)] flex items-start gap-3">
                    <IconClock size={20} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[var(--eco-amber-700)] block">
                        Pickup Window
                      </span>
                      <span className="text-sm font-extrabold text-[var(--color-foreground)]">
                        {order.pickup_window}
                      </span>
                      <p className="text-[11px] text-[var(--eco-ink-700)] mt-1">
                        Kitchen staff will pack your bag fresh before this window closes.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--eco-canvas-100)] p-4 border border-[var(--eco-line-200)] flex items-start gap-3">
                    <IconLeaf size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[var(--color-primary)] block">
                        Environmental Impact
                      </span>
                      <span className="text-sm font-extrabold text-[var(--color-foreground)]">
                        Saved ~{order.co2_saved_kg} kg CO₂e
                      </span>
                      <p className="text-[11px] text-[var(--eco-ink-700)] mt-1">
                        By rescuing this meal, you kept good food out of landfills.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items Snapshot */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--eco-ink-500)] mb-3">
                    Items in this package
                  </h4>
                  <div className="space-y-2 text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[var(--color-foreground)]">
                          {item.title} <strong className="text-[var(--color-primary)]">× {item.quantity}</strong>
                        </span>
                        <span className="font-bold tabular-nums text-[var(--color-foreground)]">
                          ₹{item.unit_price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--eco-line-200)] flex justify-between items-center font-black">
                    <span className="text-sm text-[var(--color-foreground)]">Total Paid (Financial Snapshot)</span>
                    <span className="text-lg text-[var(--color-primary)] tabular-nums">
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Order History View */}
      {activeTab === "history" && (
        <div className="mt-8 space-y-4">
          {pastOrders.map((order) => (
            <div
              key={order.id}
              className="eco-panel p-6 bg-white border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="eco-badge eco-badge-neutral">
                    {order.status}
                  </span>
                  <span className="text-xs text-[var(--eco-ink-500)]">
                    {order.created_at}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[var(--color-foreground)]">
                  {order.restaurant_name}
                </h3>
                <p className="text-xs text-[var(--eco-ink-500)] mt-0.5">
                  {order.items.map((i) => `${i.title} (${i.quantity})`).join(", ")}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-base font-extrabold text-[var(--color-foreground)] tabular-nums block">
                  ₹{order.total_amount}
                </span>
                <span className="text-[11px] font-semibold text-[var(--color-primary)]">
                  Rescued {order.co2_saved_kg} kg CO₂
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
