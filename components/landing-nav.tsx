"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { IconArrowRight, IconUser } from "@/components/icons";
import type { CurrentUser } from "@/lib/auth/session";

const links = [
  { id: "home", label: "Home", href: "#home", targetId: "home" },
  { id: "about", label: "About", href: "#about", targetId: "about" },
  { id: "how", label: "How it works", href: "#how-it-works", targetId: "how-it-works" },
  { id: "food", label: "Today's food", href: "#surplus-preview", targetId: "surplus-preview" },
];

export function LandingNav({ user }: { user?: CurrentUser | null } = {}) {
  const [activeLink, setActiveLink] = useState("home");
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function getActiveSection(): string {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If user has scrolled near bottom of page, activate last section
      if (scrollY + windowHeight >= documentHeight - 60) {
        return "food";
      }

      // If user is near very top, activate first section
      if (scrollY < 120) {
        return "home";
      }

      // Trigger line: 150px down from viewport top (accounts for fixed topbar)
      const triggerY = 150;

      // Scan backwards from bottom to top sections
      for (let i = links.length - 1; i >= 0; i--) {
        const link = links[i];
        const el = document.getElementById(link.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY && rect.bottom > triggerY) {
            return link.id;
          }
        }
      }

      // Fallback: find section closest to trigger line
      let closestId = "home";
      let closestDistance = Infinity;

      for (const link of links) {
        const el = document.getElementById(link.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top - triggerY);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestId = link.id;
          }
        }
      }

      return closestId;
    }

    let ticking = false;

    function handleScroll() {
      if (isClickScrollingRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = getActiveSection();
          setActiveLink((prev) => (prev !== current ? current : prev));
          ticking = false;
        });
        ticking = true;
      }
    }

    // Run once on mount in case the page is pre-scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  function handleLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    link: (typeof links)[number]
  ) {
    if (link.href.startsWith("#")) {
      event.preventDefault();
      const targetElement = document.getElementById(link.targetId);

      setActiveLink(link.id);
      isClickScrollingRef.current = true;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

      // Lock scroll spy briefly during smooth scroll to prevent jumping
      clickTimeoutRef.current = setTimeout(() => {
        isClickScrollingRef.current = false;
      }, 800);

      if (targetElement) {
        const navbarHeight = 70;
        const targetTop =
          targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth",
        });

        // Update URL hash without causing an instant scroll jump
        window.history.pushState(null, "", link.href);
      }
    } else {
      setActiveLink(link.id);
    }
  }

  return (
    <header
      className="eco-topbar eco-landing-nav motion-fade-down"
      role="banner"
    >
      <div className="eco-container eco-topbar-inner">
        <Brand />
        <nav className="eco-nav" aria-label="Main navigation">
          <div className="eco-nav-links" role="list">
            {links.map((link) => {
              const isActive = activeLink === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(event) => handleLinkClick(event, link)}
                  aria-current={isActive ? "page" : undefined}
                  className={`eco-nav-link eco-nav-slide motion-interactive-pill ${
                    isActive ? "is-active active" : ""
                  }`}
                >
                  {isActive && (
                    <span aria-hidden="true" className="eco-nav-dot" />
                  )}
                  {link.label}
                </a>
              );
            })}
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
              className="rounded-full px-6 py-3 text-sm font-semibold text-[#31513D] transition hover:bg-[#EEF5ED] motion-interactive-pill hidden sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="eco-button eco-button-hero motion-interactive-pill"
            >
              Register <IconArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
