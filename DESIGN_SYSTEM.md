# Push The Pin v1 — Design System

The look is calm, characterful, trustworthy, and a little proud. A well-kept community noticeboard that a 16 year old and a 70 year old both feel at home in. Warm paper, a confident blue, soft rounded shapes, motion that makes actions feel solid. Never the angry activist-app look, never the cold corporate-app look. Both kill trust in a neighbourhood.

The design references provided are mood and style only. Take the warmth, the rounded geometry, the bold-but-friendly display type, the map-first layout, and the stepped tracker idea. Do not lift any names, places, logos, copy, or layout wholesale.

---

## 1. Brand foundation

The blue house with eyes is a style cue for the whole UI: a home that looks back at you, watchful and friendly. Carry that feeling into shapes and the mascot, but the house itself is not the mascot.

VIPIN is the mascot and the bot. A small, simple, line-drawn neighbour. Warm, plain, local. VIPIN appears in onboarding, empty states, the waiting period, and as the WhatsApp avatar. A few expressions are enough: hello, patient, pleased. Keep VIPIN minimal and hand-quality, never a polished corporate character.

Voice: calm, factual, local, a little proud. Short sentences, plain words. Never problems or complaints, use report, thing, update, fixed, sorted. No exclamation spam, no buzzwords.

## 2. Colour

A warm paper base so the screen feels human, a confident cobalt as the trust colour, coral for warmth and social energy, green for resolution and good news, amber for patient waiting. The psychology is deliberate: cobalt reads as dependable and civic without being cold, the paper base lowers the clinical feel that makes people distrust civic-tech, green is reserved for the resolution moment so it lands as a reward, amber holds the waiting period as calm patience rather than alarm. Red is used sparingly and never as a default state, because a feed that reads red feels like a complaint box.

### Core tokens

| Token | Hex | Role |
|---|---|---|
| paper | #F4EEE3 | app background, warm off-white |
| paper-raised | #FBF7EF | cards and sheets sitting on paper |
| ink | #211D17 | primary text, warm near-black |
| ink-soft | #5A554C | secondary text |
| ink-faint | #8E887C | tertiary text, hints |
| cobalt | #2B43E6 | primary, civic, trust, primary buttons |
| cobalt-deep | #1E31B0 | pressed and active cobalt |
| coral | #F4633A | events, warmth, social accents |
| green | #2E9E6B | resolved, success, positive |
| amber | #E8A93C | waiting state, gentle attention |
| line | #E3DCCE | hairlines and borders on paper |

### Pin type colours

Each type has a unique hue, always paired with a unique shape and a label, so colour is never the only signal.

| Type | Hex | Paired shape and glyph |
|---|---|---|
| civic | #2B43E6 cobalt | rounded-square head, lucide Flag |
| event | #F4633A coral | notched-top head, lucide CalendarDays |
| help | #E8A93C amber | round head, lucide Hand |
| sell | #2E9E6B green | tag-shaped head, lucide Tag |
| buy | #2B9EA6 teal | round head, lucide ShoppingBag |
| service | #7A5AD8 purple | soft-square head, lucide Wrench |

All six are tested for AA contrast against paper for their labels. Resolution green is reserved, do not reuse the resolved green as the sell green in a way that confuses the two contexts, keep sell slightly distinct in usage even though the hex is shared, prefer the shape and label to carry meaning.

### Status colours for the civic tracker

| Status | Colour |
|---|---|
| submitted, in_review | ink-soft |
| routed | cobalt |
| waiting | amber |
| resolved | green |
| closed | green, filled, with a confirm count |

## 3. Typography

A bold rounded display for personality, a clean grotesque for body legibility. Both are free on Google Fonts.

- Display: Bricolage Grotesque, weights 600 to 800. Headings, the create type chooser, the resolution moment, VIPIN lines.
- Body and UI: Hanken Grotesque, weights 400 to 700. Everything else, including numerals (use tabular figures for the tracker and counts).

### Scale (mobile-first, px / line-height)

| Token | Size / line | Use |
|---|---|---|
| display-l | 32 / 36 | onboarding, resolution moment |
| display-m | 26 / 30 | screen titles |
| title | 20 / 26 | card titles, section heads |
| body-l | 18 / 26 | primary reading, pin body |
| body | 16 / 24 | default UI text, minimum body size |
| caption | 14 / 20 | metadata, timestamps |
| micro | 12 / 16 | tiny labels and chips only |

### Rules
- Sentence case everywhere. Caps reserved for micro labels at most.
- Body line length 60 to 70 characters, never wider.
- Left align body text, never centre long passages.
- One display weight per screen, do not mix three weights of display in one view.
- Vertical rhythm on a 4px grid, consistent spacing between text blocks.
- Minimum body size is 16, and the text-size control scales the whole interface up from there.
- Tabular figures for the tracker, counts, and elapsed-time displays so numbers do not jitter.

## 4. Spacing, radius, elevation, grain

Spacing base 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48.

Radius, slightly rounded, echoing the rounded-square language in the references.

| Token | px | Use |
|---|---|---|
| radius-sm | 8 | inputs, small chips |
| radius-md | 12 | buttons, list cards |
| radius-lg | 16 | cards, the pin detail |
| radius-xl | 24 | bottom sheets, large surfaces |
| radius-pill | 999 | filter chips, the bottom nav |

Elevation: soft and warm, low spread, never harsh black shadows. Two levels.
- elevation-1: cards on paper, a faint warm shadow.
- elevation-2: floating bottom nav, sheets, the create FAB.

Grain: a subtle paper noise overlay on the paper background at very low opacity, around 3 to 5 percent, fixed and non-animated. It exists to warm the surface, not to be noticed. Make it a single CSS layer that can be switched off cheaply if it costs performance.

## 5. Iconography

lucide-react throughout, for now. Default size 24, large actions 28, inline 20. Stroke consistent with lucide defaults. Every icon that carries meaning also carries a text label or accessible name. Pin glyphs sit inside the custom pin shapes, listed in section 2.

## 6. The pin system

This is the signature visual. The product is called Push The Pin, so the pin and the act of placing it carry the brand.

### Marker anatomy
A shared base: a marker with a rounded head holding a type glyph, narrowing to a point that anchors exactly on the geocode. The head silhouette varies by type (rounded square, notched top, round, tag, soft square) so type is readable by shape alone at a glance, with colour reinforcing and the glyph confirming. Markers cast a soft shadow on the map so they feel placed, pushed in.

### Clustering bubble
When pins are dense, they collapse into a rounded bubble (a soft rounded-square blob, echoing the reference shapes) showing a count. A single-type cluster carries that type's colour at low saturation, a mixed cluster is neutral ink with a thin ring. Tapping springs it open into its members.

### Collage marker (civic only)
A grouped set of same-type civic reports at one geocode reads as layered pin heads, visibly stacked, with a small count badge. Opening it fans the heads out and shows the grouped photos and the elapsed time between first and latest report.

### States
- default, pressed (slight scale down), selected (lifts, gains a ring in its type colour), resolved civic (green check overlay on the head).

## 7. Components

Build these as isolated primitives, tokens only, no hardcoded colour or radius.

- Button: primary (cobalt fill, paper text), secondary (paper-raised, cobalt text, line border), ghost (text only). Pill or radius-md. Min height 48 for primary.
- Filter chip: pill, carries type colour when active, neutral with a thin line when inactive.
- Create FAB: the centre nav action, raised, cobalt, the primary act of the product.
- Floating bottom nav: a pill bar floating over the map with five slots, Pulse, Gather, Create (centre, raised), Building, Profile. elevation-2. Gives way on focused tasks.
- Pin card (list view): photo thumb if present, title, type chip, anonymous author label, timestamp or elapsed time, distance.
- Pin detail sheet: a bottom sheet, radius-xl, with the pin content and, for civic, the status tracker.
- Civic status tracker: a horizontal stepped tracker, submitted, in review, routed, waiting, resolved, closed. The completed portion fills in the status colour, the active step pulses gently, elapsed time shown honestly under the active step. Modelled on a clean progress tracker, not a loud progress bar.
- Bottom sheet: the workhorse surface for detail and create, radius-xl, drag handle, dismissable, but every action inside also reachable without the drag gesture.
- Text input and textarea: radius-sm, generous padding, clear focus ring.
- Photo upload tile: a friendly dashed tile, treats the photo as metadata-stripped, shows a preview.
- Location confirm widget: a small map with the GPS point and its accuracy circle, the point draggable to nudge. Phone-native accuracy, no custom snapping.
- VIPIN message bubble: for the WhatsApp route, a warm left-aligned bubble with the VIPIN avatar, resident replies on the right.
- Survey micro-prompt: a small non-blocking card, one question, two or three tap options, dismissible.
- Empty state: VIPIN plus one calm line, never a blank screen.
- Toast and confirmation: brief, warm, paired with the right haptic.

## 8. Micro-interactions and haptics

Motion exists to make actions feel solid and intentional, and to mark the emotional beats. It is never decoration. All motion via framer-motion. All haptics via navigator.vibrate behind a capability check, with a silent no-op where unsupported (iOS Safari never vibrates, that is expected and fine).

### Catalogue

| Moment | Motion | Haptic |
|---|---|---|
| Filter chip select | chip fills, slight scale | tick |
| Create type select | card lifts, glyph settles | tick |
| Pin drop on submit | marker drops onto the map with a small bounce, the signature push-the-pin beat | confirm |
| Civic submit confirmed | VIPIN acknowledges, gentle settle | success |
| Tracker advances a step | the fill sweeps smoothly into the next step | tick |
| Resolution photo revealed | before and after cross-reveal, the emotional peak | success, warmer |
| Cluster expands | bubble springs open into members | tick |
| Collage opens | stacked heads fan out | tick |
| Neighbour confirms a fix | small green pulse on the closed step | confirm |

### Vibrate patterns (ms)
- tick: 10
- confirm: [15, 40, 25]
- success: [15, 30, 15, 30, 40]

### Reduced motion and capability
- prefers-reduced-motion: replace springs and reveals with fast fades or instant changes, never rely on motion to convey a state change, always pair it with a text or colour change too.
- No vibration support: everything works and reads identically, haptics are pure enhancement.

## 9. Illustration and map styling

Illustration: line-drawn, warm, on the paper base. Cobalt linework with coral and green spot colour, a slightly imperfect hand-quality so it feels human. Use for VIPIN, onboarding, empty states, and the anonymity explainer. Keep it light, a few small pieces, not a gallery. lucide icons cover functional needs, illustration covers the warm human moments.

Map: a light, warm, low-saturation base so the coloured pins are the content and the map recedes. Use a free light tile style (CARTO Positron is free and clean, or a comparable light style), optionally nudged warmer with a subtle CSS tint to sit on the paper palette. Never a dark or saturated map. The fully illustrated hand-drawn map look from the references is a possible Phase 2 skin, not v1, because clustering and geocode grouping must be tested on a real map.

## 10. Accessibility tokens, restated

- Minimum tap target 44 by 44, primary actions larger.
- Focus ring: cobalt, 2px, 2px offset, on every interactive element.
- Contrast AA minimum for all text and meaningful UI.
- Colour is never the only signal. Pin type is shape plus glyph plus label plus colour.
- Text-size control scales the whole interface from the 16px base up.
- prefers-reduced-motion fully honoured.
- Visible, logical keyboard focus order, accessible names on all icon buttons.

## 11. The Test Console, deliberately off-brand

The hidden Test Console (PRS section 11) is the one surface that must not look like Push The Pin. Style it as plain utility: a system or monospace font, tight rows, no paper warmth, no rounded character, a flat dark or stark background. The point is that a tester never confuses it with product UI and a stray screenshot never reads as the app. Function over feel. It does not use the brand tokens beyond what it needs to be legible.
