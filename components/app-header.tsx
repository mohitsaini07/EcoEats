"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { IconShoppingBag, IconChefHat, IconShieldCheck } from "@/components/icons";
import type { CurrentUser } from "@/lib/auth/session";

export function AppHeader({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "RESTAURANT_MANAGER";

  // Track active hash section when on /manager
  const [managerSection, setManagerSection] = useState<string>("dashboard");

  useEffect(() => {
    if (pathname !== "/manager") return;

    function handleScroll() {
      const scrollY = window.scrollY;
      const topOffset = 180;

      const pickupsEl = document.getElementById("pickups");
      const listingsEl = document.getElementById("listings");

      if (pickupsEl && listingsEl) {
        const pickupsRect = pickupsEl.getBoundingClientRect();
        const listingsRect = listingsEl.getBoundingClientRect();

        // Check if user has scrolled past either section
        if (listingsRect.top <= topOffset && listingsRect.bottom > 50) {
          setManagerSection("listings");
        } else if (pickupsRect.top <= topOffset && pickupsRect.bottom > 50) {
          setManagerSection("pickups");
        } else if (scrollY < 200) {
          setManagerSection("dashboard");
        }
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header className="eco-topbar" role="banner">
      <div className="eco-container eco-topbar-inner">
        <div className="flex items-center gap-6">
          <Brand href="/" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-black border border-white/15">
            {isAdmin ? (
              <>
                <IconShieldCheck size={14} className="text-(--color-primary)" />
                Admin Portal
              </>
            ) : isManager ? (
              <>
                <IconChefHat size={14} className="text-(--color-primary)" />
                Manager Portal
              </>
            ) : (
              <>
                <IconShoppingBag size={14} className="text-(--color-primary)" />
                Customer
              </>
            )}
          </span>
        </div>

        <nav className="eco-nav" aria-label="Primary navigation">
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className={`eco-nav-link ${pathname === "/admin" ? "active" : ""}`}
                aria-current={pathname === "/admin" ? "page" : undefined}
              >
                Applications
              </Link>
              <Link
                href="/manager"
                className={`eco-nav-link ${pathname === "/manager" ? "active" : ""}`}
                aria-current={pathname === "/manager" ? "page" : undefined}
              >
                Kitchen
              </Link>
              <Link
                href="/marketplace"
                className={`eco-nav-link ${pathname.startsWith("/marketplace") ? "active" : ""}`}
                aria-current={pathname.startsWith("/marketplace") ? "page" : undefined}
              >
                Marketplace
              </Link>
            </>
          ) : isManager ? (
            <>
              <Link
                href="/manager"
                className={`eco-nav-link ${
                  pathname === "/manager" && managerSection === "dashboard" ? "active" : ""
                }`}
                aria-current={
                  pathname === "/manager" && managerSection === "dashboard" ? "page" : undefined
                }
              >
                Dashboard
              </Link>
              <Link
                href="/manager#listings"
                className={`eco-nav-link ${
                  pathname === "/manager" && managerSection === "listings" ? "active" : ""
                }`}
                aria-current={
                  pathname === "/manager" && managerSection === "listings" ? "page" : undefined
                }
              >
                Listings
              </Link>
              <Link
                href="/manager#pickups"
                className={`eco-nav-link ${
                  pathname === "/manager" && managerSection === "pickups" ? "active" : ""
                }`}
                aria-current={
                  pathname === "/manager" && managerSection === "pickups" ? "page" : undefined
                }
              >
                Pickup Queue
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/marketplace"
                className={`eco-nav-link ${pathname === "/marketplace" ? "active" : ""}`}
                aria-current={pathname === "/marketplace" ? "page" : undefined}
              >
                Browse Food
              </Link>
              <Link
                href="/marketplace/orders"
                className={`eco-nav-link ${pathname === "/marketplace/orders" ? "active" : ""}`}
                aria-current={pathname === "/marketplace/orders" ? "page" : undefined}
              >
                My Orders
              </Link>
            </>
          )}

          <div className="flex items-center gap-3 pl-3 border-l border-(--color-border) ml-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-black leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-black/70 leading-tight">
                {user.email}
              </span>
            </div>
            <SignOutButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
