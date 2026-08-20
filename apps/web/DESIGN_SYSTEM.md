# Educational SaaS UI System — Developer & Team Design System Guide

> **Core Identity**: Inter + Emerald + Slate + White + Red (Errors Only)  
> **Approach**: Mobile-First (Strict baseline target: 320px+)  
> **Rule**: No additional brand colors. 1 Primary Color only (Emerald).

---

## 1. Typography System

### Font Configuration
- **Font Family**: `Inter` (Single font family across the entire application)
- **Weights Used**:
  - `400` — Regular (Body, Small text, Placeholder)
  - `500` — Medium (Navigation, Form Labels, Interactive chips)
  - `600` — SemiBold (Headings H1, H2, H3, H4, Active states)

### Responsive Typography Scale

| Element | Mobile (320px+) | Desktop (768px+) | Weight | Tailwind Class / Element | Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | `24px` (`1.5rem`) | `30px` (`1.875rem`) | `600` | `<h1>` or `.text-h1` | **Never below 24px**. Allow wrap. |
| **H2** | `20px` (`1.25rem`) | `24px` (`1.5rem`) | `600` | `<h2>` or `.text-h2` | Mobile-first wrap. |
| **H3** | `18px` (`1.125rem`) | `20px` (`1.25rem`) | `600` | `<h3>` or `.text-h3` | Section subheadings. |
| **H4** | `16px` (`1rem`) | `18px` (`1.125rem`) | `600` | `<h4>` or `.text-h4` | Card titles / subsection headers. |
| **Body** | `16px` (`1rem`) | `16px` (`1rem`) | `400` | `<p>` or `.text-body` | **Never below 16px** for readability. |
| **Navigation** | `15px` (`0.9375rem`) | `15px` (`0.9375rem`) | `500` | `<nav>` or `.text-nav` | Clear interactive hierarchy. |
| **Label** | `14px` (`0.875rem`) | `14px` (`0.875rem`) | `500` | `<label>` or `.text-label` | Form input labels. |
| **Small Text** | `14px` (`0.875rem`) | `14px` (`0.875rem`) | `400` | `<small>` or `.text-small` | **Never below 14px** (No 11-12px microtext). |
| **Placeholder** | `14px` (`0.875rem`) | `14px` (`0.875rem`) | `400` | `placeholder:text-text-disabled` | Color `#94A3B8`. |

---

## 2. Color Palette & Token System

### Text Colors
| Purpose | Hex Code | Tailwind Token / Utility | CSS Variable |
| :--- | :--- | :--- | :--- |
| **Primary text** | `#0F172A` | `text-text-primary` | `var(--text-primary)` |
| **Body text** | `#334155` | `text-text-body` | `var(--text-body)` |
| **Secondary text** | `#64748B` | `text-text-secondary` | `var(--text-secondary)` |
| **Disabled / Placeholder** | `#94A3B8` | `text-text-disabled` | `var(--text-disabled)` |
| **Brand / Links** | `#059669` | `text-text-brand` | `var(--text-brand)` |
| **Error** | `#DC2626` | `text-text-error` | `var(--text-error)` |

### Brand Colors (Single Primary Color Only — Emerald)
| Purpose | Hex Code | Tailwind Token / Utility | CSS Variable |
| :--- | :--- | :--- | :--- |
| **Primary** | `#059669` | `bg-brand-primary` / `bg-primary` | `var(--brand-primary)` |
| **Primary Hover** | `#047857` | `hover:bg-brand-hover` | `var(--brand-hover)` |
| **Active / Light Tint** | `#ECFDF5` | `bg-brand-active` | `var(--brand-active)` |
| **Error (Only Accent)** | `#DC2626` | `bg-destructive` / `text-destructive` | `var(--text-error)` |

### Surfaces & Layout Tokens
| Purpose | Hex Code | Tailwind Token | CSS Variable |
| :--- | :--- | :--- | :--- |
| **Main Background** | `#F8FAFC` | `bg-bg-main` / `bg-background` | `var(--bg-main)` |
| **Surface (Cards/Modals)** | `#FFFFFF` | `bg-bg-surface` / `bg-card` | `var(--bg-surface)` |
| **Hover State** | `#F1F5F9` | `hover:bg-bg-hover` | `var(--bg-hover)` |
| **Border** | `#E2E8F0` | `border-border-default` / `border-border` | `var(--border-default)` |
| **Active Background** | `#ECFDF5` | `bg-bg-active` | `var(--bg-active)` |

---

## 3. Component Surfaces & States

### Sidebar Navigation
| State | Background | Text Color | Classes / Utility |
| :--- | :--- | :--- | :--- |
| **Normal** | `transparent` | `#475569` | `.sidebar-item` / `bg-transparent text-[#475569]` |
| **Hover** | `#F1F5F9` | `#0F172A` | `.sidebar-item:hover` / `hover:bg-[#F1F5F9] hover:text-[#0F172A]` |
| **Active** | `#ECFDF5` | `#059669` | `.sidebar-item-active` / `bg-[#ECFDF5] text-[#059669] font-semibold` |

### Header
- **Background**: `#FFFFFF` (`bg-header` or `bg-white`)
- **Primary Text / Title**: `#0F172A` (`text-header-foreground`)
- **Secondary Text / Breadcrumbs**: `#64748B` (`text-header-secondary`)
- **Bottom Border**: `1px solid #E2E8F0` (`border-header-border` or `border-b border-slate-200`)

### Footer
- **Background**: `#FFFFFF` (`bg-footer` or `bg-white`)
- **Text**: `#64748B` (`text-footer-foreground`)
- **Top Border**: `1px solid #E2E8F0` (`border-footer-border` or `border-t border-slate-200`)

---

## 4. Mobile-First & Responsive Rules (320px–350px Viewports)

1. **Target Viewport Baseline**: Always test and ensure clean rendering at **320px – 350px** width.
2. **Body Text**: Must never drop below `16px`.
3. **Small Text**: Must never drop below `14px`.
4. **H1 Heading**: Must never drop below `24px`.
5. **Headings Wrapping**: Allow headings to wrap cleanly with `overflow-wrap: break-word` and `text-wrap: balance`. Do not use `whitespace-nowrap` or force horizontal truncation on headers.
6. **Layout Scaling**: No horizontal scrollbars (`overflow-x: hidden` on viewport roots), ensure touch-friendly button targets (min `36px` to `44px` height).

---

## 5. TypeScript Token Import (For JS/TS Components & Charts)

All design constants are strictly typed and available for direct import:

```typescript
import { 
  THEME_FONTS, 
  THEME_COLORS, 
  THEME_TYPOGRAPHY, 
  THEME_BREAKPOINTS 
} from "@/constants";

// Example Usage in Custom Component / Charts
const brandPrimary = THEME_COLORS.brand.primary; // "#059669"
const surfaceBg = THEME_COLORS.surfaces.surface; // "#FFFFFF"
const headingFont = THEME_FONTS.family;
```
