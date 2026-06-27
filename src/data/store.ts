/*
  Push The Pin — localStorage store.
  Single source of truth for all prototype state.
  All state mutations (from the app and the Test Console) go through here.
*/

import type { Pin, NonCivicPin, CivicPin, CivicStatus, Collage, Geocode, Building, BuildingPost, GovMockData } from '../types/pin';
import type { BehaviourEvent, EventName } from '../types/events';
import { haversineMeters } from '../lib/geo';
import {
  SEED_CIVIC_PINS,
  SEED_NON_CIVIC_PINS,
  SEED_COLLAGES,
  SEED_BUILDINGS,
  SEED_BUILDING_POSTS,
  SEED_GOV_DATA,
} from './seed';

const STORAGE_KEY = 'ptp_v1_state';

/** Resident-facing settings (Profile, Phase 10). The text-size control scales
    the whole interface from the 16px base; notifications are mocked. */
export interface AppPrefs {
  textSize: 'normal' | 'large';
  notifyCivicUpdates: boolean;
  notifyNearby: boolean;
}

export interface PTPState {
  pins: Pin[];
  collages: Collage[];
  buildings: Building[];
  buildingPosts: BuildingPost[];
  govData: GovMockData;
  eventLog: BehaviourEvent[];
  onboardingDone: boolean;
  joinedBuildingId?: string;
  /** ids of pins created by this user — kept out of the Pin model so public
      surfaces stay anonymous; used by Profile (Phase 10). */
  ownPinIds: string[];
  /** mock business sign-in (business name) — persists so business sub-pages
      and the Test Console can be reached directly. */
  businessSession?: string;
  /** resident settings (Phase 10). */
  prefs: AppPrefs;
  /** whether precise location was granted in onboarding; undefined = not asked
      yet, false = denied and falling back to the cluster centre. */
  locationGranted?: boolean;
}

function freshState(): PTPState {
  return {
    pins: [...SEED_CIVIC_PINS, ...SEED_NON_CIVIC_PINS] as Pin[],
    collages: [...SEED_COLLAGES],
    buildings: [...SEED_BUILDINGS],
    buildingPosts: [...SEED_BUILDING_POSTS],
    govData: { ...SEED_GOV_DATA },
    eventLog: [],
    onboardingDone: false,
    ownPinIds: [],
    prefs: { textSize: 'normal', notifyCivicUpdates: true, notifyNearby: true },
  };
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/* ── Load / save / reset ── */

export function loadState(): PTPState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // Merge over fresh defaults so state saved before a field existed still
      // gets sensible defaults (schema-forward safety; full reset always clean).
      return { ...freshState(), ...(JSON.parse(raw) as Partial<PTPState>) } as PTPState;
    }
  } catch {
    /* corrupt storage — fall through to seed */
  }
  const state = freshState();
  saveState(state);
  return state;
}

export function saveState(state: PTPState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — silent */
  }
}

export function resetState(): PTPState {
  const state = freshState();
  saveState(state);
  // Keep the in-memory singleton in sync so callers that don't reload (Profile
  // reset, Test Console) see clean state immediately.
  _state = state;
  return state;
}

/* ── Singleton in-memory state (mutated then persisted) ── */

let _state: PTPState = loadState();

export function getState(): PTPState {
  return _state;
}

function commit(next: PTPState): void {
  _state = next;
  saveState(next);
}

/* ── Pin mutations ── */

export function getPinById(id: string): Pin | undefined {
  return _state.pins.find((p) => p.id === id);
}

export function addPin(pin: Pin): void {
  commit({ ..._state, pins: [..._state.pins, pin] });
}

/** Create a pin from the create flow and record it as the user's own. */
export function createPin(pin: Pin): void {
  commit({
    ..._state,
    pins: [..._state.pins, pin],
    ownPinIds: [..._state.ownPinIds, pin.id],
  });
}

/* Business posts appear in the feed marked as a business (not as a resident's
   own anonymous pin), so they go into pins but not ownPinIds. */
export function addBusinessPin(pin: NonCivicPin): void {
  commit({ ..._state, pins: [..._state.pins, pin] });
}

export function getBusinessPins(businessName: string): NonCivicPin[] {
  return _state.pins
    .filter((p): p is NonCivicPin => p.type !== 'civic' && !!p.isBusiness && p.businessName === businessName)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function setBusinessSession(name: string): void {
  commit({ ..._state, businessSession: name });
}

export function clearBusinessSession(): void {
  commit({ ..._state, businessSession: undefined });
}

export function updatePin(id: string, changes: Partial<Pin>): void {
  commit({
    ..._state,
    pins: _state.pins.map((p) => (p.id === id ? { ...p, ...changes } as Pin : p)),
  });
}

export function setCivicStatus(id: string, status: CivicStatus, note?: string): void {
  commit({
    ..._state,
    pins: _state.pins.map((p) => {
      if (p.id !== id || p.type !== 'civic') return p;
      const entry = { status, at: new Date().toISOString(), ...(note ? { note } : {}) };
      return {
        ...p,
        status,
        statusHistory: [...(p as CivicPin).statusHistory, entry],
      } as CivicPin;
    }),
  });
}

export function addResolutionPhoto(id: string, photo: string): void {
  const now = new Date().toISOString();
  commit({
    ..._state,
    pins: _state.pins.map((p) => {
      if (p.id !== id || p.type !== 'civic') return p;
      return {
        ...p,
        resolutionPhoto: photo,
        status: 'resolved' as CivicStatus,
        statusHistory: [
          ...(p as CivicPin).statusHistory,
          { status: 'resolved' as CivicStatus, at: now, note: 'Resolution photo added' },
        ],
      } as CivicPin;
    }),
  });
}

/* A neighbour confirms the fix. In the prototype we lack the density real
   neighbour-validation needs, so a confirmation on a resolved pin closes the
   loop (community-verified closure), incrementing the visible count. */
export function confirmCivicPin(id: string): void {
  commit({
    ..._state,
    pins: _state.pins.map((p) => {
      if (p.id !== id || p.type !== 'civic') return p;
      const civic = p as CivicPin;
      const newCount = civic.confirmations + 1;
      if (civic.status === 'resolved') {
        const now = new Date().toISOString();
        return {
          ...civic,
          confirmations: newCount,
          status: 'closed' as CivicStatus,
          statusHistory: [
            ...civic.statusHistory,
            { status: 'closed' as CivicStatus, at: now, note: `${newCount} neighbour${newCount === 1 ? '' : 's'} confirmed` },
          ],
        } as CivicPin;
      }
      return { ...civic, confirmations: newCount } as CivicPin;
    }),
  });
}

/* ── Admin moderation (Phase 12) — stands in for neighbour validation ── */

/* Approve a submitted civic report: it advances through review and is routed to
   BMC with a mock complaint reference (the lifecycle's "in review" → "routed"). */
export function approveCivicPin(id: string): void {
  const now = new Date().toISOString();
  const ref = `BMC-HW-2026-${Math.floor(10000 + Math.random() * 89999)}`;
  commit({
    ..._state,
    pins: _state.pins.map((p) => {
      if (p.id !== id || p.type !== 'civic') return p;
      const civic = p as CivicPin;
      const reference = civic.mockComplaintRef ?? ref;
      return {
        ...civic,
        status: 'routed' as CivicStatus,
        mockComplaintRef: reference,
        statusHistory: [
          ...civic.statusHistory,
          { status: 'in_review' as CivicStatus, at: now, note: 'Approved in moderation' },
          { status: 'routed' as CivicStatus, at: now, note: `Routed to BMC · ${reference}` },
        ],
      } as CivicPin;
    }),
  });
}

/* Kill a pin: remove it from the feed and any group it sat in. */
export function removePin(id: string): void {
  commit({
    ..._state,
    pins: _state.pins.filter((p) => p.id !== id),
    ownPinIds: _state.ownPinIds.filter((x) => x !== id),
    collages: _state.collages
      .map((c) => ({ ...c, pinIds: c.pinIds.filter((x) => x !== id) }))
      .filter((c) => c.pinIds.length > 0),
  });
}

export function addCollage(collage: Collage): void {
  const existing = _state.collages.findIndex((c) => c.groupId === collage.groupId);
  if (existing >= 0) {
    const next = [..._state.collages];
    next[existing] = collage;
    commit({ ..._state, collages: next });
  } else {
    commit({ ..._state, collages: [..._state.collages, collage] });
  }
}

export function getCollageForPin(pinId: string): Collage | undefined {
  const pin = _state.pins.find((p) => p.id === pinId);
  if (!pin || pin.type !== 'civic' || !pin.groupId) return undefined;
  return _state.collages.find((c) => c.groupId === pin.groupId);
}

export function getCollage(groupId: string): Collage | undefined {
  return _state.collages.find((c) => c.groupId === groupId);
}

export function getCollageMembers(groupId: string): CivicPin[] {
  const collage = getCollage(groupId);
  if (!collage) return [];
  return collage.pinIds
    .map((id) => _state.pins.find((p) => p.id === id))
    .filter((p): p is CivicPin => !!p && p.type === 'civic');
}

/* Collage / upvote-or-add: find an existing civic report near a geocode so a
   new same-spot report can join its group (civic only — non-civic never groups). */
export function findNearbyCivic(geocode: Geocode, withinMeters = 40): CivicPin | undefined {
  return _state.pins.find(
    (p): p is CivicPin =>
      p.type === 'civic' && haversineMeters(p.geocode, geocode) <= withinMeters,
  );
}

/* Add a new civic report to an existing report's group (creating the group from
   a lone report if needed). The new report snaps to the group's geocode — the
   pin-adjustment mechanic confirming it is the same spot. */
export function addCivicToGroup(newPin: CivicPin, targetId: string): void {
  const target = _state.pins.find((p) => p.id === targetId);
  if (!target || target.type !== 'civic') {
    createPin(newPin);
    return;
  }

  if (target.groupId) {
    const groupId = target.groupId;
    const collage = _state.collages.find((c) => c.groupId === groupId);
    if (!collage) {
      createPin(newPin);
      return;
    }
    const placed: CivicPin = { ...newPin, groupId, geocode: collage.geocode };
    commit({
      ..._state,
      pins: [..._state.pins, placed],
      collages: _state.collages.map((c) =>
        c.groupId === groupId
          ? { ...c, pinIds: [...c.pinIds, placed.id], latestReportAt: placed.createdAt }
          : c,
      ),
      ownPinIds: [..._state.ownPinIds, placed.id],
    });
  } else {
    const groupId = `group-${Date.now()}`;
    const placed: CivicPin = { ...newPin, groupId, geocode: target.geocode };
    const updatedTarget: CivicPin = { ...target, groupId };
    const collage: Collage = {
      groupId,
      category: target.category,
      geocode: target.geocode,
      pinIds: [target.id, placed.id],
      firstReportAt: target.createdAt,
      latestReportAt: placed.createdAt,
    };
    commit({
      ..._state,
      pins: [..._state.pins.map((p) => (p.id === target.id ? updatedTarget : p)), placed],
      collages: [..._state.collages, collage],
      ownPinIds: [..._state.ownPinIds, placed.id],
    });
  }
}

/* ── Events: "I am interested" ── */

export function addInterest(id: string): void {
  commit({
    ..._state,
    pins: _state.pins.map((p) =>
      p.id === id && p.type === 'event'
        ? { ...p, interestedCount: (p.interestedCount ?? 0) + 1 }
        : p,
    ),
  });
}

/* ── Building ── */

export function getBuilding(id: string): Building | undefined {
  return _state.buildings.find((b) => b.id === id);
}

export function addBuilding(building: Building): void {
  commit({ ..._state, buildings: [..._state.buildings, building] });
}

export function joinBuilding(buildingId: string): void {
  commit({ ..._state, joinedBuildingId: buildingId });
}

export function getBuildingPosts(buildingId: string): BuildingPost[] {
  return _state.buildingPosts
    .filter((p) => p.buildingId === buildingId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addBuildingPost(post: BuildingPost): void {
  commit({ ..._state, buildingPosts: [..._state.buildingPosts, post] });
}

/* ── Onboarding ── */

export function markOnboardingDone(): void {
  commit({ ..._state, onboardingDone: true });
}

export function setLocationGranted(granted: boolean): void {
  commit({ ..._state, locationGranted: granted });
}

/* ── Settings / preferences (Phase 10) ── */

export function setPrefs(partial: Partial<AppPrefs>): void {
  commit({ ..._state, prefs: { ..._state.prefs, ...partial } });
}

/* ── Event log ── */

let _logListeners: Array<() => void> = [];

export function onLogChange(cb: () => void): () => void {
  _logListeners.push(cb);
  return () => { _logListeners = _logListeners.filter((l) => l !== cb); };
}

export function logEvent(name: EventName, payload?: Record<string, unknown>): void {
  const event: BehaviourEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    at: new Date().toISOString(),
    ...(payload ? { payload } : {}),
  };
  commit({ ..._state, eventLog: [..._state.eventLog, event] });
  _logListeners.forEach((cb) => cb());
}

export function clearLog(): void {
  commit({ ..._state, eventLog: [] });
}

/* ── Test Console: force-set any part of state ── */

export function forceSetState(partial: Partial<PTPState>): void {
  commit(deepClone({ ..._state, ...partial }));
}
