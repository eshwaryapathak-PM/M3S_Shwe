# Design System Guidelines: My Third Space

This document serves as the absolute blueprint for the brand identity, visual style, and component patterns of **My Third Space**. All prospective development must strictly align with this design system. Any proposed visual divergence **must** first be approved by the user.

---

## 🎨 Visual Identity & Brand Philosophy

"My Third Space" is a premium, minimalist health and fitness studio. Its design language is warm, earthy, crafted, and intentional—embodying a refuge from modern digital noise (a true "third space"). It completely avoids default dark mode black/pure white blocks, generic neon gradients, high-tech telemetry outputs, or unrequested features.

---

## 🎨 Core Color Palette (Warm Earth)

Always utilize the configured CSS variables (from `src/index.css`) for all colors:

### Backgrounds & Surfaces
- **`--sand-50` (`#FBF7F0`):** Core Page Background. Soft, warm off-white.
- **`--sand-100` (`#F5EDE0`):** Secondary / Card Background. Cozy contrast surface.
- **`--sand-200` (`#EADBC4`):** Subtle Surfaces, borders, and selected indicator backgrounds.
- **`--paper` (`#FFFDF8`):** Clean, bright white base for panels, alerts, and high-contrast buttons.

### Primary Typographic & Core Accents
- **`--espresso-900` (`#241810`):** Primary Text / High-Contrast Labels. Complete charcoal/warm dark ink.
- **`--espresso-800` (`#3E2C1C`):** Sub-headings, readable descriptions, and strong icons.
- **`--walnut-700` (`#5E4228`):** Main Primary Action / Branding Brown. Used for logos, CTA fills, highlight text, and key controls.
- **`--clay-600` (`#8A6640`) / `--clay-500` (`#A8825A`):** Muted metadata, helper fields, empty states.

### Earthy Complementary Accents
- **`--sage-500` (`#7B8B6F`):** Muted sage green—primarily for "Active", "Booked", or success states.
- **`--terracotta-500` (`#B86B4B`):** Warm clay/reddish-brown—for warnings or high-importance labels.
- **`--ochre-500` (`#C99A3F`):** Rich amber gold—for special notifications or premium tier attributes.

---

## 🔠 Typography Pairings

- **Display & Headings:** `--f-display` (paired with Google Fonts `Instrument Serif`). It is a highly editorial serif format featuring elegant serifs and organic cursive flows. Recommended sizes: `h1` (`44px` to `72px`), `h2` (`32px` to `54px`).
- **Body Contexts:** `--f-body` (`Inter` sans-serif). Extremely clean, legible, and highly optimized for touch targets.
- **Technical/Mono Accents:** `--f-mono` (`JetBrains Mono`). Reserved for technical readouts, categories, slot times, and labels.

---

## 📐 Border Radii & Layout Density
- Fully rounded pill contours (`--r-pill`: `999px`) are preferred for navigation inputs, primary action buttons, and tag chips.
- Modals, large elements, and hero features use `--r-xl` (`24px`).
- Card collections and sliders use `--r-lg` (`16px`) or `--r-md` (`10px`).

---

## 🛠️ Multi-Device Adaptability

This app is highly responsive:
- **Tablet (<= 1024px):** Collapse multi-column grid items to standard 2-column tracks, adjusting grid gap metrics.
- **Mobile (<= 640px / 960px):** Set single columns, restrict typographic heading scales, and transition to a highly tailored **fixed bottom navigation bar** for accessibility.

---

## 🚨 Strict Engineering Safeguards
1. **Zero Raw CSS:** Use the configured Tailwind wrappers or CSS variables.
2. **Consult Before Upgrading Style Themes:** Do not switch to high-contrast blue layouts or unrequested dark templates.
3. **Keep Code Compact & Modular:** Ensure components are broken down to keep compilation fast.
