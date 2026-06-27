# Push The Pin v1 — Phase-wise Implementation

This is the build order. Follow it top to bottom. Each phase compiles and runs on its own and meets its acceptance check before the next begins. Do not refactor earlier phases while building later ones. Do not add scope beyond PRS.md. When in doubt, stop and ask.

---

## Stack and rationale

| Choice | Why |
|---|---|
| Vite + React + TypeScript | fast prototype build, types keep the pin model honest across phases |
| Tailwind CSS | tokens from DESIGN_SYSTEM.md map cleanly to a config, no stray hardcoded values |
| react-router-dom | the four surfaces are route groups, see the IA in PRS.md |
| lucide-react | the icon set named in the design system, also the pin glyphs |
| framer-motion | the micro-interaction catalogue, springs and reveals |
| react-leaflet + leaflet + leaflet.markercluster | real map, real clustering, both are things v1 must test honestly |
| navigator.vibrate, capability-checked | haptics as enhancement, silent no-op on unsupported platforms |
| localStorage seed with hard reset | data survives reload if convenient, always resettable to clean seeded state |

No Redux, no component kit, no backend. If a real need appears for anything beyond this, raise it, do not add it silently.

## Folder structure

```
src/
  main.tsx
  App.tsx                 router and shell
  styles/
    tokens.css            css variables from DESIGN_SYSTEM.md
    grain.ts              optional paper grain layer
  types/
    pin.ts                Pin, PinType, CivicStatus, Collage, BuildingPost
    events.ts             the instrumentation event log types
  data/
    seed.ts               seeded Bandra pins, building, gov mock, business mock
    store.ts              localStorage load, save, reset, the event log
    cluster.ts            the H-West cluster definition and helpers
  lib/
    haptics.ts            capability-checked vibrate
    log.ts                fire and read behaviour events
    scenario.ts           Test Console presets and state drivers
  components/             isolated primitives, tokens only
  routes/
    onboarding/
    app/
      pulse/
      gather/
      create/
      pin/
      collage/
      building/
      profile/
    whatsapp/
    business/
    gov/
    admin/
    console/              hidden Test Console, tester only
```

## Guardrails for every phase

- Tokens only. No hardcoded hex, radius, or spacing in components. Pull from tokens.css and the Tailwind config.
- No real names anywhere. Author labels are always anonymous strings from the seed.
- Civic is the only type with status, tracker, routing, or collage. Do not add lifecycle to other types.
- The map is real, the data is mock. The gov dashboard is labelled vision and never wired to anything.
- Every interactive element has a 44 minimum target, a focus ring, and an accessible name.
- Motion respects prefers-reduced-motion. Haptics are capability-checked.
- Each phase leaves the app running. No half-wired states carried across a phase boundary.

---

## Phase 0 — Scaffold

Goal: an empty app that builds and routes.

Build:
- Vite React TS project, Tailwind installed and configured.
- src/App.tsx with react-router and the full route table from the IA, each route a placeholder screen showing its name.
- A basic shell that renders the resident app routes under /app and standalone routes for /whatsapp, /business, /gov, /admin, /onboarding.

Acceptance: every route in the IA loads a named placeholder, no console errors, app builds clean.

## Phase 1 — Tokens and primitives

Goal: the design system exists as code before any feature uses it.

Build:
- styles/tokens.css with every colour, radius, spacing, and elevation token from DESIGN_SYSTEM.md as CSS variables, wired into the Tailwind config.
- Fonts loaded: Bricolage Grotesque (display), Hanken Grotesque (body).
- The optional grain layer.
- components: Button, Chip, TextInput, Textarea, BottomSheet, Card, EmptyState, Toast. Each in its own file, tokens only, with the focus ring and min tap target baked in.

Acceptance: a temporary kitchen-sink route renders every primitive in its states, all using tokens, AA contrast holds, keyboard focus visible.

## Phase 2 — Data layer and seed

Goal: believable Bandra data exists and survives a reload, with a clean reset.

Build:
- types/pin.ts: the full Pin model from PRS section 5, PinType union, CivicStatus union, Collage, BuildingPost, BusinessPost.
- data/cluster.ts: the H-West cluster, centre near 19.0596, 72.8295, a loose bounding area over Bandra West.
- data/seed.ts: the seeded pins in the appendix below, the example building, the gov mock numbers, the business mock.
- data/store.ts: load from localStorage or seed on first run, save, and a hard reset that restores clean seeded state.
- lib/log.ts and types/events.ts: the behaviour event log, fire and read.

Acceptance: seeded data loads, a reset restores it, the Waroda Road three-report civic collage and the single-report civic pins are present, all author labels are anonymous, the event log records an app-open.

Note for later phases: route every state mutation (pin status changes, expiry, seeding, overrides) through store.ts. The Test Console in the final phase drives the prototype entirely through these functions, so if state is only ever changed through the store, the console needs no refactor of earlier work.

## Phase 3 — Pulse, the map and clustering

Goal: the home surface, alive on first load.

Build:
- routes/app/pulse: react-leaflet map centred on Bandra West, a light warm tile style, seeded pins rendered as the custom markers from the design system, real clustering via leaflet.markercluster.
- The custom pin markers: shared base, per-type head shape, colour, and lucide glyph. The cluster bubble with a count. The collage marker as stacked heads with a count badge.
- Type filter chips across the top, All plus the six types, each carrying its colour, filtering map and list.
- A map and list toggle, list is newest-first within the cluster.
- The floating bottom nav, five slots, Create raised in the centre.
- Empty state for a filter with no results.

Acceptance: the map opens populated, clustering collapses and springs open, filters work on both map and list, the collage marker is visibly grouped, the bottom nav floats and navigates, filter changes are logged.

## Phase 4 — Pin detail and the create flow

Goal: open any pin, and create all six types.

Build:
- routes/app/pin/:id: the detail bottom sheet. Non-civic shows content and expiry. Civic shows content and a placeholder for the tracker (wired in Phase 5).
- routes/app/create: the type chooser, six large colour-and-shape-coded options, then the branched form per type from PRS section 7.3.
- The location confirm widget: GPS point, accuracy circle, draggable nudge, phone-native accuracy only.
- The photo upload tile, treating photos as metadata-stripped.
- Submit: civic enters at submitted, non-civic appears immediately with an expiry. The pin-drop motion and haptic on submit.

Acceptance: every type can be created end to end and appears on the map and list, civic lands at submitted, the pin-drop beat fires with its haptic, create-started and create-completed are logged by type.

## Phase 5 — The civic loop, tracker, and collage

Goal: the core. A civic pin runs the full lifecycle and same-geocode reports group.

Build:
- The civic status tracker component: submitted, in review, routed, waiting, resolved, closed, with the completed fill, the gently pulsing active step, and honest elapsed time under the active step.
- Wiring the tracker into the civic pin detail, reading status and statusHistory.
- The resolution moment: adding a resolution photo sets resolved, before and after shown together, the warmer success motion and haptic.
- Neighbour confirmation: a confirm action increments the count and moves to closed.
- routes/app/collage/:groupId: the grouped view, fanned heads, grouped photos, the count, and the elapsed time between first and latest report.
- The upvote-or-add prompt when a new civic report matches type and geocode, with the pin-adjustment nudge.

Acceptance: a seeded civic pin walks submitted through closed, the resolution reveal fires its beat, the Waroda Road collage opens and shows three reports with elapsed time, a new same-spot same-type report triggers the upvote-or-add prompt, reaching resolved is logged.

## Phase 6 — Gather and building communities

Goal: events as a filtered read, and per-building spaces.

Build:
- routes/app/gather: a friendly list and map of event-type pins, what, when, where, anonymous host, and an I am interested tap with a count. Events expire cleanly.
- routes/app/building: register a building or join one, then a private building feed for building happenings, separate from Pulse, anonymity held (flat or floor at most, optional). Seed one example building.

Acceptance: Gather shows only events and they expire correctly, a building can be registered and joined, the building feed is separate from Pulse and never leaks into it, building-joined is logged.

## Phase 7 — WhatsApp imitation (VIPIN)

Goal: the real civic bot conversation, not a generic chat.

Build:
- routes/whatsapp: a WhatsApp-styled conversation that plays the full civic loop with VIPIN, report through the dead-zone wait to the resolution photo. VIPIN bubbles left with the avatar, resident replies right. Scripted branches for filing a report, the routed confirmation with a mock reference id, the honest waiting copy, and the resolution.
- The mini-survey micro-prompt appears at its scripted moment in the conversation too.

Acceptance: the conversation plays the whole loop, VIPIN voice matches the rules in CLAUDE.md, the waiting period reads as honest and calm, the resolution lands.

## Phase 8 — Business dashboard

Goal: a real, simple self-serve surface.

Build:
- routes/business: a mock sign-in, then post to the feed, an offer, event, or notice, clearly marked as from a business, never disguised as a resident.
- routes/business/stats: simple mocked reach numbers.
- Copy reflects the honest constraint: posting does not buy rank.

Acceptance: a business post appears in Pulse marked as a business, stats render, nothing implies paid ranking.

## Phase 9 — Government vision dashboard

Goal: the pitch surface, clearly a preview, mock data only.

Build:
- routes/gov: labelled as a vision or preview surface throughout. Reports by category and area, time-to-resolution, the gap between filed and genuinely fixed, and the neighbour-confirmed resolution rate framed as the honest number. The framing line: a verification and closure layer on top of BMC intake, not another intake channel.

Acceptance: the dashboard renders on mock data, is unmistakably labelled as vision, and is wired to nothing real.

## Phase 10 — Onboarding, profile, settings, accessibility pass

Goal: the way in, and the controls.

Build:
- routes/onboarding: welcome with VIPIN, phone identity with an always-succeeds mock OTP, the tiered location ladder with a working denied-permission fallback to the cluster centre, the anonymity explainer as its own calm moment, then land in Pulse.
- routes/app/profile: an anonymous self view of your own pins and their status, settings for location and notifications (mocked), the text-size control that scales the whole interface, and the prototype data reset.
- An accessibility sweep across everything built so far: tap targets, focus order, accessible names, AA contrast, prefers-reduced-motion, colour-not-sole-signal.

Acceptance: onboarding completes including a denied-location path that still works, the text-size control scales the whole app, reduced-motion is honoured app-wide, a keyboard and screen-reader pass finds labelled controls and a sensible order, onboarding steps are logged.

## Phase 11 — Micro-interactions, haptics, illustration, polish

Goal: make it feel intentional, not gimmicky.

Build:
- lib/haptics.ts wired to the catalogue in DESIGN_SYSTEM.md, capability-checked.
- The full motion catalogue: chip fills, type-select settle, the pin-drop beat, tracker sweep, resolution reveal, cluster spring, collage fan, confirm pulse.
- VIPIN illustration set and the warm onboarding and empty-state pieces.
- A polish pass for rhythm, spacing, and the grain layer.

Acceptance: every moment in the catalogue fires its motion and haptic, reduced-motion and no-vibrate degrade cleanly, nothing feels showy, the resolution moment clearly reads as the emotional peak.

## Phase 12 — Instrumentation surfacing and edge states

Goal: the behaviour data is readable, and nothing dead-ends.

Build:
- A hidden or admin-accessible debug view that renders the event log so a run can be read after.
- The admin moderation view at /admin: a queue of submitted pins, approve or kill, standing in for neighbour validation.
- All empty, edge, and honest states from PRS section 10: empty filter, denied location, single-report collage, the dead-zone wait, expired pins, first-ever post.

Acceptance: the event log is inspectable and shows a realistic session, admin approve and kill move pins correctly, every edge state renders calmly with no broken screens.

## Phase 13 — Test Console

Goal: a hidden tester control panel that drives the whole prototype, built last because it sits on top of every state that now exists. It changes no product behaviour, it only drives the existing store and router.

Build:
- routes/console: a full-height overlay, deliberately off-brand and utilitarian per DESIGN_SYSTEM.md section 11, reached by a triple-tap on the top-right corner, the /console route, or a desktop keyboard combo.
- lib/scenario.ts: the preset definitions and the state-driver functions, all calling through store.ts.
- The control sections from PRS section 11: Navigate, Scenarios, Civic lifecycle, Data lenses, Persona lens, Accessibility overrides, Surface toggles, Time control, Instrumentation, Reset.

Acceptance: every control section drives the running prototype, the scenario presets set their known states, a civic pin can be forced to any status with custom elapsed time and confirmations, the persona and accessibility lenses apply live, the event log is viewable and exportable, reset returns clean seeded state, and the console is unreachable from any resident navigation.

---

## Appendix — seed data

One cluster, H-West Bandra West, centre near 19.0596, 72.8295. All author labels anonymous. Coordinates are believable points on real Bandra West streets. The Waroda Road trio shares a geocode to seed the collage. Most civic pins are single reports so the common path dominates.

| type | category | title | lat | lng | status / note |
|---|---|---|---|---|---|
| civic | pothole | Open drain cover near St Andrew lane | 19.0548 | 72.8265 | routed, group member, 9 days elapsed |
| civic | garbage | Garbage not cleared, Waroda Road corner | 19.0548 | 72.8265 | routed, same group |
| civic | garbage | Pile building up again, Waroda Road | 19.0548 | 72.8265 | submitted, same group, makes a 3-report collage |
| civic | water | Water logging at Hill Road junction | 19.0531 | 72.8289 | resolved, has after-photo, neighbour confirmed |
| civic | streetlight | Streetlight out near Pali Naka | 19.0611 | 72.8291 | submitted |
| civic | footpath | Broken footpath tile, Turner Road | 19.0580 | 72.8330 | waiting, 4 days elapsed |
| event | — | Sunday morning cleanup walk, Carter Road | 19.0662 | 72.8201 | expires after event |
| event | — | Open mic tonight at a Ranwar cafe | 19.0556 | 72.8271 | expires tonight |
| event | — | Society Ganpati planning meet | 19.0590 | 72.8300 | expires this week |
| help | — | Anyone have a ladder I can borrow for an hour | 19.0561 | 72.8331 | expires in a day |
| help | — | Lost grey tabby near Veronica Road | 19.0540 | 72.8280 | expires in a few days |
| sell | — | Barely used study table | 19.0596 | 72.8295 | expires in a week |
| buy | — | Looking for a second-hand cycle | 19.0650 | 72.8270 | expires in a week |
| service | — | Maths and science home tutor available | 19.0441 | 72.8191 | longer expiry |

Example building: a named society somewhere central in the cluster, with two or three seeded building-feed posts (a lift notice, a water tanker timing, a Ganpati planning note), residents labelled by flat at most.

Business mock: one local business with a sample offer post and mocked reach numbers.

Government mock: category and area counts, a headline filed number, a much smaller genuinely-fixed number, and the neighbour-confirmed rate shown as the honest figure, reflecting the field-test lesson that headline resolution numbers are inflated.
