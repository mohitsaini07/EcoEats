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

function getDiscount(originalPrice: number, discountedPrice: number) {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function MarketplaceView({
  initialListings = [],
}: {
  initialListings?: FoodListing[];
}) {
  const [listings] = useState<FoodListing[]>(() => {
    if (initialListings.length === 0) return SAMPLE_LISTINGS;
    const dbIds = new Set(initialListings.map((l) => l.id));
    const extras = SAMPLE_LISTINGS.filter((s) => !dbIds.has(s.id));
    return [...initialListings, ...extras];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<ActiveCart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingListing, setPendingListing] = useState<FoodListing | null>(null);

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return listings.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.restaurant_name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [listings, selectedCategory, searchQuery]);

  const cartItems = cart?.items ?? [];
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const originalCartTotal = cartItems.reduce(
    (sum, item) => sum + item.listing.original_price * item.quantity,
    0,
  );
  const cartSavings = originalCartTotal - (cart?.total_amount ?? 0);
  const featuredListing = filteredListings[0];
  const remainingListings = filteredListings.slice(1);

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
        (sum, item) => sum + item.listing.discounted_price * item.quantity,
        0,
      );

      return { ...previousCart, items: updatedItems, total_amount: total };
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
        (sum, item) => sum + item.listing.discounted_price * item.quantity,
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
    setIsCheckoutOpen(false);
  }

  function renderQuantityControl(listing: FoodListing) {
    const quantity =
      cart?.items.find((item) => item.food_listing_id === listing.id)?.quantity ?? 0;

    if (quantity === 0) {
      return (
        <button
          type="button"
          onClick={() => handleAddToCart(listing)}
          disabled={listing.available_quantity <= 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D6038] px-4 py-2.5 text-xs font-bold text-white shadow-[0_7px_18px_rgba(29,96,56,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#174C2D] hover:shadow-[0_10px_22px_rgba(29,96,56,0.22)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#A8B5AA] disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A] focus-visible:ring-offset-2"
        >
          <IconPlus size={14} />
          Add to tray
        </button>
      );
    }

    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-[#CDE4D1] bg-[#EDF6EE] p-1 shadow-inner">
        <button
          type="button"
          onClick={() => handleUpdateQuantity(listing.id, quantity - 1)}
          aria-label={`Remove one ${listing.title}`}
          className="grid size-7 place-items-center rounded-full bg-white text-[#286B41] shadow-sm transition hover:bg-[#DDEFE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A]"
        >
          <IconMinus size={12} />
        </button>
        <span className="min-w-6 text-center text-xs font-extrabold tabular-nums text-[#285C39]">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => handleUpdateQuantity(listing.id, quantity + 1)}
          disabled={quantity >= listing.available_quantity}
          aria-label={`Add one ${listing.title}`}
          className="grid size-7 place-items-center rounded-full bg-[#286B41] text-white shadow-sm transition hover:bg-[#1D6038] disabled:cursor-not-allowed disabled:bg-[#A8B5AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A]"
        >
          <IconPlus size={12} />
        </button>
      </div>
    );
  }

  function renderFoodCard(listing: FoodListing, featured = false) {
    const quantityInCart =
      cart?.items.find((item) => item.food_listing_id === listing.id)?.quantity ?? 0;
    const discount = getDiscount(listing.original_price, listing.discounted_price);
    const soldOut = listing.available_quantity <= 0;

    return (
      <article
        key={listing.id}
        className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-[#E5E8DE] bg-[#FFFEFA] shadow-[0_7px_24px_rgba(35,55,40,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(35,55,40,0.11)] ${
          featured ? "xl:col-span-2 xl:grid xl:grid-cols-[1.05fr_0.95fr]" : ""
        }`}
      >
        <div className={`relative overflow-hidden bg-[#ECEFE5] ${featured ? "min-h-67.5 xl:min-h-85" : "aspect-5/4"}`}>
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.055]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#12271B]/55 via-transparent to-[#12271B]/10" />
          <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-[#FBFAF4]/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#3B5141] shadow-sm backdrop-blur">
            {listing.category}
          </span>
          {discount > 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-[#E7F4E9] px-3 py-1.5 text-[10px] font-black tracking-wide text-[#286B41] shadow-sm">
              SAVE {discount}%
            </span>
          )}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#14291D]/80 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
              <IconClock size={13} className="text-[#B7DCC0]" />
              {listing.pickup_start} – {listing.pickup_end}
            </span>
            <span className="rounded-full bg-[#F5E7C9] px-3 py-1.5 text-[10px] font-extrabold text-[#72501C]">
              {soldOut ? "Sold out" : `${listing.available_quantity} left`}
            </span>
          </div>
        </div>

        <div className={`flex flex-1 flex-col p-5 sm:p-6 ${featured ? "justify-center xl:p-7" : ""}`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#849087]">
            <IconMapPin size={13} className="shrink-0 text-[#4D9663]" />
            <span className="truncate">{listing.restaurant_name}</span>
            {listing.distance_km >= 0 && (
              <span className="ml-auto shrink-0 text-[10px] text-[#98A197]">
                {listing.distance_km.toFixed(1)} km away
              </span>
            )}
          </div>

          <h3 className={`mt-2 font-bold leading-[1.3] tracking-tight text-[#26362B] transition-colors group-hover:text-[#2D804D] ${featured ? "text-xl sm:text-2xl" : "text-base"}`}>
            {listing.title}
          </h3>
          <p className={`mt-2 text-xs leading-[1.7] text-[#879187] ${featured ? "max-w-lg line-clamp-3" : "line-clamp-2"}`}>
            {listing.description}
          </p>

          {featured && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F0F4EB] px-3 py-1.5 text-[10px] font-semibold text-[#617362]">Fresh surplus batch</span>
              <span className="rounded-full bg-[#F0F4EB] px-3 py-1.5 text-[10px] font-semibold text-[#617362]">Pickup at the kitchen</span>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-[#EDF0E9] pt-5" style={{ marginTop: featured ? "1.5rem" : undefined }}>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-2xl font-extrabold tracking-tight text-[#1E3928] tabular-nums">
                  {formatPrice(listing.discounted_price)}
                </span>
                <span className="text-xs font-medium text-[#A5ADA5] line-through tabular-nums">
                  {formatPrice(listing.original_price)}
                </span>
              </div>
              <span className="mt-1 block text-[10px] font-bold text-[#438455]">
                You save {formatPrice(Math.max(0, listing.original_price - listing.discounted_price))}
              </span>
            </div>
            {renderQuantityControl(listing)}
          </div>
          {quantityInCart > 0 && (
            <p className="mt-3 text-[10px] font-semibold text-[#438455]">
              {quantityInCart} {quantityInCart === 1 ? "unit" : "units"} in your tray · Inventory is held at checkout
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-[#FBFAF5] text-[#17251D]">
      {/* Atmospheric background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-48 -top-48 size-[38rem] rounded-full bg-[#D8E9D4]/45 blur-[120px]" />
        <div className="absolute -left-48 top-[48rem] size-[34rem] rounded-full bg-[#EADDC5]/35 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-20 lg:pt-8">
        {/* Market identity strip */}
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE3D0] bg-[#E7F2E5] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#286B41]">
              <IconLeaf size={13} /> The rescue market
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78847A]">
              <IconMapPin size={13} className="text-[#4D9663]" /> Bengaluru Central · Within 3 km
            </span>
          </div>
          <span className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#95A095] sm:inline-flex">
            <span className="size-1.5 rounded-full bg-[#4D9663]" /> Local kitchens · Pickup only
          </span>
        </div>

        {/* Distinctive feature stage + live rescue tray */}
        <section className="mx-auto mt-5 grid max-w-330 gap-4 overflow-hidden rounded-4xl bg-[#173D2A] p-5 text-white shadow-[0_24px_65px_rgba(25,57,37,0.16)] sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:p-10">
          <div className="flex flex-col justify-center py-2 lg:py-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D3E8D5]">
              <IconSparkles size={13} className="text-[#D8B875]" /> Good food, second chances
            </div>
            <h1 className="mt-6 max-w-2xl text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-[4.4rem]">
              Tonight&apos;s best finds are <span className="text-[#B7D9A9]">still on the table.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#D0DFD1]/80 sm:text-base">
              Explore delicious surplus from neighbourhood kitchens, pay less, and collect it fresh. Every item rescued is good news for your plate and the planet.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("food-shelf")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-[#DCEED8] px-5 py-3 text-xs font-extrabold text-[#173D2A] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.97]"
              >
                Explore today&apos;s food <span aria-hidden="true">↓</span>
              </button>
              <span className="text-[11px] font-semibold text-white/55">No delivery · Simple restaurant pickup</span>
            </div>
          </div>

          <div className="relative flex min-h-[270px] items-center justify-center lg:min-h-[340px]">
            <div aria-hidden="true" className="absolute right-[7%] top-[8%] size-48 rounded-full border border-white/10 bg-[#B8D8A8]/10 sm:size-64" />
            <div aria-hidden="true" className="absolute bottom-[5%] left-[6%] size-24 rounded-full bg-[#D9B878]/15 blur-2xl" />
            <div className="relative w-full max-w-[470px] rounded-[28px] border border-white/15 bg-[#F8F5E9] p-4 text-[#203328] shadow-[0_22px_50px_rgba(0,0,0,0.18)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-[#7D8B7C]">Your rescue tray</p>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">A little goodness, gathered.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="grid size-10 shrink-0 place-items-center cursor-pointer rounded-full bg-[#E5F0E3] text-[#286B41] transition hover:bg-[#D4E8D2]"
                  aria-label="Open your rescue tray"
                >
                  <IconShoppingBag size={18} />
                </button>
              </div>

              <div className="relative mt-4 flex min-h-[122px] items-center justify-center overflow-hidden rounded-[22px] border border-[#E4DDCC] bg-[linear-gradient(135deg,#E8D7B5_0%,#D5B98C_48%,#E9D9B9_100%)] p-4 shadow-inner">
                <div aria-hidden="true" className="absolute inset-2 rounded-[17px] border border-[#9E8058]/25" />
                <div aria-hidden="true" className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,transparent,transparent_15px,rgba(111,79,42,0.18)_16px,transparent_17px)]" />
                {cartItems.length > 0 ? (
                  <div className="relative flex flex-wrap items-center justify-center gap-2.5">
                    {cartItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="relative size-[76px] overflow-hidden rounded-2xl border-[3px] border-[#FFF9EA] bg-white shadow-[0_7px_16px_rgba(71,49,24,0.2)] sm:size-[88px]">
                        <img src={item.listing.image_url || FALLBACK_IMAGE} alt={item.listing.title} className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 right-1 rounded-full bg-[#173D2A] px-1.5 py-0.5 text-[9px] font-black text-white">×{item.quantity}</span>
                      </div>
                    ))}
                    {cartItems.length > 4 && <span className="grid size-12 place-items-center rounded-full bg-[#173D2A] text-xs font-black text-white shadow-lg">+{cartItems.length - 4}</span>}
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center text-center">
                    <div className="grid size-12 place-items-center rounded-2xl border border-white/70 bg-[#FFF9EA]/80 text-[#6F805E] shadow-sm">
                      <IconLeaf size={25} />
                    </div>
                    <p className="mt-2 text-xs font-extrabold text-[#45583F]">Your tray is waiting</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#6F805E]">Add a nearby find to get started</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#879184]">{totalCartCount} {totalCartCount === 1 ? "unit" : "units"} in your tray</p>
                  <p className="mt-0.5 text-xl font-black tracking-tight text-[#1D3927] tabular-nums">{formatPrice(cart?.total_amount ?? 0)}</p>
                  {cart && cartSavings > 0 && <p className="mt-0.5 text-[10px] font-bold text-[#438455]">Saving {formatPrice(cartSavings)}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-[#173D2A] px-4 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-[#245A39] active:scale-[0.97]"
                >
                  Review tray <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 border-t border-[#E8E5D9] pt-3 text-[9px] font-semibold text-[#849080]">
                <IconClock size={12} className="text-[#9D7B3E]" /> Your 10-minute inventory hold begins when checkout starts.
              </p>
            </div>
          </div>
        </section>

        {/* Browse controls */}
        <section className="mx-auto mt-12 max-w-330" aria-label="Find surplus food">
          <div className="flex flex-col gap-5 border-b border-[#DFE4D9] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#879486]">Find your next favourite</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#203328] sm:text-3xl">Browse the food shelf.</h2>
              <p className="mt-1.5 text-xs text-[#829084]">Small batches, lovely prices, ready for pickup.</p>
            </div>
            <label className="relative block w-full lg:max-w-[350px]">
              <span className="sr-only">Search food or restaurant</span>
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8B978D]"><IconSearch size={17} /></span>
              <input
                type="search"
                placeholder="Search food, kitchen or craving..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-[#DDE5D9] bg-[#FFFEFA] py-3 pl-11 pr-4 text-sm text-[#243328] shadow-sm outline-none transition placeholder:text-[#A2AAA2] focus:border-[#70A982] focus:ring-4 focus:ring-[#70A982]/10"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2.5 cursor-pointer text-xs font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#77B88A] focus-visible:ring-offset-2 ${active ? "bg-[#173D2A] text-white shadow-[0_6px_16px_rgba(23,61,42,0.17)]" : "border border-[#E0E6DC] bg-[#FFFEFA] text-[#647267] hover:border-[#BFD8C3] hover:bg-[#EAF3E9] hover:text-[#286B41]"}`}
                >
                  {category === "All" ? "✳ All food" : category}
                </button>
              );
            })}
            <span className="ml-auto hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#91A092] sm:inline-flex">
              <IconSparkles size={13} className="text-[#A88A4C]" /> {filteredListings.length} local finds
            </span>
          </div>
        </section>

        {/* Editorial food shelf */}
        <section id="food-shelf" className="mx-auto mt-8 max-w-330 scroll-mt-8">
          {filteredListings.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#D9E2D8] bg-[#FFFEFA]/75 px-6 py-16 text-center shadow-sm">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EAF4E9] text-[#5B966A]"><IconLeaf size={25} /></span>
              <h3 className="mt-4 text-lg font-bold text-[#26372B]">No surplus found for this search</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7B887D]">Try another food name or category. There may be more delicious finds nearby.</p>
              <button type="button" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }} className="mt-6 rounded-full bg-[#173D2A] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#245A39]">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B978B]">Tonight&apos;s rescue selection</p>
                <span className="text-[10px] font-semibold text-[#8A968A]">{filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"} · Pickup from local kitchens</span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {featuredListing && renderFoodCard(featuredListing, true)}
                {remainingListings.map((listing) => renderFoodCard(listing))}
              </div>
            </>
          )}
        </section>

        {/* Restaurant conflict confirmation */}
        {pendingListing && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#102318]/35 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingListing(null); }}>
            <div role="alertdialog" aria-modal="true" aria-labelledby="restaurant-switch-title" className="w-full max-w-md rounded-[28px] border border-[#E0E6DA] bg-[#FBFAF4] p-5 shadow-[0_24px_70px_rgba(20,37,27,0.24)] sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F7EBD5] text-[#93651F]"><IconAlertCircle size={21} /></span>
                <div>
                  <h2 id="restaurant-switch-title" className="text-base font-extrabold text-[#24352A]">A new kitchen, a fresh tray?</h2>
                  <p className="mt-1 text-xs leading-5 text-[#738074]">Your current tray belongs to <strong className="text-[#344B39]">{cart?.restaurant_name}</strong>. EcoEats keeps each order with one restaurant for easy pickup.</p>
                  <p className="mt-2 text-xs text-[#738074]">Switching will clear your current tray and add <strong className="text-[#344B39]">{pendingListing.title}</strong> instead.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setPendingListing(null)} className="rounded-full border border-[#DCE4D9] bg-white px-5 py-3 text-xs font-bold text-[#617064] transition hover:bg-[#F0F4EC]">Keep current tray</button>
                <button type="button" onClick={handleClearAndSwitch} className="rounded-full bg-[#1D6038] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#174C2D]">Clear & switch kitchen</button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile cart dock */}
        <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-full border border-white/15 bg-[#173D2A] px-4 py-3 text-white shadow-[0_14px_38px_rgba(15,45,27,0.3)] backdrop-blur-xl transition active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-white/12"><IconShoppingBag size={17} /></span>
              <span className="text-left"><span className="block text-[9px] font-bold uppercase tracking-[0.13em] text-white/60">Your rescue tray</span><span className="block text-xs font-extrabold">{totalCartCount} {totalCartCount === 1 ? "unit" : "units"}</span></span>
            </span>
            <span className="flex items-center gap-2 text-sm font-black tabular-nums">{formatPrice(cart?.total_amount ?? 0)} <span aria-hidden="true">→</span></span>
          </button>
        </div>
      </div>

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
