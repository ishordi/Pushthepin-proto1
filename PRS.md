# Push The Pin v1 — Product Requirements and Specification (PRS)

Version 1.0 for the Bandra West (H-West) friends-and-family prototype.
Owner: Hardi (product and information design).
Read alongside CLAUDE.md, DESIGN_SYSTEM.md, and IMPLEMENTATION_PHASES.md.

---

## 1. Purpose

This prototype exists to watch behaviour, not to ship a finished product. Everything is built to answer a few real questions: do people open a neighbourhood feed when nothing is wrong, what do they actually post when given six ways to post, do they trust an anonymous civic report enough to file one, and does a visible resolution change how they feel about the place. The interface has to feel real enough that the behaviour against it is honest. It is frontend only. Data does not need to persist beyond a session, though localStorage seeding is fine.

A note on order of effort. The civic loop is the hard, defensible part and gets the most care. The everyday posts and the map are the daily-habit part and must feel alive. The two dashboards are demonstration surfaces. Spend accordingly.

## 2. Non-goals for v1

Out of scope, deliberately:
- Any backend, real authentication, or real database.
- Real BMC integration or any live government data.
- In-app payments, money movement, or transactions of any kind.
- Lifecycle, status, validation, or routing for non-civic pins.
- The geocode collage for non-civic pins.
- Multi-cluster or multi-ward. One cluster only.
- Multi-language. Plain English only.
- Video. Photos only.
- A social graph: no follows, no friends, no visible profiles, no display names.
- ML ranking or personalised feeds. Rule-based, newest-first, cluster-scoped.
- Automated per-category resolution timers. Store the category and show elapsed time, do not automate an SLA.

## 3. Pilot context

The whole product is scoped to Bandra West, the H-West ward of Mumbai. There is exactly one cluster in v1. The map centres on Bandra West and pins sit on real streets: Waroda Road and the Ranwar gaothan, Hill Road, Pali Naka and Pali Hill, Linking Road, Turner Road, Carter Road promenade, Bandstand. Seeded data uses believable coordinates inside this area. Nothing references any other neighbourhood or city.

The cluster is the unit of belonging. A resident sees only what is happening inside the cluster. Membership is by location, not by a stored social network.

## 4. Personas and the research behind them

Four personas carry the design. Each one stress-tests a different assumption. They come from prior research sessions and a real BMC field test, not invented for this doc.

### Aamir, the daily browser
Young, social, here for what is happening. He opens the app to see if anything is on tonight, who is playing football, what is going free. He has near-zero interest in civic content and will leave if the feed feels like a wall of complaints. He is the highest-frequency user and the reason the everyday posts exist. Design implication: the default Pulse view must feel light and alive, civic present but not dominant, and the first thing a new user sees is life, not problems.

### Priya, the occasional reporter
Busy, practical, reports something when it genuinely bothers her, a broken footpath, water logging, garbage that did not get picked up. She will file once, and whether she ever files again depends entirely on whether the first one visibly went somewhere. Design implication: the civic loop has to show motion and end in a visible resolution, or she never returns to the civic layer.

### The elder resident
Older, long in the neighbourhood, less comfortable with dense interfaces, cares deeply about the place. Reads more than posts. Will use the product only if it is legible, calm, and large enough to operate confidently. Design implication: age-inclusive defaults are not an accessibility afterthought, they are a primary persona requirement. Big tap targets, high contrast, plain words, no clever gestures required to do anything important.

### Royston D'Mello, the civic supplier
A long-time Waroda Road and Ranwar gaothan resident, the kind of person who notices the same open drain every day and would report it if reporting felt worth it. He represents the supply side of the civic moat, the people who actually generate the reports the whole differentiator depends on. The uncomfortable truth he surfaces: the highest-frequency users (Aamir) avoid the civic layer, while the moat depends on suppliers like him. Design implication: lower the cost of supplying a civic report to almost nothing, and make the act feel like contributing to a record the neighbourhood keeps, not shouting into a void.

### The strategic asymmetry to keep in mind
Everyday posts are the cheap attention engine, high frequency, low stakes, the reason for daily opens. Civic is the defensible moat, hard to replicate, dependent on trust and a visible resolution. The feed must serve Aamir's habit while protecting Royston's supply. If the feed tilts into a complaint stream, the casual users leave and the engine that gives civic an audience dies.

### What the BMC field test proved
A live test complaint filed through BMC's own WhatsApp channel showed that headline resolution numbers are heavily inflated. On a dashboard reading 78 percent resolved, the real resolution rate on genuinely actionable complaints was around 21 percent, because the resolved bucket absorbs invalid and other-agency cases. The lesson baked into this product: never mirror BMC's resolved signal. The only honest end state is a neighbour-verified after-photo. This is why community-verified closure is structural, not optional.

## 5. Content model

One substrate. Every item on the map is a Pin with a shared shape, differentiated by type. Six types in v1.

| Type | Nature | Lifecycle | Expiry | Example |
|---|---|---|---|---|
| civic | report something that needs fixing | full civic loop | stays until resolved or archived | open drain on Waroda Road |
| event | something happening, come if you want | none | expires after the event time | Sunday cleanup walk, Carter Road |
| help | ask the neighbourhood for something | none | expires after a set window | anyone have a ladder for an hour |
| sell | offering a thing for sale | none | expires after a set window | barely used study table |
| buy | looking to buy a thing | none | expires after a set window | second-hand cycle wanted |
| service | offering a service | none | longer expiry, recurring feel | maths and science home tutor |

Shared pin fields: id, type, category (civic only, for example pothole, garbage, water, streetlight, footpath), title, body, photo (optional, treated as stripped of metadata), geocode (lat, lng), createdAt, expiresAt (non-civic), authorAnonymousLabel, clusterId, and for civic only: status, statusHistory, groupId (for collage), resolutionPhoto, confirmations.

Civic status values, in order: submitted, in_review, routed, waiting, resolved, closed. The waiting state is the dead-zone wait and is a normal, designed state. Resolved is set when a resolution photo is added. Closed is set when neighbours confirm.

Display rule that overrides everything: no pin ever shows a real name. authorAnonymousLabel is always something like A neighbour near Waroda Road.

## 6. Information architecture

The product has four surfaces. The first is the resident mobile app, the heart of it. The second is the WhatsApp imitation. The third is the business dashboard. The fourth is the government vision dashboard. Each is a top-level route group.

```
/                         redirect to /app or /onboarding based on seeded state
/onboarding               first-run: phone identity, location, anonymity explainer, VIPIN intro
/app                      resident app shell with floating bottom nav
  /app/pulse              the map feed (default), clustering, type filters    [Pulse]
  /app/gather             events view, list and map of event pins             [Gather]
  /app/create             create flow, type chooser then branched form
  /app/pin/:id            pin detail, civic shows the lifecycle tracker
  /app/collage/:groupId   grouped civic reports at one geocode
  /app/building           building community: register, join, building feed
  /app/profile            anonymous self view, settings, accessibility controls
/whatsapp                 VIPIN conversation imitation, the full civic loop
/business                 business self-serve dashboard
  /business/post          create a business post into the feed
  /business/stats         simple views and reach numbers (mocked)
/gov                      government vision dashboard (mock data, labelled preview)
/admin                    moderation view, approve or kill pins (stands in for validation)
/console                  hidden Test Console, tester only, not in resident navigation, see section 11
```

Resident navigation: a floating, slightly rounded bottom nav overlaying the map. Four destinations: Pulse (map), Gather, Create (centre, raised), Building, Profile. Create sits centre as the primary action. The map is the home surface, everything else floats over or pushes up from it.

The bottom nav floats on Pulse and Gather. On focused tasks (create, pin detail, onboarding, the WhatsApp route) it gives way to a single clear back path so the user is never lost mid-task.

## 7. User flows

Every flow below must be fully clickable in the prototype.

### 7.1 Onboarding and sign in
1. Welcome with VIPIN, one line on what PTP is: see what is alive on your street, and get things fixed, together.
2. Phone number as identity. In the prototype, accept any number and a mock OTP that always succeeds. Never store it anywhere visible.
3. Location step on a tiered ladder. Ask for precise location. If granted, drop the user into the H-West cluster. If denied, the product still works: fall back to the cluster centre and let them browse. The product must never dead-end on a denied permission. Show this clearly.
4. Anonymity explainer. One calm screen: your name is never shown to anyone here. This is the trust contract and it gets its own moment.
5. Land in Pulse with the seeded map already alive.

### 7.2 Pulse, the map feed
1. Open on the Bandra West map, pins already placed, clustered where dense.
2. A row of type filter chips across the top: All, Civic, Events, Help, Sell, Buy, Service. Each chip carries its type colour. Selecting filters the map and the list.
3. A map and list toggle. List is newest-first within the cluster.
4. Tapping a cluster bubble zooms and splits it into individual pins or a collage.
5. Tapping a pin opens its detail.
6. A clear, calm empty state if a filter has nothing, with VIPIN, never a dead grey screen.

### 7.3 Create a pin
1. From the centre nav action, a type chooser: six large, legible, colour-and-shape-coded options.
2. Branch by type. Civic asks for a category, a short description, a photo, and confirms location on the map with the GPS point and its accuracy circle, draggable to nudge. Non-civic types ask only what they need: an event asks what and when, help asks what you need and for how long, sell and buy ask the item and an optional photo, service asks what you offer.
3. Location confirmation uses phone-native GPS accuracy. Show the point and a radius circle, let the user drag the point to correct it. Do not build a custom map-snapping engine.
4. Submit. Civic enters the lifecycle at submitted. Non-civic posts appear in the feed immediately with an expiry.
5. Confirmation moment with a gentle haptic and VIPIN acknowledging, plus, for civic, a clear honest note on what happens next and roughly how long the wait can be.

### 7.4 The civic loop (the core)
This is the spine. The pin detail for a civic pin shows a stepped status tracker, styled like a clean progress tracker, with these stops: submitted, in review, routed to BMC, waiting, resolved, closed by neighbours.

1. Submitted. The report exists, visible to the cluster (after moderation in the prototype).
2. In review. The admin moderation view (see 7.10) approves or kills it. Approved moves it forward.
3. Routed to BMC. In the prototype this is a state change with a mock complaint reference id. In reality a human sends the templated ward email and pastes the id back.
4. Waiting, the dead-zone. Days pass with nothing from the city. This is designed, not broken. VIPIN holds the user steady here with honest copy, and the tracker shows time elapsed since routing.
5. Resolved. Someone adds a resolution photo. The before and after sit together. This is the proof moment and it should feel like the emotional peak of the product.
6. Closed by neighbours. Other residents confirm it is actually fixed. Confirmation, not a government signal, ends the loop. Show how many neighbours confirmed.

The tracker must surface elapsed time honestly at every stage. Never show a fake resolved state.

### 7.5 The collage, geocode grouping (civic only)
1. When civic reports of the same type land at the same geocode, they collapse into one grouped record, the collage.
2. On the map, a collage reads as a stacked or layered marker, visibly more than one.
3. Opening it shows the grouped photos, the count of reports, and the time elapsed between the first and the latest report.
4. A new reporter arriving at the same spot and type is prompted: is this the same thing, in which case upvote or add your photo to the existing group, or is it different, in which case file new.
5. The pin-adjustment mechanic lets a reporter nudge their point to confirm they mean the same location.
6. In the prototype this is seeded: most civic pins are single reports (the common path), and one location on Waroda Road carries a three-report collage (the structural path) so the interaction is testable from first load.

### 7.6 Gather, events
1. A filtered read of event-type pins, shown as a friendly list and on the map.
2. Each event shows what, when, where, and an anonymous host label.
3. No RSVP machinery in v1, a simple I am interested tap that increments a count is the ceiling.
4. Events expire after their time and leave the feed cleanly.

### 7.7 Building community
1. From the Building nav item, a resident can register their building (name, the cluster it sits in) or join an existing one.
2. A building has its own private feed for building happenings: society notices, maintenance, lift out of order, Ganpati planning, water tanker timing.
3. Anonymity still holds inside the building feed, residents are labelled by flat or floor at most, never by name, and even that is optional.
4. The building feed is separate from the ward Pulse. Building chatter does not leak into the public cluster feed.
5. Seed one example building so the flow is demonstrable.

### 7.8 Mini survey
1. Short in-context micro-prompts, one question at a time, fired at meaningful moments: after a first post, after browsing for a while, after a civic pin reaches resolved.
2. Two or three options or a single tap, never a form.
3. This is the highest-value behaviour instrument in the build. Treat survey responses as logged events (see section 9).
4. Dismissible, never blocking, never repeated annoyingly.

### 7.9 Profile and settings
1. An anonymous self view: your own pins and their status, nothing that exposes identity.
2. Settings: location permission state and the tiered fallback, notification preferences (mocked), and the accessibility controls (see section 8).
3. A clear data reset control for the prototype that returns clean seeded state.

### 7.10 Admin moderation
1. A simple queue of submitted pins.
2. Approve moves a pin into the public feed and, for civic, forward in the lifecycle. Kill removes it.
3. This stands in for neighbour validation, which needs density the prototype will not have.
4. Plain, functional, not styled for residents.

### 7.11 Business dashboard
1. A business signs in (mock) and posts to the feed: an offer, an event, a notice. Business posts are clearly marked as from a business and never masquerade as a resident.
2. A simple stats view: how many people saw or tapped the post (mocked numbers).
3. Honest constraint reflected in copy: posting does not buy rank. The feed stays hyperlocal and honest, businesses appear because they are nearby and recent, not because they paid.

### 7.12 Government vision dashboard
1. Clearly labelled as a preview or vision surface, on mock data only.
2. Shows what the BMC relationship could look like: reports by category and area, time-to-resolution, the gap between filed and genuinely fixed, the neighbour-confirmed resolution rate as the honest number.
3. Frames the pitch: PTP is a verification and closure layer on top of BMC's existing intake, not another intake channel.
4. Nothing here is wired to anything real.

## 8. Accessibility and age-inclusive requirements

Age-inclusivity is a primary persona requirement (the elder resident), not a compliance checkbox.

- Minimum tap target 44 by 44 points, larger for primary actions.
- Body text minimum 16px, with a text-size control offering at least a larger setting that scales the whole interface, not just one screen.
- Colour contrast meets WCAG AA for all text and meaningful UI. Never use colour as the only signal: pin type is carried by shape and label as well as colour, so a colour-blind or low-vision user is not lost.
- Every important action is reachable without a gesture. Swipes and long-presses are enhancements, never the only path.
- Respect prefers-reduced-motion: when set, replace motion with instant or simple transitions, and never rely on animation to convey state.
- Respect the haptics capability: vibration is an enhancement, the UI is complete and clear without it.
- Plain language throughout, short sentences, no jargon. VIPIN explains anything that needs explaining.
- Visible focus states and a sensible tab order for keyboard and screen-reader users, with proper labels on icons and controls.

## 9. Instrumentation, what to log

The prototype's real output is behaviour, so logging is part of the product, not an afterthought. Even without a backend, fire and store a structured event log (in memory or localStorage) and expose it somewhere inspectable, for example a hidden debug view or the console.

Log at least: app open, onboarding step reached and completed, location permission granted or denied, filter changes on Pulse, pin opened by type, create flow started and completed by type, civic pin submitted, civic pin reached resolved, collage opened, upvote-or-add chosen, building joined, survey shown and answered, and session length.

The point: at the end of a friends-and-family run, the team should be able to read what people actually did, especially what types they posted and whether anyone engaged the civic loop end to end.

## 10. Empty, edge, and honest states

- Empty filter: a calm VIPIN state, never a blank grey map.
- Location denied: full browsing on the cluster centre, with a gentle prompt explaining what precise location would add.
- A collage with a single report: reads as a normal single pin, the group affordance only appears at two or more.
- A civic pin stuck in the dead-zone wait: honest copy, elapsed time shown, VIPIN reassurance, never a fake resolved.
- A pin past expiry: leaves the feed cleanly, no broken cards.
- First-ever post by a user: the survey moment and a quiet sense of having contributed to the neighbourhood's record.

## 11. The Test Console (tester instrument, not part of the product)

A hidden control panel for whoever is running the prototype. It is not Push The Pin and a resident never sees it. Its job is to let a tester jump to any surface and force any state, so the whole prototype can be inspected from every angle without walking each flow by hand. It reads and drives the same store the app uses, so anything it changes is real in the running prototype.

Access: a hidden trigger, a triple-tap on the top-right corner, the /console route, or a keyboard combo on desktop. It opens as a full-height overlay, deliberately plain and utilitarian so it is never mistaken for product UI. Closing it returns the tester to wherever they sent themselves.

Control sections:

Navigate. A direct link to every surface in the IA: the resident app surfaces, WhatsApp, business, gov, admin, onboarding. One tap to land there.

Scenarios. One-tap presets that set the whole prototype into a known state:
- Fresh user: first run, onboarding not done, light feed.
- Busy cluster: dense feed, clustering active.
- Ghost town: near-empty feed, the cold-start lens.
- Civic mid-wait: a civic pin sitting in the dead-zone.
- Resolution moment: a civic pin at the before-and-after reveal.
- Collage active: the Waroda Road group in view.

Civic lifecycle. Pick any civic pin and force its status to submitted, in review, routed, waiting, resolved, or closed. Set elapsed days. Attach or clear a resolution photo. Set the neighbour-confirmation count. So every tracker state is viewable instantly.

Data lenses. Switch the feed between empty, sparse, dense, and collage-heavy. Toggle the presence of each pin type. Expire or un-expire non-civic posts.

Persona lens. View the prototype as Aamir, Priya, the elder resident, or Royston. Each applies that persona's likely defaults, for example the elder lens forces large text and high contrast, the Aamir lens defaults the feed to events. This is a viewing aid only, it does not change the underlying data, only the lens.

Accessibility overrides. Force reduced motion on or off, set the text-size scale, force haptics off, force high contrast, independent of the device settings, so the tester can check each without changing their phone.

Surface toggles. Grain on or off, map tile style, the floating bottom nav on or off, business posts on or off.

Time control. A global clock offset that ages pins, expires events, and advances the dead-zone wait, so the tester can fast-forward the civic timeline without waiting real days.

Instrumentation. A live view of the behaviour event log, with clear and export, so a tester can watch what is being logged and download a session.

Reset. A hard reseed back to clean seeded state.

The console never ships, is never in the resident navigation, and is built on top of the same state the app already uses, so it adds no product behaviour, only a lens onto it.
