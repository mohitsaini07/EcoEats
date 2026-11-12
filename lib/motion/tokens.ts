/**
 * EcoEats Motion Design System
 * 
 * Consistent, performant, biophilic motion design tokens.
 * Based on CSS transforms, opacity, and spring-like cubic beziers.
 * 100% hydration-safe and prefers-reduced-motion compatible.
 */

export const MOTION_TIMINGS = {
  fast: "150ms",
  normal: "240ms",
  smooth: "400ms",
  gentle: "600ms",
  deliberate: "800ms",
} as const;

export const MOTION_EASINGS = {
  // Smooth natural decel curve for elements entering the screen
  outQuint: "cubic-bezier(0.22, 1, 0.36, 1)",
  // Springy micro-curve for modals, popups, and badges
  spring: "cubic-bezier(0.16, 1, 0.3, 1)",
  // Standard UI transition
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Gentle hover & focus state
  gentle: "cubic-bezier(0.25, 0.1, 0.25, 1)",
} as const;

export type MotionVariant =
  | "fadeIn"
  | "fadeUp"
  | "fadeDown"
  | "scaleIn"
  | "slideInRight"
  | "slideInLeft"
  | "modalEnter";

export const MOTION_VARIANTS: Record<MotionVariant, string> = {
  fadeIn: "motion-fade-in",
  fadeUp: "motion-fade-up",
  fadeDown: "motion-fade-down",
  scaleIn: "motion-scale-in",
  slideInRight: "motion-slide-in-right",
  slideInLeft: "motion-slide-in-left",
  modalEnter: "motion-modal-enter",
};

