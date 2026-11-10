# EcoEats design system

The interface is built on a three-layer token model in `app/globals.css`.

| Layer | Prefix | Purpose |
| --- | --- | --- |
| Primitive | `--eco-*` | Raw palette, spacing, radii, shadows, and motion values. |
| Semantic | `--color-*` | Intent: surface, border, primary, muted, danger, and focus. |
| Component | `--button-*`, `--panel-*`, `--field-*` | Defaults for reusable UI patterns. |

## Visual direction

Warm off-white surfaces and deep leaf green make the product feel local, calm,
and food-forward. Typography has compact headings, generous leading for body
copy, and clear hierarchy at every breakpoint.

## Layout primitives

- `eco-page`: full-height canvas.
- `eco-container`: responsive content rail, maximum 76rem.
- `eco-topbar` / `eco-topbar-inner`: sticky-ready application navigation.
- `eco-panel`: elevated surface for dashboard cards, forms, and empty states.
- `eco-stat`: dashboard metric card content.

## Component states

- Buttons have primary, secondary, and ghost variants.
- Keyboard focus has a 3px leaf-colored visible outline.
- Disabled controls remain legible and become non-interactive.
- Inputs use border and focus-ring tokens; validation messages use `eco-status-note`.

## Usage rule

New UI should compose the `eco-*` primitives and semantic CSS variables instead
of introducing hard-coded colour or spacing values. Add a new component token
only when a repeated component needs a stable, intentional override.
