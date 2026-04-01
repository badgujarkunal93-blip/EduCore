# Design System Strategy: The Kinetic Observatory

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Observatory."** 

Unlike traditional education platforms that feel like static filing cabinets, this system treats data as a living, breathing celestial body. We are moving away from the "boxed-in" dashboard look to create an immersive, HUD-inspired environment. By leveraging intentional asymmetry, high-contrast neon accents, and deep layered translucency, we transform a functional tool into a premium, futuristic command center. The goal is to make the student-teacher interaction feel high-stakes, precise, and sophisticated.

## 2. Colors & Atmospheric Depth
Our palette is rooted in the void of deep space, punctuated by high-energy light sources.

### Surface Hierarchy & Nesting
We do not use lines to define space. We use **Atmospheric Density**.
- **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background shifts. For example, a `surface-container-low` component should sit on a `surface` background to create a "pocket" of depth.
- **Surface Tiers:** 
    - `surface-container-lowest` (#000000): Use for the deepest background layers or "wells."
    - `surface` (#0b0e14): The primary canvas.
    - `surface-container-highest` (#22262f): Reserved for the most prominent interactive cards.

### The "Glass & Gradient" Rule
To achieve the signature "Sci-Fi HUD" feel, all floating elements must utilize **Glassmorphism**. 
- Use semi-transparent variants of `surface-variant` with a `backdrop-blur` of at least 20px.
- **Signature Textures:** Main CTAs should not be flat. Use a linear gradient transitioning from `primary` (#99f7ff) to `primary-container` (#00f1fe) at a 135-degree angle. This mimics the "glow" of a physical light source.

## 3. Typography: Editorial Precision
The typography system balances the technical rigidity of `Space Grotesk` with the hyper-readability of `Inter`.

- **Display & Headlines (Space Grotesk):** These are your "Data Markers." Use `display-lg` and `headline-md` for high-impact numbers and dashboard titles. The wide aperture of Space Grotesk provides that essential futuristic, architectural feel.
- **Body & Titles (Inter):** All functional text uses Inter. It provides the "Human Element" against the cold, tech-heavy backdrop.
- **Labels (Manrope):** Use `label-md` and `label-sm` for micro-copy and metadata. These should often be set in `on-surface-variant` to recede visually, allowing the `primary` neon accents to pop.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web 2.0" for this aesthetic. We use **Luminous Depth**.

- **The Layering Principle:** Stack `surface-container` tiers to create hierarchy. A `surface-container-high` card placed on a `surface-dim` background creates a natural lift.
- **Ambient Glows:** When a "floating" effect is required, shadows must be tinted. Instead of black, use a low-opacity version of `secondary` (#7000ff) or `primary` (#00f2ff) with a blur of 40px+ to simulate light reflecting off a glass surface.
- **The "Ghost Border" Fallback:** If a container requires definition against a similar background, use a 1px stroke of `outline-variant` at **10% opacity**. This creates a "glint" on the edge of the glass rather than a heavy container line.

## 5. Components: The HUD Toolkit

### Glass Cards & Data Grids
- **Style:** No dividers. Use `surface-container-low` for the card body and a `surface-container-highest` for header sections within the card.
- **Spacing:** Use `10` (2.25rem) vertical padding to allow data to "breathe" within the glass.
- **Grid Lines:** For data-heavy views, overlay a subtle 1px grid using `outline-variant` at 5% opacity to reinforce the "coordinate system" aesthetic.

### Neon Glow Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`). Add a 4px outer glow of the same color at 30% opacity.
- **Secondary:** Transparent background, `primary` 1px ghost border (20% opacity), and `primary` text.
- **Shape:** Use the `sm` (0.125rem) or `none` (0px) roundedness for a sharper, more aggressive tech look, or `full` for a "capsule" pill style. Avoid the "friendly" `md` default.

### Glowing Pulse Indicators
- For "Live" classes or active status, use a `primary` or `tertiary` dot with a CSS keyframe animation scaling a 10% opacity circle outward. This provides "life" to the dashboard without distracting the user.

### Input Fields
- **Base:** `surface-container-lowest` fill.
- **Interaction:** On focus, the bottom border "lights up" with a `secondary` (#ac89ff) 2px stroke, while the rest of the container maintains its ghost-border glint.

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetry:** Place a large `display-lg` metric off-center to create a modern, editorial composition.
- **Embrace Negative Space:** Use the `24` (5.5rem) spacing token to separate major functional blocks.
- **Layer Glass:** Let elements overlap slightly. A glass card partially covering a background glow creates immense depth.

### Don't:
- **Don't use 100% white/black borders:** This kills the "frosted" illusion immediately.
- **Don't use standard icons:** Use thin-stroke (1px or 1.5px) SVG icons to match the "Geist/Inter" technical aesthetic.
- **Don't over-saturate:** Use `on-surface-variant` (#a9abb3) for 70% of your text. Reserve neon colors (`primary`, `secondary`) only for the most critical interaction points or data highlights.

## 7. Light Mode: "Frosted Ice"
When switching to light mode, the system shifts from "Space" to "Arctic."
- **Background:** `inverse-surface` (#f9f9ff).
- **Cards:** High-transparency white (#FFFFFF at 40%) with a heavy `backdrop-blur`.
- **Accents:** The neon `primary` shifts to a slightly deeper `inverse-primary` (#006a70) to maintain contrast against the pale backgrounds.
