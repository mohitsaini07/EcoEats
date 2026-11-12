"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { IconArrowRight } from "@/components/icons";

const links = [
  { id: "home", label: "Home", href: "#home" },
  { id: "about", label: "About", href: "#about"},
  { id: "how", label: "How it works", href: "#how-it-works" },
  { id: "food", label: "Today's food", href: "#surplus-preview" },
  { id: "restaurants", label: "For restaurants", href: "#restaurants" },
];

export function LandingNav() {
  const [activeLink, setActiveLink] = useState("home");

  return (
    <header className="eco-topbar eco-landing-nav motion-fade-down" role="banner">
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
                {activeLink === link.id && <span aria-hidden="true" className="eco-nav-dot" />}
                {link.label}
              </a>
            ))}
          </div>
        </nav>
         <Link href="/signup" className="eco-button eco-button-hero motion-interactive-pill">
            Explore deals <IconArrowRight size={16} />
          </Link>
      </div>
    </header>
  );
}
