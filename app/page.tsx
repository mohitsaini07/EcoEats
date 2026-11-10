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

        <section id="how-it-works" className="eco-trust-section">
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

        <section id="surplus-preview" className="eco-listings-section">
          <div className="eco-container">
            <div className="eco-section-heading eco-section-heading-row">
              <div>
                <p className="eco-eyebrow">Tonight&apos;s good saves</p>
                <h2>Freshly listed near you.</h2>
              </div>
              <Link href="/marketplace" className="eco-text-link">
                Browse marketplace <IconArrowRight size={16} />
              </Link>
            </div>
            <div className="eco-mini-listings">
              {SAMPLE_LISTINGS.slice(0, 3).map((listing) => (
                <article className="eco-mini-listing" key={listing.id}>
                  <img src={listing.image_url} className="eco-mini-image" alt={listing.title} />
                  <div className="p-4">
                  <div className="eco-mini-listing-head">
                    <span>{listing.category}</span>
                    <strong>
                      {Math.round(
                        (1 -
                          listing.discounted_price / listing.original_price) *
                          100,
                      )}
                      % off
                    </strong>
                  </div>
                  <h3>{listing.title}</h3>
                  <div className="flex items-center gap-2 mt-4 mb-1">
                    <IconMapPin className="" size={14} /> 
                    {listing.restaurant_name} · <br />{" "}
                  </div>
                  <p className="text-xs border border-green-400 rounded-full px-1 w-max">{listing.distance_km} km</p>
                  <div className="eco-mini-listing-foot">
                    <b>₹{listing.discounted_price}</b>
                    <del>₹{listing.original_price}</del>
                    <Link href="/marketplace">
                      Reserve <IconArrowRight size={14} />
                    </Link>
                  </div>
                  </div>
                </article>
              ))}
            </div>
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
