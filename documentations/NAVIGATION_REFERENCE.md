# Navigation Layout Reference

## Desktop Navigation - Connected State

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Sparkles] Feel Space    (spacer)    [Arcade] [Sessions] [History]    │
│                                            ↓          ↓          ↓      │
│                                       /games   /sessions   /history     │
│                                                                         │
│                                       ───────────────────                │
│                                       │                                  │
│                            [FEELS Balance] [Address] [Logout]           │
│                                  10              0x1234... 🔓           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Desktop Navigation - Disconnected State

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Sparkles] Feel Space    (spacer)    [Connect Wallet Button]          │
│                                           🔗 Connect Wallet            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile Header - Connected State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Sparkles] Feel Space       [FEELS: 10] [Logout: 🔓]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Header - Disconnected State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Sparkles] Feel Space       [Connect: 🔗]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mobile Bottom Navigation - Connected State

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Home]  [Arcade]  [Sessions]  [History]                   │
│   🏠      🎮        ⚡           📋                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mobile Bottom Navigation - Disconnected State

```
(NOT DISPLAYED - Hidden when wallet is not connected)
```

---

## Component Hierarchy

```
Layout
├── Desktop Nav (hidden on mobile)
│   ├── Logo (Link to /)
│   ├── Flex Spacer (flex-1)
│   └── When Connected:
│       ├── Nav Links Container
│       │   ├── Arcade Button
│       │   ├── Sessions Button
│       │   └── History Button
│       ├── Divider (w-px h-8 bg-slate-200)
│       ├── Balance Display
│       │   ├── "FEELS" label
│       │   └── Balance value
│       ├── Address Display
│       │   ├── Green dot (online indicator)
│       │   └── Truncated address
│       └── Logout Button
│   └── When Not Connected:
│       └── Connect Wallet Button
│
├── Mobile Header (hidden on desktop)
│   ├── Logo
│   └── When Connected:
│       ├── Balance (compact)
│       └── Logout Button
│   └── When Not Connected:
│       └── Connect Button
│
├── Main Content
│   └── {children}
│
├── Mobile Bottom Nav (hidden on desktop, only when connected)
│   ├── Home Link
│   ├── Arcade Link
│   ├── Sessions Link
│   └── History Link
│
├── Wallet Modal (shared globally)
│
└── Toaster (notifications)
```

---

## CSS Classes & Layout Details

### Desktop Navigation Container
```css
nav.w-full.px-4.md:px-6.py-4.md:py-6.hidden.md:flex.justify-between.items-center.z-10.bg-white.gap-4
/* 
  - w-full: Full width
  - px-4 md:px-6: Padding (mobile 1rem, desktop 1.5rem)
  - py-4 md:py-6: Vertical padding
  - hidden md:flex: Hidden on mobile, flex on desktop
  - justify-between: Space between logo and content
  - items-center: Vertically centered
  - z-10: Stacking context
  - bg-white: White background
  - gap-4: 1rem gap between items
*/
```

### Navigation Links Container (when connected)
```css
div.flex.items-center.gap-3
/* All nav items grouped together */
```

### Divider
```css
div.w-px.h-8.bg-slate-200
/* 1px width, 2rem height, light gray color */
```

### Address Display
```css
div.flex.items-center.gap-2.bg-white.px-3.py-1.5.rounded-lg.border-2.border-black.shadow-flat-sm
/* Boxed display with border and shadow */
```

### Logout Button
```css
button.h-9.w-9.border-2.border-black.shadow-flat-sm.hover:shadow-none.hover:translate-y-[2px].transition-all.bg-destructive/10.hover:bg-destructive/20
/* Square button with shadow effect, red tint */
```

---

## Responsive Behavior

### Desktop (≥768px)
- Full horizontal navigation
- All items visible when connected
- Hidden items when disconnected
- Logo on left, actions on right

### Mobile (<768px)
- Logo + wallet control in header (sticky top)
- Bottom navigation bar (when connected)
- Navigation items stacked vertically
- Better thumb access at bottom
- Hidden when disconnected

---

## Animations & Transitions

### Logo Group Hover
```css
group-hover:translate-y-1 group-hover:shadow-none transition-all
/* Slight bounce effect on hover */
```

### Button Hover
```css
hover:bg-slate-50 hover:shadow-flat-sm hover:translate-y-[2px] transition-all
/* Subtle shadow and translate effect */
```

### Online Indicator
```css
animate-pulse
/* Blinking green dot */
```

---

## State Management Flow

```
useWeb3() Hook
    ↓
{
  isConnected: boolean,
  address: string | null,
  balances: { FEELS: number },
  disconnect: () => void,
  ...
}
    ↓
Layout Component
    ↓
Conditional Rendering:
  - if (isConnected) → Show nav links
  - if (isConnected) → Show bottom nav (mobile)
  - if (!isConnected) → Show login gate
    ↓
Navigation Update → All child pages update
```

---

## Color & Styling Reference

### Button States

**Active Route:**
```css
bg-slate-100 border-black
/* Highlighted background */
```

**Inactive Route:**
```css
border-transparent hover:bg-slate-50
/* Subtle hover effect */
```

**Connect Button:**
```css
bg-primary text-white font-bold border-2 border-black shadow-flat
/* Primary color with shadow */
```

**Logout Button:**
```css
bg-destructive/10 hover:bg-destructive/20
/* Red tint, semi-transparent */
```

---

## Accessibility Features

- ✅ Semantic HTML (`<nav>`, `<main>`)
- ✅ Proper link elements (`<Link>`)
- ✅ Button elements with proper semantics
- ✅ Color contrast (black borders on white)
- ✅ Hover states for all interactive elements
- ✅ Responsive design (mobile-first)
- ✅ Icon + text labels for clarity
- ✅ Loading states (online indicator)

---

## Testing Navigation

### Desktop Testing
- [ ] Nav links visible when connected
- [ ] Nav links hidden when disconnected
- [ ] Hover effects work smoothly
- [ ] Links navigate to correct pages
- [ ] Active page highlights
- [ ] Logout button works
- [ ] Responsive at breakpoint (768px)

### Mobile Testing
- [ ] Header displays correctly
- [ ] Balance shows in header when connected
- [ ] Bottom nav appears when connected
- [ ] Bottom nav hidden when disconnected
- [ ] All 4 nav items accessible
- [ ] Navigation icons display properly
- [ ] Touch targets are large enough (≥44px)

### Functional Testing
- [ ] Connect wallet updates display
- [ ] Balance updates after logging emotion
- [ ] Address truncation is correct
- [ ] Logout clears everything
- [ ] Redirect works on disconnect
- [ ] Page refresh maintains state

---

## Visual Examples

### Balance Display Format
```
   FEELS
    10

(Small gray label above larger number)
```

### Address Display Format
```
  🟢 0x1234...5678

(Green dot + truncated address)
```

### Divider
```
Arcade | Sessions | History ─── 10 FEELS
                   └─────────────┘
                    (vertical line)
```

---

