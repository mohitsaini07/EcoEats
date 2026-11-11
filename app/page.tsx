import Image from "next/image";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import {
  IconArrowRight,
  IconCheckCircle,
  IconClock,
  IconLeaf,
  IconMapPin,
  IconShoppingBag,
} from "@/components/icons";
import { SAMPLE_LISTINGS } from "@/lib/data/sample-listings";
import { HowEcoEatsWorks } from "@/components/how-it-works";

export default function Home() {
  return (
    <div className="eco-page">
      <LandingNav />
      <main id="main-content">
        <section id="home" className="eco-hero">
          <div className="eco-hero-grid">
            <div className="eco-hero-copy">
              <p className="eco-eyebrow eco-eyebrow-light">
                <IconLeaf size={14} /> Everyday food, rescued locally
              </p>
              <h1 className="eco-hero-title">
                <span className="eco-trust-dark">Good food.</span>
                <br />
                <span className="eco-trust-light">Better price.</span>
                <br />
                <span className="eco-trust-dark">Less </span>
                <span className="eco-hero-accent"> waste.</span>
              </h1>
              <p className="eco-hero-description">
                Find beautifully made surplus food from local kitchens, save up
                to 70%, and give every meal the ending it deserves.
              </p>
              <div className="eco-hero-actions">
                <Link href="/signup" className="eco-button eco-button-hero">
                  Find food nearby <IconArrowRight size={18} />
                </Link>
                <a
                  href="#how-it-works"
                  className="eco-button eco-button-hero-quiet"
                >
                  See how it works
                </a>
              </div>
              <div className="eco-hero-benefits" aria-label="EcoEats benefits">
                <span>
                  <IconShoppingBag size={17} /> Easy pickup
                </span>
                <span>
                  <IconClock size={17} /> Secure online payment
                </span>
              </div>
            </div>

            <div
              className="eco-hero-art"
              aria-label="EcoEats mobile food discovery preview"
            >
              <div className="eco-hero-orbit" aria-hidden="true" />
              <Image
                src="/images/hero-surplus-bowl.png"
                alt="bowl"
                fill
                priority
                className="eco-hero-bowl"
              />
              <div className="eco-phone">
                <Image
                  src="/images/phone-mockup.png"
                  alt=""
                  fill
                  priority
                  className="pointer-events-none"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="eco-trust-section">
          <div className="eco-container">
            <div className="eco-trust-card">
              <div className="eco-trust-grid">
                {/* Left Column: Mobile App Preview Mockup */}
                <div className="eco-trust-mockup-wrapper">
                  <div
                    className="eco-mockup-phone"
                    aria-label="EcoEats Mobile App Preview"
                  >
                    <div className="eco-mockup-screen">
                      {/* Status Bar */}
                      <div className="eco-mockup-topbar">
                        <span className="eco-mockup-time">9:41</span>
                        <div className="eco-mockup-island">
                          <span className="eco-mockup-island-lens" />
                        </div>
                        <div className="eco-mockup-status-icons">
                          <svg
                            width="12"
                            height="10"
                            viewBox="0 0 16 12"
                            fill="currentColor"
                          >
                            <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
                            <rect
                              x="4.5"
                              y="5.5"
                              width="2.5"
                              height="6.5"
                              rx="0.5"
                            />
                            <rect x="9" y="3" width="2.5" height="9" rx="0.5" />
                            <rect
                              x="13.5"
                              y="0"
                              width="2.5"
                              height="12"
                              rx="0.5"
                            />
                          </svg>
                          <svg
                            width="11"
                            height="10"
                            viewBox="0 0 16 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M1 3a13 13 0 0 1 14 0" />
                            <path d="M3.5 6.5a9 9 0 0 1 9 0" />
                            <circle
                              cx="8"
                              cy="10"
                              r="1.5"
                              fill="currentColor"
                            />
                          </svg>
                          <svg
                            width="18"
                            height="10"
                            viewBox="0 0 24 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect x="1" y="1" width="19" height="10" rx="3" />
                            <rect
                              x="3"
                              y="3"
                              width="13"
                              height="6"
                              rx="1.5"
                              fill="currentColor"
                            />
                            <path d="M21 4.5v3" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>

                      {/* App Header Navigation */}
                      <div className="eco-mockup-app-header">
                        <button
                          type="button"
                          aria-label="Go back"
                          className="eco-mockup-icon-btn"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="eco-mockup-location-pill">
                          Deliver to <strong>Mirqab</strong>
                        </div>
                        <button
                          type="button"
                          aria-label="Favorites"
                          className="eco-mockup-icon-btn"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Shopping Cart"
                          className="eco-mockup-icon-btn"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span className="eco-mockup-badge" />
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="eco-mockup-search">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span>Search for lebanese</span>
                      </div>

                      {/* Hot Deals Banner Card */}
                      <div className="eco-mockup-banner">
                        <div className="eco-mockup-banner-head">
                          <div>
                            <h4>Hot Deals!</h4>
                            <p>Up to 40% Off</p>
                          </div>
                          <span className="eco-mockup-percent-badge">%</span>
                        </div>

                        {/* Dish Visual */}
                        <div
                          className="eco-mockup-banner-dish"
                          aria-hidden="true"
                        >
                          <svg
                            viewBox="0 0 200 130"
                            fill="none"
                            className="w-full h-full drop-shadow-lg"
                          >
                            {/* Subtle Steam */}
                            <path
                              d="M75 35C72 25 78 15 74 5"
                              stroke="rgba(255,255,255,0.4)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M100 30C97 18 105 10 101 2"
                              stroke="rgba(255,255,255,0.5)"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            <path
                              d="M125 35C122 25 128 15 124 5"
                              stroke="rgba(255,255,255,0.4)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                            {/* White Ceramic Plate */}
                            <ellipse
                              cx="100"
                              cy="85"
                              rx="85"
                              ry="32"
                              fill="#fafafa"
                              stroke="#e5e7eb"
                              strokeWidth="2"
                            />
                            <ellipse
                              cx="100"
                              cy="83"
                              rx="72"
                              ry="25"
                              fill="#f4f4f5"
                            />
                            {/* Pasta Swirls & Sauce */}
                            <ellipse
                              cx="100"
                              cy="80"
                              rx="56"
                              ry="20"
                              fill="#d97706"
                              opacity="0.9"
                            />
                            <path
                              d="M60 80C65 70 85 66 98 72C112 78 128 72 136 78C142 82 134 90 120 92C106 94 85 92 68 88C60 86 55 84 60 80Z"
                              fill="#b45309"
                            />
                            <path
                              d="M72 76C80 68 95 65 110 68C125 71 132 80 125 84C118 88 102 86 88 84C78 82 70 80 72 76Z"
                              fill="#ea580c"
                            />
                            <path
                              d="M82 72C90 66 106 66 116 70C124 74 120 80 110 81C100 82 90 80 84 76C80 74 80 73 82 72Z"
                              fill="#dc2626"
                            />
                            {/* Cherry Tomatoes */}
                            <circle cx="68" cy="82" r="6" fill="#ef4444" />
                            <circle
                              cx="66"
                              cy="80"
                              r="1.5"
                              fill="#fff"
                              opacity="0.6"
                            />
                            <circle cx="132" cy="79" r="6" fill="#ef4444" />
                            <circle
                              cx="130"
                              cy="77"
                              r="1.5"
                              fill="#fff"
                              opacity="0.6"
                            />
                            {/* Fresh Basil Leaves */}
                            <path
                              d="M100 68C98 62 92 60 90 62C88 64 92 70 100 68Z"
                              fill="#16a34a"
                            />
                            <path
                              d="M100 68C102 62 108 60 110 62C112 64 108 70 100 68Z"
                              fill="#22c55e"
                            />
                            <path
                              d="M99 64C99 58 101 56 103 57C105 58 103 64 99 64Z"
                              fill="#15803d"
                            />
                          </svg>
                        </div>

                        <div className="eco-mockup-banner-foot">
                          <small>
                            Don&apos;t miss out on today&apos;s biggest
                            discounts.
                          </small>
                          <div className="eco-mockup-dots" aria-hidden="true">
                            <span className="eco-mockup-dot-pill" />
                            <span className="eco-mockup-dot" />
                            <span className="eco-mockup-dot" />
                          </div>
                        </div>
                      </div>

                      {/* All Restaurants Categories */}
                      <p className="eco-mockup-cat-title">All restaurants</p>
                      <div className="eco-mockup-categories">
                        <span className="eco-mockup-cat-pill">🥗 Healthy</span>
                        <span className="eco-mockup-cat-pill">🍔 Burgers</span>
                        <span className="eco-mockup-cat-pill">🍢 Grills</span>
                        <span className="eco-mockup-cat-pill">🍕 Pizza</span>
                      </div>

                      {/* Filter Chips */}
                      <div className="eco-mockup-filters">
                        <span className="eco-mockup-filter-chip">
                          ⇅ Sort by ⌄
                        </span>
                        <span className="eco-mockup-filter-chip">Offers</span>
                        <span className="eco-mockup-filter-chip">
                          Rating 4.5+
                        </span>
                        <span className="eco-mockup-filter-chip">
                          Fast delivery
                        </span>
                      </div>

                      {/* Restaurant Preview Card */}
                      <div className="eco-mockup-card-preview">
                        <div className="eco-mockup-card-left">
                          <span className="eco-mockup-card-thumb">🍲</span>
                          <span className="eco-mockup-card-disc">
                            Up to 0.550 KD off
                          </span>
                        </div>
                        <span className="eco-mockup-rating">★ 4.9</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Copy, CTA & Stats */}
                <div className="eco-trust-content">
                  <h2 className="eco-trust-heading">
                    <span className="eco-trust-light">Discover </span>
                    <span className="eco-trust-dark">
                      Who We
                      <span className="eco-burst-icon" aria-hidden="true">
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 28 28"
                          fill="none"
                        >
                          <path
                            d="M7 16L3 11"
                            stroke="#ea580c"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M14 13L16 4"
                            stroke="#ea580c"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M20 16L26 12"
                            stroke="#ea580c"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </span>
                    <br />
                    <span className="eco-trust-dark">Are </span>
                    <span className="eco-trust-light"> &amp; Why Food</span>
                    <br />
                    <span className="eco-trust-light">Lovers </span>
                    <span className="eco-trust-dark">Trust Us</span>
                  </h2>

                  <p className="eco-trust-description">
                    We connect people with their favorite restaurants through a
                    seamless and user-friendly food ordering experience focused.
                  </p>

                  <div className="eco-trust-action">
                    <Link href="/marketplace" className="eco-button-trust-cta">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Learn More
                    </Link>
                  </div>

                  <div className="eco-trust-stats">
                    <div className="eco-stat-item">
                      <span className="eco-stat-value">15+</span>
                      <span className="eco-stat-label">
                        Restaurant Partners
                      </span>
                    </div>
                    <div className="eco-stat-item">
                      <span className="eco-stat-value">12k+</span>
                      <span className="eco-stat-label">Orders Delivered</span>
                    </div>
                    <div className="eco-stat-item">
                      <span className="eco-stat-value">95%</span>
                      <span className="eco-stat-label">
                        Customer Satisfaction
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HowEcoEatsWorks />

        <section
          id="surplus-preview"
          className="relative overflow-hidden bg-[#F8F7F0] py-16 sm:py-20 lg:py-24"
        >
          {/* Soft brand accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-28 top-20 size-72 rounded-full bg-[#DDEBDD]/60 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-[#F2E7CF]/55 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D5E4D5] bg-white/75 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#285B3B] shadow-sm">
                  <span className="size-1.5 rounded-full bg-[#4E8B5C]" />
                  Tonight&apos;s good saves
                </div>
                <h2 className="text-3xl font-black tracking-[-0.04em] text-[#183B29] sm:text-4xl lg:text-5xl">
                  Fresh finds.{" "}
                  <span className="text-[#54835B]">Less waste.</span>
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#69766B] sm:text-base">
                  Good food from nearby kitchens, listed at lovely prices and
                  ready for you to pick up.
                </p>
              </div>

              <Link
                href="/marketplace"
                className="group inline-flex w-fit items-center gap-2 rounded-full border border-[#C9D9CA] bg-white/80 px-5 py-3 text-sm font-bold text-[#245537] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#285B3B] hover:bg-[#285B3B] hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6D9B76]/25"
              >
                Browse marketplace
                <IconArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {SAMPLE_LISTINGS.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#C9D9CA] bg-white/70 px-6 py-12 text-center">
                <p className="text-base font-bold text-[#183B29]">
                  Fresh finds are on their way.
                </p>
                <p className="mt-2 text-sm text-[#69766B]">
                  Check the marketplace again soon for nearby surplus food.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {SAMPLE_LISTINGS.map((listing) => {
                  const discountPercent =
                    listing.original_price > 0
                      ? Math.round(
                          (1 -
                            listing.discounted_price / listing.original_price) *
                            100,
                        )
                      : 0;

                  return (
                    <article
                      key={listing.id}
                      className="group overflow-hidden rounded-[1.6rem] border border-[#E4E6DC] bg-white shadow-[0_8px_30px_rgba(28,61,39,0.055)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C7D8C8] hover:shadow-[0_18px_45px_rgba(28,61,39,0.12)]"
                    >
                      <Link
                        href="/marketplace"
                        aria-label={`Explore ${listing.title} in the marketplace`}
                        className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#6D9B76]/40"
                      >
                        <div className="relative h-56 overflow-hidden bg-[#EEF1E9] sm:h-60">
                          <img
                            src={
                              listing.image_url ||
                              "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=85&w=1000"
                            }
                            alt={listing.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#102719]/45 via-transparent to-[#102719]/5" />

                          <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#285B3B] shadow-sm backdrop-blur">
                            {listing.category}
                          </span>

                          {discountPercent > 0 && (
                            <span className="absolute right-4 top-4 rounded-full bg-[#E7B85E] px-3 py-1.5 text-[11px] font-extrabold text-[#3D2B0D] shadow-sm">
                              {discountPercent}% off
                            </span>
                          )}

                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#173D2A]/85 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                              <IconMapPin
                                size={13}
                                className="shrink-0 text-[#C5E1C9]"
                              />
                              <span className="truncate">
                                {listing.restaurant_name}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[#285B3B] shadow-sm backdrop-blur">
                              {listing.distance_km} km away
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="p-5 sm:p-6">
                        <div className="flex min-h-[3.25rem] items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-lg font-extrabold leading-snug tracking-[-0.02em] text-[#1C3525] transition-colors group-hover:text-[#356B45]">
                              {listing.title}
                            </h3>
                            <p className="mt-1 text-xs text-[#839084]">
                              From a nearby local kitchen
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#EEF0E9] pt-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black tracking-tight text-[#183B29]">
                                ₹
                                {listing.discounted_price.toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                              <span className="text-sm font-medium text-[#A2AAA0] line-through">
                                ₹
                                {listing.original_price.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] font-bold text-[#54835B]">
                              You save ₹
                              {(
                                listing.original_price -
                                listing.discounted_price
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <Link
                            href="/marketplace"
                            className="group/button inline-flex shrink-0 items-center gap-2 rounded-full bg-[#285B3B] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#1B452E] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6D9B76]/30"
                          >
                            View deal
                            <IconArrowRight
                              size={14}
                              className="transition-transform group-hover/button:translate-x-0.5"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <p className="mt-6 text-center text-[11px] font-medium text-[#879287]">
              Browse, add to cart and pay online. Pick up directly from the
              kitchen.
            </p>
          </div>
        </section>

        <section className="eco-impact-strip">
          <div className="eco-container">
            <IconCheckCircle size={22} />
            <p>
              <strong>Every rescue counts.</strong> Great food stays on the
              table, and local makers are paid for their craft.
            </p>
            <Link href="/signup">
              Join EcoEats <IconArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="eco-footer">
        <div className="eco-container">
          <p>© 2026 EcoEats · Hyperlocal surplus-food marketplace</p>
          <Link href="/login">Restaurant sign in</Link>
        </div>
      </footer>
    </div>
  );
}
