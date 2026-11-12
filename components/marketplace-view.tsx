"use client";

import { useMemo, useState } from "react";
import {
  IconAlertCircle,
  IconLeaf,
  IconSearch,
  IconShoppingBag,
  IconSparkles,
  IconClock,
  IconMapPin,
  IconPlus,
  IconMinus,
} from "@/components/icons";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutModal } from "@/components/checkout-modal";
import { SAMPLE_LISTINGS } from "@/lib/data/sample-listings";
import type { FoodListing, ActiveCart } from "@/lib/types/marketplace";

const CATEGORIES = ["All", "Bakery", "Meals", "Cafe", "Dessert"] as const;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function MarketplaceView() {
  const [listings] = useState<FoodListing[]>(SAMPLE_LISTINGS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<ActiveCart | null>({
    id: "cart-active-1",
    restaurant_id: "rest-001",
    restaurant_name: "Test Cafe & Artisan Bakery",
    items: [
      {
        id: "ci-01",
        food_listing_id: "fl-001",
        listing: SAMPLE_LISTINGS[0],
        quantity: 2,
      },
    ],
    total_amount: 298,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingListing, setPendingListing] = useState<FoodListing | null>(null);

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return listings.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.restaurant_name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [listings, selectedCategory, searchQuery]);

  const totalCartCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  function addItemToCart(listing: FoodListing) {
    setCart((previousCart) => {
      if (
        !previousCart ||
        previousCart.items.length === 0 ||
        previousCart.restaurant_id !== listing.restaurant_id
      ) {
        return {
          id: `cart-${Date.now()}`,
          restaurant_id: listing.restaurant_id,
          restaurant_name: listing.restaurant_name,
          items: [
            {
              id: `ci-${Date.now()}`,
              food_listing_id: listing.id,
              listing,
              quantity: 1,
            },
          ],
          total_amount: listing.discounted_price,
        };
      }

      const existingItem = previousCart.items.find(
        (item) => item.food_listing_id === listing.id,
      );
      const updatedItems = existingItem
        ? previousCart.items.map((item) =>
            item.food_listing_id === listing.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...previousCart.items,
            {
              id: `ci-${Date.now()}`,
              food_listing_id: listing.id,
              listing,
              quantity: 1,
            },
          ];

      const total = updatedItems.reduce(
        (sum, item) =>
          sum + item.listing.discounted_price * item.quantity,
        0,
      );

      return {
        ...previousCart,
        items: updatedItems,
        total_amount: total,
      };
    });
  }

  function handleAddToCart(listing: FoodListing) {
    if (listing.available_quantity < 1) return;

    if (
      cart &&
      cart.items.length > 0 &&
      cart.restaurant_id !== listing.restaurant_id
    ) {
      setPendingListing(listing);
      return;
    }

    const existingCartItem = cart?.items.find(
      (item) => item.food_listing_id === listing.id,
    );
    const currentQuantity = existingCartItem?.quantity ?? 0;

    if (currentQuantity >= listing.available_quantity) return;

    setPendingListing(null);
    addItemToCart(listing);
  }

  function handleClearAndSwitch() {
    if (!pendingListing) return;
    addItemToCart(pendingListing);
    setPendingListing(null);
  }

  function handleUpdateQuantity(listingId: string, quantity: number) {
    if (!cart) return;

    const listing = listings.find((item) => item.id === listingId);
    const maxStock = listing?.available_quantity ?? 99;
    const clampedQuantity = Math.min(quantity, maxStock);

    if (clampedQuantity <= 0) {
      const remainingItems = cart.items.filter(
        (item) => item.food_listing_id !== listingId,
      );

      if (remainingItems.length === 0) {
        setCart(null);
        return;
      }

      const total = remainingItems.reduce(
        (sum, item) =>
          sum + item.listing.discounted_price * item.quantity,
        0,
      );
      setCart({ ...cart, items: remainingItems, total_amount: total });
      return;
    }

    const updatedItems = cart.items.map((item) =>
      item.food_listing_id === listingId
        ? { ...item, quantity: clampedQuantity }
        : item,
    );
    const total = updatedItems.reduce(
      (sum, item) => sum + item.listing.discounted_price * item.quantity,
      0,
    );

    setCart({ ...cart, items: updatedItems, total_amount: total });
  }

  function handleClearCart() {
    setCart(null);
  }

  function handleProceedToCheckout() {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }

  function handleOrderSuccess() {
    setCart(null);
  }

  return (
    <main
      id="main-content"
      className="min-h-screen overflow-hidden bg-[#FBFAF5] text-[#17251D]"
    >
      {/* Soft brand atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      >
        <div className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-[#DCEEDB]/45 blur-[110px]" />
        <div className="absolute -left-48 top-[38rem] size-[30rem] rounded-full bg-[#F3E8D4]/45 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pt-7">

        {/* Marketplace introduction */}
        <section
          id="marketplace"
          className="mx-auto flex max-w-7xl flex-col gap-7 pb-9 pt-12 sm:pt-16 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-11 lg:pt-20"
        >
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CBE5D1] bg-[#E7F4E9] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-[#286B41]">
                <IconLeaf size={13} /> Hyperlocal surplus
              </span>
              <span className="text-xs font-semibold tracking-wide text-[#78847A]">
                Bengaluru Central · Within 3 km
              </span>
            </div>

            <h1 className="max-w-3xl text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.055em] text-[#18251D] sm:text-5xl lg:text-[3.65rem]">
              Good food, waiting <span className="text-[#368151]">nearby.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#707B72] sm:text-base">
              Discover fresh surplus from local kitchens at delightful prices.
              Reserve online, pay securely, and pick up your order directly from
              the restaurant.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#5E7062]">
              <span className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-[#E5F2E6] text-[#2D804D]">
                  <IconShoppingBag size={13} />
                </span>
                Simple pickup
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-[#E5F2E6] text-[#2D804D]">
                  <IconClock size={13} />
                </span>
                10-minute hold at checkout
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="group flex w-full items-center justify-between cursor-pointer gap-5 rounded-2xl border border-[#E2E8DE] bg-white/85 p-3.5 text-left shadow-[0_8px_24px_rgba(34,54,39,0.06)] transition hover:-translate-y-0.5 hover:border-[#BBD9C2] hover:shadow-[0_14px_30px_rgba(34,54,39,0.1)] sm:w-auto sm:min-w-[245px]"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#E1F3E5] text-[#2D804D] transition group-hover:bg-[#D1EBD7]">
                <IconShoppingBag size={20} />
              </span>
              <span>
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#91A095]">
                  Active cart
                </span>
                <span className="mt-0.5 block text-sm font-bold text-[#223328] tabular-nums">
                  {totalCartCount} {totalCartCount === 1 ? "item" : "items"}
                  {cart && ` · ${formatPrice(cart.total_amount)}`}
                </span>
              </span>
            </span>
            <span className="text-lg text-[#829187] transition group-hover:translate-x-1 group-hover:text-[#2D804D]">
              →
            </span>
          </button>
        </section>

        {/* Search and category controls */}
        <section className="mx-auto max-w-7xl border-y border-[#E4E8DE] py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Filter by food category"
            >
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={isSelected}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A] focus-visible:ring-offset-2 sm:px-5 ${
                      isSelected
                        ? "border-[#173D2A] bg-[#173D2A] text-white shadow-[0_5px_14px_rgba(23,61,42,0.15)]"
                        : "border-[#E1E7DE] bg-white/85 text-[#68746A] hover:border-[#BCD8C3] hover:bg-[#F0F7F0] hover:text-[#286B41]"
                    }`}
                  >
                    {category === "All" ? "All food" : category}
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full lg:max-w-[370px]">
              <span className="sr-only">Search food or restaurants</span>
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8B978D]">
                <IconSearch size={18} />
              </span>
              <input
                type="search"
                placeholder="Search croissant, sourdough, pasta..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-[#E0E7DE] bg-white/90 py-3 pl-11 pr-4 text-sm text-[#243328] shadow-[0_3px_12px_rgba(34,54,39,0.035)] outline-none transition placeholder:text-[#A2AAA2] focus:border-[#70A982] focus:ring-4 focus:ring-[#70A982]/10"
              />
            </label>
          </div>
        </section>

        {/* Listing results */}
        <section className="mx-auto max-w-7xl pt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#929D93]">
                Fresh finds around you
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#233328] sm:text-2xl">
                Available surplus <span className="text-[#8A998D]">({filteredListings.length})</span>
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5E9D8] bg-[#EAF5EB] px-3.5 py-2 text-[11px] font-bold text-[#35794B]">
              <IconSparkles size={14} /> Local deals, picked up fresh
            </span>
          </div>

          {filteredListings.length === 0 ? (
            <div className="my-8 rounded-[28px] border border-dashed border-[#D9E2D8] bg-white/65 px-6 py-16 text-center shadow-sm">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EAF4E9] text-[#5B966A]">
                <IconLeaf size={25} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-[#26372B]">
                No surplus found for this search
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7B887D]">
                Try another food name or category. There may be more delicious
                finds nearby.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-6 rounded-full bg-[#173D2A] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#245A39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A] focus-visible:ring-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredListings.map((listing) => {
                const cartItem = cart?.items.find(
                  (item) => item.food_listing_id === listing.id,
                );
                const quantityInCart = cartItem?.quantity ?? 0;
                const discountPercent =
                  listing.original_price > 0
                    ? Math.max(
                        0,
                        Math.round(
                          ((listing.original_price - listing.discounted_price) /
                            listing.original_price) *
                            100,
                        ),
                      )
                    : 0;
                const isOutOfStock = listing.available_quantity <= 0;
                const isAtStockLimit =
                  quantityInCart >= listing.available_quantity;

                return (
                  <article
                    key={listing.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-[25px] border border-[#E5E9E1] bg-white shadow-[0_5px_18px_rgba(35,55,40,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#C9DDCC] hover:shadow-[0_18px_38px_rgba(35,55,40,0.11)]"
                  >
                    {/* Food image */}
                    <div className="relative aspect-[5/3.8] overflow-hidden bg-[#F0F1E9]">
                      <img
                        src={listing.image_url || FALLBACK_IMAGE}
                        alt={listing.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#17251D]/55 via-transparent to-[#17251D]/5" />

                      <span className="absolute left-3.5 top-3.5 rounded-full border border-white/70 bg-[#FBFAF4]/95 px-3 py-1.5 text-[10px] font-extrabold capitalize tracking-wide text-[#3B5141] shadow-sm backdrop-blur-sm">
                        {listing.category}
                      </span>

                      {discountPercent > 0 && (
                        <span className="absolute right-3.5 top-3.5 rounded-full border border-[#C8E3CE] bg-[#E6F4E8] px-3 py-1.5 text-[10px] font-black tracking-wide text-[#286B41] shadow-sm">
                          {discountPercent}% OFF
                        </span>
                      )}

                      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#17251D]/80 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                          <IconClock size={13} className="text-[#A8D8B5]" />
                          {listing.pickup_start} – {listing.pickup_end}
                        </span>
                        <span className="rounded-full bg-[#F5E7C9] px-3 py-1.5 text-[10px] font-extrabold text-[#72501C] shadow-sm">
                          {isOutOfStock
                            ? "Sold out"
                            : `${listing.available_quantity} left`}
                        </span>
                      </div>
                    </div>

                    {/* Listing details */}
                    <div className="flex flex-1 flex-col p-4 sm:p-[18px]">
                      <div className="mb-2 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#849087]">
                        <IconMapPin size={13} className="shrink-0 text-[#4D9663]" />
                        <span className="truncate">{listing.restaurant_name}</span>
                      </div>

                      <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-bold leading-[1.45] tracking-[-0.015em] text-[#26362B] transition-colors group-hover:text-[#2D804D]">
                        {listing.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 min-h-[38px] text-xs leading-[1.65] text-[#879187]">
                        {listing.description}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#EDF0E9] pt-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-xl font-extrabold tracking-tight text-[#1E3928] tabular-nums">
                              {formatPrice(listing.discounted_price)}
                            </span>
                            <span className="text-xs font-medium text-[#A5ADA5] line-through tabular-nums">
                              {formatPrice(listing.original_price)}
                            </span>
                          </div>
                          <span className="mt-1 block text-[10px] font-bold text-[#438455]">
                            Save {formatPrice(listing.original_price - listing.discounted_price)}
                          </span>
                        </div>

                        {quantityInCart === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(listing)}
                            disabled={isOutOfStock}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#1D6038] px-4 py-2.5 cursor-pointer text-xs font-bold text-white shadow-[0_5px_12px_rgba(29,96,56,0.16)] transition hover:bg-[#174C2D] hover:shadow-[0_8px_18px_rgba(29,96,56,0.22)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#A8B5AA] disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A] focus-visible:ring-offset-2"
                          >
                            <IconPlus size={14} />
                            Add to cart
                          </button>
                        ) : (
                          <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#D6E9D9] bg-[#EDF6EE] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  listing.id,
                                  quantityInCart - 1,
                                )
                              }
                              aria-label={`Remove one ${listing.title}`}
                              className="grid size-7 place-items-center cursor-pointer rounded-full bg-white text-[#286B41] shadow-sm transition hover:bg-[#DDEFE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A]"
                            >
                              <IconMinus size={12} />
                            </button>
                            <span className="min-w-6 text-center text-xs font-extrabold text-[#285C39] tabular-nums">
                              {quantityInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  listing.id,
                                  quantityInCart + 1,
                                )
                              }
                              disabled={isAtStockLimit}
                              aria-label={`Add one ${listing.title}`}
                              className="grid size-7 place-items-center cursor-pointer rounded-full bg-[#286B41] text-white shadow-sm transition hover:bg-[#1D6038] disabled:cursor-not-allowed disabled:bg-[#A8B5AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A]"
                            >
                              <IconPlus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Restaurant conflict notice */}
        {pendingListing && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="restaurant-switch-title"
            className="fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-lg flex-col gap-4 rounded-3xl border border-[#DDE5DA] bg-[#FBFAF5] p-2 shadow-[0_24px_70px_rgba(20,37,27,0.24)] sm:flex-row sm:items-center sm:justify-between sm:p-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F7EBD5] text-[#93651F]">
                <IconAlertCircle size={20} />
              </span>
              <div className="min-w-0">
                <p
                  id="restaurant-switch-title"
                  className="text-sm font-extrabold text-[#24352A]"
                >
                  Switch restaurant?
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingListing(null)}
                className="rounded-full px-4 py-2.5 text-xs font-bold text-[#718074] transition cursor-pointer hover:bg-[#EEF2EA] hover:text-[#314536]"
              >
                Keep cart
              </button>
              <button
                type="button"
                onClick={handleClearAndSwitch}
                className="rounded-full bg-[#1D6038] px-4 py-2.5 text-xs font-bold text-white cursor-pointer shadow-sm transition hover:bg-[#174C2D]"
              >
                Clear & switch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing cart and checkout flows */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={handleOrderSuccess}
      />
    </main>
  );
}
