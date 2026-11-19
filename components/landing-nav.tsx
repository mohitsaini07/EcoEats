"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { IconArrowRight, IconUser } from "@/components/icons";
import type { CurrentUser } from "@/lib/auth/session";

const links = [
  { id: "home", label: "Home", href: "#home" },
  { id: "about", label: "About", href: "#about" },
  { id: "how", label: "How it works", href: "#how-it-works" },
  { id: "food", label: "Today's food", href: "#surplus-preview" },
];

export function LandingNav({ user }: { user?: CurrentUser | null } = {}) {
  const [activeLink, setActiveLink] = useState("home");

  return (
    <header
      className="eco-topbar eco-landing-nav motion-fade-down"
      role="banner"
    >
      <div className="eco-container eco-topbar-inner">
        <Brand />
        <nav className="eco-nav" aria-label="Main navigation">
          <div className="eco-nav-links" role="list">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setActiveLink(link.id)}
                aria-current={activeLink === link.id ? "page" : undefined}
                className={`eco-nav-link eco-nav-slide motion-interactive-pill ${activeLink === link.id ? "is-active" : ""}`}
              >
                {activeLink === link.id && (
                  <span aria-hidden="true" className="eco-nav-dot" />
                )}
                {link.label}
              </a>
            ))}
          </div>
        </nav>
        {user ? (
          <Link
            href="/login"
            aria-label="Sign in"
            className="group inline-flex items-center gap-2 pr-4 rounded-full text-black"
          >
            <IconUser
              size={20}
              className="transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#31513D] transition hover:bg-[#EEF5ED] motion-interactive-pill hidden sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="eco-button eco-button-hero motion-interactive-pill"
            >
              Explore deals <IconArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
