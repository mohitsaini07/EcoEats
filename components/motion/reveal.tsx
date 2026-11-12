"use client";

import React, { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType } from "react";
import { type MotionVariant, MOTION_VARIANTS } from "@/lib/motion/tokens";

interface RevealProps<T extends ElementType = "div"> {
  as?: T;
  variant?: MotionVariant;
  delayMs?: number;
  durationMs?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Reveal<T extends ElementType = "div">({
  as,
  variant = "fadeUp",
  delayMs = 0,
  durationMs,
  threshold = 0.05,
  rootMargin = "0px 0px -20px 0px",
  triggerOnce = true,
  className = "",
  children,
  ...restProps
}: RevealProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof RevealProps<T>>) {
  const Component = as || "div";
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If IntersectionObserver is not available or reduced motion is preferred, reveal immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  const variantClass = MOTION_VARIANTS[variant] || "motion-fade-up";
  const dynamicStyle: React.CSSProperties = {
    ...(delayMs > 0 ? { animationDelay: `${delayMs}ms` } : {}),
    ...(durationMs ? { animationDuration: `${durationMs}ms` } : {}),
  };

  return (
    // @ts-expect-error - Polymorphic element props typing
    <Component
      ref={ref}
      style={dynamicStyle}
      className={`${className} ${
        isVisible ? variantClass : "opacity-0 [transform:translate3d(0,18px,0)]"
      }`}
      {...restProps}
    >
      {children}
    </Component>
  );
}

interface StaggerProps {
  staggerMs?: number;
  initialDelayMs?: number;
  variant?: MotionVariant;
  className?: string;
  children: React.ReactNode;
}

export function Stagger({
  staggerMs = 70,
  initialDelayMs = 0,
  variant = "fadeUp",
  className = "",
  children,
}: StaggerProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        const delay = initialDelayMs + index * staggerMs;
        return (
          <Reveal variant={variant} delayMs={delay}>
            {child}
          </Reveal>
        );
      })}
    </div>
  );
}
