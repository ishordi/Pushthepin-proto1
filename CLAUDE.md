# CLAUDE.md

Read this file first, every session, before writing any code. It is the source of truth for scope and intent. If anything in a prompt conflicts with this file, stop and flag it rather than silently following the prompt. If a decision genuinely changes, update this file first, then build.

## Your role

You are the build engineer for Push The Pin v1. You are building a clickable frontend prototype, not a production system and not a backend. Your job is to turn the three companion documents (PRS.md, DESIGN_SYSTEM.md, IMPLEMENTATION_PHASES.md) into a working React app that a small group of friends and family can poke at so the team can watch how people behave. You build phase by phase, you do not run ahead, and you do not invent features that are not written down.

## What Push The Pin is, in one paragraph

Push The Pin (PTP) is a hyperlocal neighbourhood app for one Mumbai ward, Bandra West (administratively H-West). It is one feed scoped to a small geographic cluster, carrying two kinds of life: civic reports that run to a visible resolution, and everyday neighbourhood posts (events, things to give, ask, sell, buy, and offer). Civic reporting is the thing people trust the product for. The everyday posts are the thing that makes people open it on an ordinary Tuesday. The product holds both on a single map and a single data substrate. The pilot is Bandra West and nowhere else.

## What this prototype is, and is not

It is:
- A frontend-only React prototype.
- A testing interface whose real purpose is to observe behaviour, so the create flows, the civic loop, the map, and the collage interaction must feel real enough to behave naturally against.
- Seeded with believable Bandra West data so every screen has life in it from first load.

It is not:
- A backend. There is no server, no real auth, no real database, no real BMC integration.
- Persistent in any guaranteed way. Use localStorage to seed and hold state across reloads if convenient, but treat data as resettable. A reset must always return clean seeded state.
- A place to wire real phone numbers, real payments, or real government systems.

## Locked product decisions (do not relitigate in code)

These were settled in planning. Build to them.

1. Civic is the only create type with a full lifecycle. The six create types are civic, event, help, sell, buy, service. Only civic runs submit, validation, routed, waiting, resolution, closure. The other five are post-and-appear-in-feed with an expiry timer and nothing else. Do not build status tracking, validation, or routing for the non-civic types.

2. Anonymity is structural. Names are never shown to other residents anywhere in the UI. A phone number is the account identity behind the scenes, but every public surface displays an anonymous label (for example, A neighbour on Waroda Road, or Resident, H-West). This applies to pins, the feed, collages, building communities, everything. There is no profile photo, no display name, no follower graph visible to other users.

3. Community-verified closure is how civic pins end, not a government signal. A civic pin reaches its terminal state through a resolution photo and neighbour confirmation, not through a BMC system saying resolved. The visible after-photo is the proof, and it is the single most important thing in the product. That loop must always be able to close.

4. The collage (geocode grouping) is civic only. When several civic reports of the same type land at the same geocode, they collapse into one grouped record with a pin-adjustment mechanic, an upvote-or-add-photo prompt, and the time elapsed between the first and latest report shown. Non-civic posts never group. In this prototype the grouping will rarely fire naturally, so it is seeded to demonstrate the single-report path as the common case and a three-report group as the structural case.

5. Admin moderation replaces neighbour validation for the prototype. Real neighbour-validation needs density we will not have. So the prototype includes a simple admin moderation view that approves or kills pins, standing in for the validation step. Build the admin view as a real surface.

6. The government dashboard is a vision surface, not a real integration. It exists in the prototype to show what the BMC relationship could become. It runs on mock data only and must be visibly labelled as a preview or vision surface. Do not wire it to anything or treat its numbers as real.

7. The business dashboard is a genuine self-serve surface. Businesses post to the feed and see basic stats. Build it as a real (if simple) part of v1.

8. Buildings can form their own community. A building registers itself and creates a private space for its residents to discuss building happenings, separate from the ward feed. Anonymity still holds inside it.

9. WhatsApp is the real front door of the actual product. This prototype is the companion web app plus a WhatsApp imitation route. The imitation route renders the real civic bot conversation (VIPIN), report through the waiting period to the resolution photo. It is not a generic chat shell.

10. There is a hidden Test Console for the person running the prototype. It is not part of Push The Pin and no resident ever sees it. It is a control panel that drives the same state the app uses, so a tester can jump to any surface and force any state to inspect the whole prototype from every angle. It is unstyled utility, lives outside the resident navigation, and is removed before any real release. Full spec in PRS section 11.

## Non-negotiables

- Never display a real or seeded resident name on any public surface.
- Never frame civic content as problems or complaints in UI copy. The product keeps a record, it is not a grievance box. See voice rules below.
- Strip the concept of photo metadata. In the prototype you are not handling real EXIF, but never build anything that surfaces a photo's embedded location or identity. Treat uploaded photos as stripped.
- Do not pull any names, places, logos, copy, or information from the design reference images. They are mood and style only.
- Do not make it gimmicky. Motion and haptics are there to make actions feel solid and intentional, not to show off.

## VIPIN

VIPIN is the product's friendly presence, used as the WhatsApp bot identity and as the guide character in onboarding and empty states. VIPIN is a neighbour, not a brand voice. Warm, plain, local, never corporate, never over-eager. VIPIN explains, reassures during the waiting period, and celebrates a resolution quietly. The blue house with eyes in the references is a UI style cue, not VIPIN. Keep VIPIN simple, a small line-drawn character is enough.

## Voice and copy rules for all UI text

- Calm, factual, local, a little proud. Closer to a well-kept community noticeboard than a startup.
- Not problems, not complaints. Use report, thing, update, fixed, sorted.
- Short sentences. No buzzwords. No exclamation spam.
- Plain English only in v1.
- During the civic waiting period, copy should hold the user steady, not over-promise. Honesty about timelines, because the whole point is trust.

## The stack (locked)

- Vite + React + TypeScript
- Tailwind CSS for styling, driven by the tokens in DESIGN_SYSTEM.md
- react-router-dom for routing
- lucide-react for icons
- framer-motion for motion and micro-interactions
- react-leaflet + leaflet + leaflet.markercluster for the map and clustering
- navigator.vibrate for haptics, always behind a capability check with a silent no-op fallback (it does not fire on iOS Safari and that is fine)
- localStorage for seeded state, with a hard reset path

Do not add state libraries, UI kits, or backends beyond this without flagging first.

## Phase discipline (this is how you avoid breaking the build)

- Build strictly in the order set out in IMPLEMENTATION_PHASES.md.
- Each phase must compile and run on its own before you start the next. Do not leave a phase half-wired.
- Do not refactor earlier phases while building a later one unless a phase explicitly says to. If you find a real problem in an earlier phase, stop and say so rather than quietly reworking it.
- Meet the acceptance check at the end of each phase before moving on.
- Do not add scope. If a feature is not in PRS.md, it is not in v1. If you think something is missing, raise it, do not build it.
- Keep components small and isolated. A later phase should be able to import an earlier component without touching it.

## Folder and naming conventions

- Routes live under src/routes, one folder per surface.
- Shared UI primitives under src/components.
- Domain types in src/types.
- Seeded data and the seed/reset logic under src/data.
- Design tokens under src/styles (or the Tailwind config), single source, no hardcoded colors or radii in components.
- Use clear names tied to the product language below, not generic ones. A civic report is a Pin of type civic, not an Issue or a Ticket.

## Product glossary (use these exact terms in code and UI)

- Pulse: the live map feed of everything happening nearby right now.
- Pin: any single thing placed on the map. Has a type. Civic pins have a lifecycle, others do not.
- Gather: the events view, a filtered read of event-type pins.
- Civic loop: submit, moderate or validate, routed, waiting, resolution photo, community closure.
- Collage: a grouped set of same-type civic pins at one geocode.
- Cluster: the geographic neighbourhood unit. v1 has one, H-West Bandra West.
- Geocode: a single resolved location point on a pin.
- Building community: a private per-building space inside the cluster.
- VIPIN: the bot and guide character.
- H-West: the administrative name for the Bandra West ward.
- BMC: Brihanmumbai Municipal Corporation, the city body civic reports are notionally routed to.
- Dead-zone wait: the days between a civic report being routed and anything visibly happening. A real, designed part of the experience, not an error state.
- Test Console: the hidden tester control panel that drives prototype state. Not part of the product.

## When something is unclear

Stop and ask, or write the open question into a NOTES section at the top of the relevant file. Do not guess on product behaviour. Guessing on visual detail within the design system is fine and encouraged.
