import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { IconShoppingBag, IconChefHat, IconShieldCheck } from "@/components/icons";
import type { CurrentUser } from "@/lib/auth/session";

export function AppHeader({ user }: { user: CurrentUser }) {
  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "RESTAURANT_MANAGER";

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
              <Link href="/admin" className="eco-nav-link">
                Applications
              </Link>
              <Link href="/manager" className="eco-nav-link">
                Kitchen
              </Link>
              <Link href="/marketplace" className="eco-nav-link">
                Marketplace
              </Link>
            </>
          ) : isManager ? (
            <>
              <Link href="/manager" className="eco-nav-link">
                Dashboard
              </Link>
              <Link href="/manager#listings" className="eco-nav-link">
                Listings
              </Link>
              <Link href="/manager#pickups" className="eco-nav-link">
                Pickup Queue
              </Link>
            </>
          ) : (
            <>
              <Link href="/marketplace" className="eco-nav-link">
                Browse Food
              </Link>
              <Link href="/marketplace/orders" className="eco-nav-link">
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
