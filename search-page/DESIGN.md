---
name: Sovereign Precision
colors:
  surface: '#faf9fb'
  surface-dim: '#dbd9dc'
  surface-bright: '#faf9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f5'
  surface-container: '#efedf0'
  surface-container-high: '#e9e8ea'
  surface-container-highest: '#e3e2e4'
  on-surface: '#1b1c1e'
  on-surface-variant: '#42474f'
  inverse-surface: '#2f3032'
  inverse-on-surface: '#f2f0f3'
  outline: '#737780'
  outline-variant: '#c3c6d0'
  surface-tint: '#3a608d'
  primary: '#002546'
  on-primary: '#ffffff'
  primary-container: '#0d3b66'
  on-primary-container: '#81a6d7'
  inverse-primary: '#a4c9fc'
  secondary: '#b02e00'
  on-secondary: '#ffffff'
  secondary-container: '#fe5825'
  on-secondary-container: '#541100'
  tertiary: '#002b06'
  on-tertiary: '#ffffff'
  tertiary-container: '#00440d'
  on-tertiary-container: '#65b563'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a4c9fc'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#204874'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a0'
  on-secondary-fixed: '#3b0900'
  on-secondary-fixed-variant: '#872100'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#faf9fb'
  on-background: '#1b1c1e'
  surface-variant: '#e3e2e4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.375rem
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-badge:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
  button-text:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: -0.005em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a dignified, authoritative, yet approachable visual language for official Indian national standards intelligence. It merges the gravitas of institutional governance with the streamlined responsiveness of next-generation conversational AI. The interface departs from legacy bureaucratic aesthetics, projecting clarity, institutional trust, precision, and national identity through nuanced execution.

The aesthetic philosophy is modern-institutional minimalism infused with calibrated warmth. Pristine, warm alabaster surfaces replace stark clinical grays, framing content with institutional dignity. National identity is expressed not through overt symbolism, but through delicate, ethereal gradient ribbons—subtle, low-opacity saffron, deep navy, and muted emerald accents that appear sparingly at structural margins and AI response headers. The tone is deeply respectful, highly legible, calm, and unmistakably authoritative.

## Colors
The palette balances constitutional authority and human warmth. 

- **Primary (`#0D3B66` - Ashoka Navy):** Represents verification, structure, and statutory credibility. Used for primary interactive triggers, institutional headers, authoritative badges, and active state highlights.
- **Secondary (`#F4511E` - Kesari/Deep Saffron):** Signifies vitality, focus, and user interaction. Used strictly for user speech prompt surfaces (as an ultra-low opacity tint), alert badges, and focal interactive prompts.
- **Tertiary (`#2E7D32` - Standard Emerald):** Signifies statutory compliance, certified marks, valid BIS certifications, and active verification states.
- **Neutral Surface Tone (`#FAF8F5` Alabaster Canvas):** The foundational backdrop. A warm, non-glare off-white that minimizes screen fatigue while establishing premium editorial warmth.
- **Ink Palette (`#1C1D1F` Charcoal to `#5F6368` Slate):** Text colors feature high contrast ratios meeting WCAG AAA compliance across all technical and reading copy.
- **Tricolor Wave Ambient Accent:** Linear gradient blends combining `#F4511E` (0.04 opacity), `#0D3B66` (0.03 opacity), and `#2E7D32` (0.04 opacity) reserved solely for ambient hero headers and subtle standard verification containers.

## Typography
Typography is engineered for rigorous technical literacy, standard codifications, and sustained reading. The primary sans-serif is `Inter`, deployed with optical tracking adjustments to maintain uncompromising legibility across multilingual transcripts, dense regulatory clause citations, and chat transcripts.

`JetBrains Mono` serves as the authoritative tertiary font strictly designated for technical tokens: Indian Standard identification tags (e.g., `IS 10500:2012`), clause numerals, version stamps, licensing hashes, and metadata timestamps. Headings utilize tight tracking and semi-bold weights to anchor visual hierarchy without shouting. Body text prioritizes a generous line height of 1.6 to enhance quick parsing of long technical clauses.

## Layout & Spacing
The layout follows a centered conversational column with a maximum content constraint of `800px` for conversational reading, expanding to `1200px` for dual-pane analytical dashboard views on desktop.

- **Mobile (< 768px):** Single-column layout. Horizontal margin is locked to `1rem`. Conversational stream flows edge-to-edge with `1rem` inner padding. The floating chat bar is pinned directly above the bottom safe area with `0.75rem` vertical spacing.
- **Tablet & Desktop (>= 768px):** Centered stream flanked by non-intrusive metadata rails or standard reference sidebars. Grid column gutters expand to `1.5rem`.
- **Vertical Rhythm:** Strict incremental scale. Chat message bubbles maintain an interior padding of `1rem` horizontally and `0.875rem` vertically, with a `1.25rem` inter-bubble vertical gap to distinctively separate exchanges.

## Elevation & Depth
Elevation conveys institutional clarity through low-contrast physical tiers rather than heavy shadows.

- **Base Layer (Canvas):** Pure `#FAF8F5` matte finish without shadows.
- **Message Tier (AI Containers):** Crisp, pure white (`#FFFFFF`) with a faint structural outline: `1px solid rgba(13, 59, 102, 0.08)`. No blur shadow is applied, preserving a clean print-inspired quality.
- **Standard Cards & Citations:** Micro-elevation using a soft ambient drop shadow: `0 2px 8px -2px rgba(13, 59, 102, 0.05)`, edged with a `1px` high-clarity slate border (`#E4E1DB`).
- **Floating Bottom Input Dock:** Floating elevated glass tier. Background: `rgba(255, 255, 255, 0.88)` with `16px` backdrop-filter blur. Elevated above all streaming content with a soft omnidirectional shadow: `0 8px 32px -4px rgba(13, 59, 102, 0.08)`, held by a precise top boundary line `rgba(13, 59, 102, 0.06)`.

## Shapes
A unified roundedness scale (`Level 2: 0.5rem base radius`) enforces deliberate precision without clinical harshness.

- **Standard Elements (Input fields, buttons, interactive cards):** `0.5rem` (8px). Reflects functional, engineered authority.
- **Containers (Chat responses, regulatory document blocks):** `rounded-lg` (`1rem` / 16px). Softens large analytical cards and keeps long messages visually contained.
- **Floating Input Island:** `rounded-xl` (`1.5rem` / 24px) for the outer dock bar to create a standalone control capsule.
- **Pill Exceptions:** Verification tags, quick action chips, and status badges utilize full pill rounding (`9999px`) to immediately denote contextual touchability and status tagging.

## Components

### 1. Conversational Bubbles
- **User Prompt:** Right-aligned or compact left-indented. Styled with an ultra-subtle warm saffron-tinted foundation: `#FFF7F2`, bordered by `1px solid rgba(244, 81, 30, 0.15)`. Text in `#1C1D1F`.
- **AI Response:** Left-aligned, pure white (`#FFFFFF`) background with a delicate border `rgba(13, 59, 102, 0.08)`. AI avatar is an institutional seal rendered in deep Ashoka Navy (`#0D3B66`).
- **Markdown & Content Layout:** Rich bullet hierarchies, standard bold headings, and statutory tables lined with `#EAE7E1`.

### 2. Verified BIS Standard Card
- Encapsulated modular component embedded inside AI responses.
- Features a left accent bar (`3px`) in Standard Emerald (`#2E7D32`).
- Contains the official standard code in `JetBrains Mono` (e.g., `IS/ISO 9001:2015`), accompanied by a green circular checkmark badge ("BIS Certified / Active Standard").
- Bottom utility row includes: "View Gazette Copy", "Verify License", and "View Product Categories" direct links.

### 3. Quick Action & Suggestion Chips
- Horizontally scrollable row placed above the prompt bar or under terminal AI messages.
- Pill-shaped (`rounded-full`), background `#FFFFFF`, border `1px solid #E2DED7`, text `#0D3B66`.
- Hover state: Background `#F0F4F8`, border-color `#0D3B66`.
- Pre-filled prompts (e.g., "Check Hallmark Registration", "IS 10500 Limits", "Laboratory Search").

### 4. Floating Input Bar
- Centered dock floating `1rem` above the canvas floor.
- Left slot: Media/document attachment button (`+` icon or paperclip) with subtle hover fill.
- Center slot: Auto-expanding auto-grow textarea without ugly scrollbars, placeholder: "Ask about Indian Standards, ISI marks, certifications...".
- Right slot: Dual triggers:
  - Voice Command button with an active microphone ripple.
  - Send Action button: Solid Ashoka Navy (`#0D3B66`) circle with a crisp white arrow icon, transitioning to `#F4511E` during voice synthesis or streaming interrupt.

### 5. Citations & Footnotes
- Miniature superscript badges linking directly to statutory gazettes or laboratory testing manuals.
- Pill tokens showing standard paragraph references: `[Cl. 4.2]`, clickable with popover previews in monospace text.