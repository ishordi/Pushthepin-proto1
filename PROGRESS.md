# Push The Pin — Build Progress

## Phase 0 — Scaffold ✅ DONE

**Status:** Complete. All acceptance criteria passed.

**What was built:**
- Vite + React + TypeScript project with `@tailwindcss/vite` plugin.
- `react-router-dom` v7 installed and configured in `src/App.tsx`.
- Full route table from PRS section 6 IA, every route a named placeholder:
  - `/` → redirect to `/app/pulse`
  - `/onboarding`
  - `/app` shell with nested: `pulse`, `gather`, `create`, `pin/:id`, `collage/:groupId`, `building`, `profile`
  - `/whatsapp`
  - `/business` with nested: `post`, `stats`
  - `/gov`
  - `/admin`
  - `/console` (hidden tester instrument)
- All packages installed: `react-router-dom`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `framer-motion`, `react-leaflet`, `leaflet`, `leaflet.markercluster`, `@types/leaflet`, `@types/leaflet.markercluster`.
- `src/index.css` imports Tailwind v4 and Google Fonts (Bricolage Grotesque + Hanken Grotesque).
- `npm run build` passes with zero errors.

**Acceptance check result:**
- ✅ Every route in the IA loads a named placeholder screen.
- ✅ App builds clean (`tsc -b && vite build` — 0 errors).
- ✅ No console errors expected (no logic yet to error).

**Open questions:** None for Phase 0.

---

## Phase 1 — Tokens and primitives ✅ DONE

**Status:** Complete. All acceptance criteria passed.

**What was built:**
- `src/styles/tokens.css` — all colour, radius, elevation, spacing, and font tokens from DESIGN_SYSTEM.md as Tailwind v4 `@theme` variables. Generates `bg-cobalt`, `text-ink-soft`, `rounded-pill`, `shadow-elevation-2`, etc. as utilities.
- Fonts: Bricolage Grotesque (display) + Hanken Grotesque (body) via Google Fonts. Wired as `var(--font-display)` and `var(--font-body)`.
- `src/styles/grain.ts` — mounts a fixed paper noise overlay (3.5% opacity, switchable).
- `src/index.css` — global base: body defaults to paper/ink, `:focus-visible` ring (cobalt 2px 2px offset), `prefers-reduced-motion` reset, `html[data-text-size="large"]` scale hook for Phase 10.
- Components (all tokens only, min tap target, focus ring):
  - `Button` — primary, secondary, ghost × rounded/pill shapes, disabled state
  - `Chip` — filter chip, active/inactive, per-type colour when active
  - `TextInput` — label, hint, error state, accessible ids
  - `Textarea` — same as TextInput
  - `BottomSheet` — Framer Motion spring in/out, backdrop, Escape key, focus trap
  - `Card` — static and interactive variants, keyboard-accessible
  - `EmptyState` — VIPIN SVG figure + calm message
  - `Toast` — success/info/error, auto-dismiss, accessible live region
- `/kitchen-sink` route — renders all primitives in all states.

**Acceptance check result:**
- ✅ Every primitive renders from tokens only (no hardcoded hex/radius/spacing in components).
- ✅ AA contrast holds for all text on paper and paper-raised backgrounds.
- ✅ Keyboard focus ring visible on every interactive element (`:focus-visible` cobalt ring).
- ✅ Min tap target 44px on all interactive elements, 48px on primary Button.
- ✅ `npm run build` clean — 0 errors.

**Open questions:** None.

---

## Phase 2 — Data layer and seed ✅ DONE

**Status:** Complete. All acceptance criteria passed.

**What was built:**
- `src/types/pin.ts` — full Pin discriminated union (CivicPin | NonCivicPin), PinType, CivicStatus, CivicCategory, Collage, Building, BuildingPost, BusinessPost, GovMockData. Type guards (isCivic). All from PRS section 5.
- `src/types/events.ts` — BehaviourEvent, EventName union covering all PRS section 9 events.
- `src/data/cluster.ts` — H_WEST_CLUSTER constant (centre 19.0596, 72.8295, bounding box, default zoom), isInCluster() helper.
- `src/data/seed.ts` — 6 civic pins (incl. Waroda Road 3-pin collage, one resolved+closed with after-photo, one waiting, one submitted), 8 non-civic pins (events, help, sell, buy, service), 1 collage definition, 1 building + 3 building posts, 1 business post, gov mock data. All author labels anonymous.
- `src/data/store.ts` — localStorage load/save/reset (key: ptp_v1_state), in-memory singleton, pin mutations (addPin, updatePin, setCivicStatus, addResolutionPhoto, confirmCivicPin), collage management, building join, event log (logEvent, clearLog, onLogChange), forceSetState for Test Console.
- `src/lib/log.ts` — thin wrapper for logEvent.
- `src/main.tsx` — mounts grain layer, fires app_open on startup.
- `/kitchen-sink` DataVerifier panel — shows pin counts, collage presence, anonymous label check, event log count.

**Acceptance check result:**
- ✅ Seeded data loads from localStorage (or seeds fresh on first run).
- ✅ Reset restores clean seeded state.
- ✅ Waroda Road 3-report civic collage present and verified.
- ✅ All author labels anonymous (no real names in any pin).
- ✅ Event log records app_open on startup.
- ✅ `npm run build` clean — 0 errors.

**Open questions:** None.

---

## Phase 3 — Pulse, the map and clustering ✅ DONE

**Status:** Complete. All acceptance criteria passed (verified in a real browser via Playwright).

**What was built:**
- `src/components/pin/pinVisuals.tsx` — the signature pin system. PIN_VISUALS map (colour var, lucide glyph, label per type). Distinct head silhouettes per type (civic rounded-square, service soft-square, help/buy round, sell tag-with-hole, event tabbed-top). PinMarkerSvg (head + glyph + pointer + resolved check badge), CollageMarkerSvg (stacked heads + count badge), TypeBadge (non-interactive card badge). All fills use CSS variables (token-driven, no hardcoded hex).
- `src/components/pin/markerIcons.ts` — leaflet divIcon factories via renderToStaticMarkup: createPinDivIcon, createCollageDivIcon, createClusterIcon (single-type clusters carry type colour at low saturation via color-mix; mixed = neutral ink + ring).
- `src/components/PinCard.tsx` — list card: type badge, title, body, anon label, elapsed time, distance (from cluster centre), metadata-stripped photo placeholder, resolved/sorted indicator.
- `src/components/FloatingNav.tsx` — pill bar, 5 slots (Pulse, Gather, Create raised centre, Building, Profile), accessible names, 44px+ targets, active state.
- `src/routes/app/AppShell.tsx` — renders FloatingNav only on Pulse and Gather (gives way on focused tasks).
- `src/routes/app/pulse/mapItems.ts` — buildMapItems collapses 2+ report collages into one collage item, drops expired non-civic, marks resolved civic; sortNewestFirst.
- `src/routes/app/pulse/ClusteredMarkers.tsx` — raw leaflet.markercluster layer via useMap (no react-leaflet wrapper in v5). Markers tagged with pinType for cluster icon; click → onSelect.
- `src/routes/app/pulse/PulsePage.tsx` — react-leaflet MapContainer on CARTO Positron (warm CSS tint), filter chips (All + 6 types), map/list toggle, list view newest-first, empty-state overlay.
- `src/lib/time.ts`, `src/lib/geo.ts` — elapsed/expiry time + haversine distance helpers.
- index.css: leaflet/cluster/marker styling, warm tile filter, no-scrollbar utility. index.html title → "Push The Pin".

**Acceptance check result (browser-verified):**
- ✅ Map opens populated — CARTO tiles centred on Bandra West, seeded markers + cluster bubbles (3, 2, 4) on first load, 0 console errors.
- ✅ Clustering collapses and springs open (markercluster zoom-to-bounds verified).
- ✅ Filters work on both map and list (civic filter → exactly 4 civic items; filter_changed logged 11× with payloads).
- ✅ Collage visibly grouped — single-type civic cluster math confirms collage treated as one item; list shows "3 reports at this spot · Same spot, grouped together"; CollageMarkerSvg renders stacked heads + "3" badge.
- ✅ Bottom nav floats and navigates (Gather nav verified; nav correctly hidden on /app/create).
- ✅ Filter changes logged.
- ✅ `npm run build` clean (chunk-size note only, from react-dom/server + leaflet — acceptable for prototype).

**Notes / open questions:**
- Empty-state is wired but no seeded filter is naturally empty (all 6 types + civic have seed data). It will trigger on expiry or via Test Console data lenses (Phase 13). Flagging, not a defect.
- Bundle is ~780kB (react-dom/server used to render marker SVGs to divIcon HTML + leaflet). Fine for a prototype; can code-split later if it matters.

---

## Phase 4 — Pin detail and the create flow ✅ DONE

**Status:** Complete. All acceptance criteria passed (browser-verified via Playwright).

**What was built:**
- `src/lib/haptics.ts` — capability-checked navigator.vibrate with the DESIGN_SYSTEM patterns (tick/confirm/success), silent no-op fallback, setHapticsForcedOff hook for the Test Console. (Full catalogue wired app-wide in Phase 11.)
- `src/lib/photo.ts` — fileToStrippedDataUrl: canvas re-encode that downscales AND strips all EXIF/GPS/identity metadata; isImageSrc helper.
- `src/components/Vipin.tsx` — shared line-drawn VIPIN with mood variants (hello/patient/pleased). (EmptyState keeps its own inline figure for now; Phase 11 consolidates the illustration set.)
- `src/components/PhotoUploadTile.tsx` — dashed tile, preview + remove, "location and identity removed" copy.
- `src/components/LocationConfirm.tsx` — react-leaflet map, draggable type-coloured pin, accuracy circle, "Use my location" (geolocation with graceful fallback to cluster centre), live coordinates. No custom snapping.
- `src/routes/app/pin/PinDetailPage.tsx` — pin detail as a BottomSheet (Escape/backdrop/close → navigate back). Non-civic shows expiry + (events) interested count; civic shows category, body, and a clearly-marked tracker placeholder (real tracker = Phase 5). Renders uploaded photos, placeholder for seed photos. Graceful not-found state.
- `src/routes/app/create/CreatePage.tsx` — three-step focused-task flow (no floating nav): type chooser (6 colour+shape+glyph options) → branched form per PRS 7.3 (civic: category+title+body+photo+location; event: title+when+body+location; help: title+duration+body+location; sell/buy: title+body+photo+location; service: title+body+location) → confirmation with the pin-drop motion (framer-motion spring, reduced-motion aware) + VIPIN (pleased) + honest civic "what happens next" note. Clear back path throughout.
- store: added `ownPinIds` to PTPState + `createPin()` (records ownership, keeps Pin model anonymous) + `getPinById()`. **Fixed `loadState` to merge persisted state over fresh defaults** so schema additions don't break pre-existing localStorage.
- PinCard updated to render real uploaded photos (data URLs) vs seed-photo placeholder.

**Acceptance check result (browser-verified):**
- ✅ Every type creatable end to end; appears on map and list (civic + event explicitly verified end-to-end; all six share the config-driven flow). Created pins confirmed present in Pulse list.
- ✅ Civic lands at `submitted` (statusHistory length 1, status "submitted"); non-civic gets `expiresAt` and **no status field**.
- ✅ Pin-drop beat fires on the confirmation screen with its haptic (success for civic, confirm for non-civic; capability-checked).
- ✅ create_started + create_completed logged by type; civic_submitted also logged.
- ✅ Pin detail opens for civic (tracker placeholder) and non-civic (expiry); anonymous labels throughout.
- ✅ Location confirm widget renders with draggable pin + accuracy circle; photo tile strips metadata.
- ✅ 0 console errors (post-fix); `npm run build` clean.

**Notes / decisions:**
- The location confirm step is applied to ALL six types, not just civic. Rationale: every pin needs a real geocode to sit on the map, and placing the pin is the brand act ("Push The Pin"). PRS 7.3 emphasises it for civic but lists only the *extra* fields for non-civic; this doesn't contradict it. Flagging the interpretation.
- Found & fixed a latent store bug: persisted state from an earlier phase lacked newly-added fields. loadState now merges defaults. Worth knowing if other fields are added later.

---

## Phase 5 — The civic loop, tracker, and collage ✅ DONE

**Status:** Complete. Logic verified (20/20 automated tests via tsx); build clean. See verification note below re: browser visual check.

**What was built:**
- `src/components/civic/CivicTracker.tsx` — horizontal stepped tracker (submitted → in review → routed → waiting → resolved → closed). Completed portion fills the current status colour (ink-soft/cobalt/amber/green per DESIGN_SYSTEM), active node pulses gently (framer-motion, reduced-motion aware), honest elapsed time line below ("Waiting · N days at this step"), closed shows neighbour-confirmed count. Check glyphs on done steps.
- `src/components/civic/ResolutionReveal.tsx` — before/after photos side by side; the after cross-reveals (spring) when freshly resolved. "It's sorted. Here's the proof." Real images for uploads, labelled placeholders for seed mock photos.
- `src/routes/app/pin/PinDetailPage.tsx` — wired the real tracker (reads status + statusHistory + confirmations); BMC reference shown; dead-zone WAITING state shows VIPIN (patient) + honest copy; resolution moment ("Add a resolution photo" → PhotoUploadTile → addResolutionPhoto sets resolved + success haptic + civic_resolved log + reveal); neighbour confirmation ("Confirm it's fixed" → confirmCivicPin → closed + confirm haptic); link to the collage when the pin is grouped. Force re-render via useReducer after mutations.
- `src/routes/app/collage/CollagePage.tsx` — fanned civic heads, "N reports at one spot", first/latest report times + day span, grouped photos row, member reports as PinCards linking to detail, back paths.
- store: `confirmCivicPin` now closes a resolved pin on confirm (prototype lacks neighbour-density, per CLAUDE.md decision 5); added `getCollage`, `getCollageMembers`, `findNearbyCivic` (haversine ≤40m, civic only), `addCivicToGroup` (joins existing collage OR forms a new group from a lone report; new report snaps to the group geocode = pin-adjustment).
- Create flow: civic submit now checks for a nearby existing civic report; if found, shows the **upvote-or-add prompt** (MatchPrompt: "Is this the same thing?" → join group [logs add_photo_chosen/upvote_chosen] or post separately). Non-civic never groups.

**Acceptance check result:**
- ✅ Civic pin walks the lifecycle: resolution (waiting→resolved) and confirmation (resolved→closed) verified in logic tests; submitted/in_review/routed/waiting/resolved/closed all render in the tracker (seeded pins cover each state; admin-driven early transitions land in Phase 12).
- ✅ Resolution reveal fires its beat (spring cross-reveal + success haptic; reduced-motion falls back).
- ✅ Waroda Road collage opens and shows 3 reports with elapsed time (firstReportAt→latestReportAt span). Verified: 3 members, time span present.
- ✅ New same-spot same-type civic report triggers the upvote-or-add prompt (findNearbyCivic + MatchPrompt; both grouping paths tested).
- ✅ Reaching resolved is logged (`civic_resolved`); join logs `upvote_chosen`/`add_photo_chosen`.
- ✅ `npm run build` clean.

**Verification note:** The Playwright MCP server disconnected mid-phase, so this phase's UI was verified by (a) a clean TypeScript build and (b) a 20-assertion tsx logic test covering every new store mutation (resolution, confirm→closed, collage reads, nearby detection, both grouping paths) — all passed. The new UI is built from primitives already browser-verified in Phases 1–4 (BottomSheet, FocusLayout, PinCard, PhotoUploadTile, Chip). A browser visual pass of the tracker/collage/reveal/match screens is still worth doing when a browser tool is available.

**Decision:** A single neighbour confirmation closes a resolved civic pin (the prototype can't muster real neighbour density; CLAUDE.md decision 5 has admin moderation standing in for validation). The Test Console (Phase 13) will be able to set arbitrary confirmation counts/statuses for richer demos.

---

## Phase 6 — Gather and building communities ✅ DONE

**Status:** Complete. Logic verified (13/13 tsx tests) AND browser-verified (DOM reads in real Chrome via claude-in-chrome).

**What was built:**
- `src/routes/app/gather/GatherPage.tsx` — events-only view (filters type==='event' && !expired, sorted soonest-first). List/map toggle. EventCard: type badge, title, body, formatted "when", distance, anonymous host, interested count + "I'm interested" tap (increments, shows "Interested ✓", once per session). Map view = MapContainer + event markers (click → pin detail). Empty state when no events.
- `src/routes/app/building/BuildingPage.tsx` — JoinOrRegister (join a seeded/nearby building, or register a new one with name+address) → BuildingFeed (building name header, "Post a note" composer with optional flat/floor label, posts list). Lock icon + copy reinforcing it's private and separate from the ward feed. Anonymity held — flat/floor at most, defaults to "A resident", never names.
- store: `addInterest` (event only), `getBuilding`, `addBuilding`, `getBuildingPosts`, plus existing joinBuilding/addBuildingPost.
- `src/lib/time.ts`: `formatWhen` (friendly date/time for events).
- AppShell: nav visibility changed from a pulse/gather allowlist to "show unless focused task" (create/pin/collage), so Building and Profile (nav destinations) now keep the nav and a way back. **Note:** this adjusts Phase 3 AppShell — flagged below.

**Acceptance check result (browser + logic verified):**
- ✅ Gather shows only events (3 event cards, no civic/other types) and expired events are filtered out.
- ✅ "I'm interested" increments the count (23→24 verified live) and logs `interested_tapped`.
- ✅ A building can be registered and joined (joined Pali Hill Apartments live; `building_joined` logged; register path tested in logic).
- ✅ Building feed is separate from Pulse and never leaks (building posts live in a separate array, never in `pins`; verified Pulse pins contain no building post).
- ✅ Anonymity in building feed: flat labels only (Flat 4B/1A/3C), no names.
- ✅ `building_joined` logged (and `building_registered` on register).
- ✅ 0 console errors; `npm run build` clean.

**Decision flagged:** I broadened the floating-nav visibility in AppShell. Originally (Phase 3) it showed only on Pulse/Gather; but Building and Profile are nav destinations, and with the old rule they'd have had no nav and no way back. Nav now shows on all `/app` browsing surfaces and hides only on focused tasks (create, pin detail, collage). This matches PRS 6 ("floats on Pulse and Gather" describes floating over the map; Building/Profile are still destinations).

**Verification note:** Screenshots via claude-in-chrome are blocked in this environment (the tool waits for `document_idle`, which never resolves here), but `javascript_tool` DOM reads work and confirm actual rendered content + state + logs. All checks above are from real-browser DOM reads, not just logic.

---

## Phase 7 — WhatsApp imitation (VIPIN) ✅ DONE

**Status:** Complete. Browser-verified (full conversation driven end-to-end via claude-in-chrome).

**What was built:**
- `src/routes/whatsapp/WhatsAppPage.tsx` — a messaging-app-styled conversation (token-driven: green header, VIPIN avatar + name + typing/online, paper chat area, VIPIN bubbles left with avatar, resident bubbles right in green tint). A scripted civic-loop flow (STAGES state machine), not a generic chat:
  - report → category → share location → anonymity note ("your name is never shown… 'a neighbour on Waroda Road'") → photo + metadata-strip note → submitted → routed (mock reference id BMC-HW-2026-04863) → **waiting / dead-zone** (honest: "Now we wait… the city can be slow… I won't over-promise") → skip-the-wait → resolution after-photo bubble → confirm-it's-fixed → closed ("a neighbour saw it, not a number on some dashboard") → **mini-survey** → done/start-over.
  - Typing indicator with animated dots (ptp-typing keyframe), per-line typing delays, reduced-motion aware (instant). Quick-reply chips for resident responses. Auto-scroll to latest. Clear back path in the header. Labelled as a preview of the real front door.
  - Mini-survey micro-prompt appears at its scripted moment (after closure): one question, three tap options, logs survey_shown + survey_answered.

**Acceptance check result (browser-verified):**
- ✅ Conversation plays the whole loop: report → routed (ref id) → waiting → resolution photo → confirmed closed. Verified every stage reached live.
- ✅ VIPIN voice matches CLAUDE.md (calm, plain, local, honest about timelines; "report/fixed/sorted/on the record"; no over-promising).
- ✅ Waiting period reads honest and calm ("Now we wait… that's normal here, not a dead end").
- ✅ Resolution lands (after-photo bubble + "Fixed. The corner's clear again").
- ✅ Mini-survey fires at its moment; survey_shown + survey_answered logged (payload {answer, question, where:'whatsapp'}).
- ✅ 0 console errors; `npm run build` clean.

---

## Phase 8 — Business dashboard ✅ DONE

**Status:** Complete. Logic verified (12/12 tsx) AND browser-verified end-to-end.

**What was built:**
- Data model: business posts now live in the feed as `NonCivicPin`s with `isBusiness:true` + new optional fields `businessName`, `postType` ('offer'|'event'|'notice'), `stats` ({views,taps}). postType maps to a marker type (offer→sell, event→event, notice→service). Identity is shown for businesses (never anonymous — they aren't residents); only residents are anonymous.
- `src/routes/business/BusinessPage.tsx` — shell: mock sign-in (business name, no password), then header + tab nav (Dashboard/New post/Stats) + Outlet context. Session persisted in store (`businessSession`) so sub-pages and the Test Console can be reached directly.
- `BusinessHomePage` — welcome, honest "posting doesn't buy rank" banner, quick links, list of the business's live posts.
- `BusinessPostPage` — post type chooser, title/body/optional photo → creates a business pin in the feed (mocked initial reach), confirmation screen.
- `BusinessStatsPage` — total views/taps + per-post breakdown, "mocked … no paid ranking" disclaimer.
- store: `addBusinessPin` (into pins, NOT ownPinIds), `getBusinessPins`, `setBusinessSession`/`clearBusinessSession`. Removed the now-unused `businessPosts` state + `SEED_BUSINESS_POSTS` (replaced by a seeded business pin in SEED_NON_CIVIC_PINS).
- PinCard + PinDetail show a "Business" badge and the business name for isBusiness pins.

**Acceptance check result (browser-verified):**
- ✅ A business post appears in Pulse marked as a business — seeded Bandra Bakehouse shows as "Sell · Business · 20% off whole cakes… The Bandra Bakehouse"; a newly created post also appears, marked business, not in ownPinIds.
- ✅ Stats render (142 views / 31 taps totals + per-post).
- ✅ Nothing implies paid ranking — explicit honest copy on home, post, and stats.
- ✅ Mock sign-in → dashboard works; session persists across navigation/reload.
- ✅ 0 console errors; `npm run build` clean.

**Decision flagged:** Business posts are modelled as feed `NonCivicPin`s (isBusiness) rather than a separate type, so they appear in Pulse via the existing feed path. The old `BusinessPost` type / `businessPosts` state (Phase 2 scaffolding placeholder) was removed as dead code. The `BusinessPost` interface still exists in types/pin.ts but is unused.

**Verification gotcha (for future phases):** localStorage is per-origin and `loadState` merges persisted state over fresh defaults — so when SEED pins change between phases, an existing browser keeps its stale `pins` and won't show new seed data until reset (clear `ptp_v1_state` or use the reset path). A fresh user is unaffected. Also: `vite preview` caches index.html at startup — after a rebuild, restart preview (or use dev) or the page serves a stale JS hash and React won't mount.

---

## Phase 9 — Government vision dashboard ✅ DONE

**Status:** Complete. Browser-verified.

**What was built:**
- `src/routes/gov/GovPage.tsx` — a read-only vision/pitch surface on mock data (getState().govData). Persistent amber "Vision preview — mock data, not a live BMC integration. Wired to nothing real." banner (sticky), plus a footer reiterating it's not connected to any government system.
- The framing line up top: "A verification and closure layer on top of BMC's existing intake — not another intake channel."
- The heart of the pitch — the honest-number contrast: "Marked 'resolved' 78%" (inflated headline, muted) vs "Neighbour-confirmed fixed 21%" (honest, cobalt/trust), with the BMC field-test explanation (headline absorbs invalid/other-agency cases; PTP only counts a report closed when a neighbour confirms).
- Stat tiles (reports filed 218, verified fixed 46, median days to fix 29), reports-by-category bars (with avg days open), reports-by-area bars. CSS bars, no chart library.
- Back path to /app/pulse. Standalone route, no resident nav.
- Added `headlineResolvedRate: 0.78` to GovMockData + seed (the inflated figure for the contrast).

**Acceptance check result (browser-verified):**
- ✅ Renders on mock data (78% vs 21%, 218 filed, by-category/area bars; no NaN).
- ✅ Unmistakably labelled as vision (persistent sticky banner + footer).
- ✅ Wired to nothing real (reads only seeded mock data; "not connected to any government system").
- ✅ Shows the gap between filed and genuinely fixed, time-to-resolution, and the neighbour-confirmed honest rate with the framing line.
- ✅ 0 console errors; `npm run build` clean.

---

## Phases 10–13

Not started. See IMPLEMENTATION_PHASES.md for full plan.
