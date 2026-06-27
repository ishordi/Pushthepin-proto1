/*
  Test Console scenario presets and state drivers (Phase 13). Everything here
  calls through store.ts (forceSetState / mutations), so the console adds no new
  product behaviour — it only sets the existing state into known shapes and
  returns where the tester should be sent to view it.
*/

import { forceSetState, resetState, getState, setPrefs } from '../data/store';
import { setOverrides } from './overrides';
import { applyTextSize } from './prefs';
import {
  SEED_CIVIC_PINS,
  SEED_NON_CIVIC_PINS,
  SEED_COLLAGES,
} from '../data/seed';
import { H_WEST_CLUSTER } from '../data/cluster';
import type { Pin, CivicPin, CivicStatus, PinType, Collage } from '../types/pin';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function seedFeed(): Pin[] {
  return [...clone(SEED_CIVIC_PINS), ...clone(SEED_NON_CIVIC_PINS)] as Pin[];
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}
function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

/* ── Scenarios ── */

export interface Scenario {
  id: string;
  label: string;
  note: string;
  /** mutate state and return where to navigate */
  run: () => string;
}

function jitter(base: number, spread: number): number {
  return base + (Math.random() - 0.5) * spread;
}

function densePins(): Pin[] {
  const { center } = H_WEST_CLUSTER;
  const types: PinType[] = ['civic', 'event', 'help', 'sell', 'buy', 'service'];
  const extra: Pin[] = [];
  for (let i = 0; i < 36; i++) {
    const type = types[i % types.length];
    const geocode = { lat: jitter(center.lat, 0.012), lng: jitter(center.lng, 0.012) };
    const createdAt = isoDaysAgo(Math.floor(Math.random() * 6));
    if (type === 'civic') {
      extra.push({
        id: `dense-civic-${i}`,
        type: 'civic',
        category: 'pothole',
        title: `Reported thing #${i}`,
        body: 'Seeded by the Busy cluster scenario.',
        geocode,
        createdAt,
        authorAnonymousLabel: 'Resident, H-West',
        clusterId: H_WEST_CLUSTER.id,
        status: 'routed',
        statusHistory: [{ status: 'submitted', at: createdAt }],
        confirmations: 0,
      } as CivicPin);
    } else {
      extra.push({
        id: `dense-${type}-${i}`,
        type,
        title: `${type} item #${i}`,
        body: 'Seeded by the Busy cluster scenario.',
        geocode,
        createdAt,
        expiresAt: isoDaysFromNow(5),
        authorAnonymousLabel: 'Resident, H-West',
        clusterId: H_WEST_CLUSTER.id,
        ...(type === 'event' ? { interestedCount: Math.floor(Math.random() * 30) } : {}),
      } as Pin);
    }
  }
  return [...seedFeed(), ...extra];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'fresh',
    label: 'Fresh user',
    note: 'First run, onboarding not done.',
    run: () => {
      resetState();
      forceSetState({ onboardingDone: false });
      setOverrides({ clockOffsetMs: 0 });
      return '/onboarding';
    },
  },
  {
    id: 'busy',
    label: 'Busy cluster',
    note: 'Dense feed, clustering active.',
    run: () => {
      forceSetState({ pins: densePins(), collages: clone(SEED_COLLAGES) });
      return '/app/pulse';
    },
  },
  {
    id: 'ghost',
    label: 'Ghost town',
    note: 'Near-empty feed, the cold-start lens.',
    run: () => {
      const pins = seedFeed().filter((p) => p.id === 'civic-006' || p.id === 'event-001');
      forceSetState({ pins, collages: [] });
      return '/app/pulse';
    },
  },
  {
    id: 'midwait',
    label: 'Civic mid-wait',
    note: 'A civic pin in the dead-zone.',
    run: () => {
      forceSetState({ pins: seedFeed(), collages: clone(SEED_COLLAGES) });
      forceCivic('civic-006', { status: 'waiting', elapsedDays: 11, confirmations: 0 });
      return '/app/pin/civic-006';
    },
  },
  {
    id: 'resolution',
    label: 'Resolution moment',
    note: 'A civic pin at the before/after reveal.',
    run: () => {
      forceSetState({ pins: seedFeed(), collages: clone(SEED_COLLAGES) });
      forceCivic('civic-006', { status: 'resolved', elapsedDays: 0, resolutionPhoto: 'mock:after-turner-road' });
      return '/app/pin/civic-006';
    },
  },
  {
    id: 'collage',
    label: 'Collage active',
    note: 'The Waroda Road group in view.',
    run: () => {
      forceSetState({ pins: seedFeed(), collages: clone(SEED_COLLAGES) });
      return '/app/collage/waroda-road-group';
    },
  },
];

/* ── Persona lens ── a viewing aid only; applies a persona's likely defaults
   (accessibility + feed default filter), never changes the underlying data. */

export interface Persona {
  id: string;
  label: string;
  note: string;
  apply: () => void;
}

export const PERSONAS: Persona[] = [
  {
    id: 'aamir',
    label: 'Aamir',
    note: 'Social — feed defaults to events.',
    apply: () => setOverrides({ feedDefaultFilter: 'event' }),
  },
  {
    id: 'priya',
    label: 'Priya',
    note: 'Civic-minded — feed defaults to civic.',
    apply: () => setOverrides({ feedDefaultFilter: 'civic' }),
  },
  {
    id: 'elder',
    label: 'Elder resident',
    note: 'Large text + high contrast.',
    apply: () => {
      setPrefs({ textSize: 'large' });
      applyTextSize('large');
      setOverrides({ highContrast: true, feedDefaultFilter: 'all' });
    },
  },
  {
    id: 'royston',
    label: 'Royston',
    note: 'Buy/sell browser — feed defaults to sell.',
    apply: () => setOverrides({ feedDefaultFilter: 'sell' }),
  },
];

/* ── Civic lifecycle driver ── */

const ORDER: CivicStatus[] = ['submitted', 'in_review', 'routed', 'waiting', 'resolved', 'closed'];

export interface ForceCivicOpts {
  status: CivicStatus;
  elapsedDays?: number;
  confirmations?: number;
  resolutionPhoto?: string | null; // null clears
}

export function forceCivic(id: string, opts: ForceCivicOpts): void {
  const pin = getState().pins.find((p) => p.id === id);
  if (!pin || pin.type !== 'civic') return;
  const idx = ORDER.indexOf(opts.status);
  const elapsed = opts.elapsedDays ?? 0;

  // Build a plausible history: the current step started `elapsed` days ago,
  // earlier steps a day apart before that.
  const history = ORDER.slice(0, idx + 1).map((s, i) => ({
    status: s,
    at: isoDaysAgo(elapsed + (idx - i)),
  }));

  const hasPhoto = opts.resolutionPhoto !== undefined
    ? opts.resolutionPhoto
    : (pin as CivicPin).resolutionPhoto;
  const wantsPhoto = opts.status === 'resolved' || opts.status === 'closed';

  const next: CivicPin = {
    ...(pin as CivicPin),
    status: opts.status,
    statusHistory: history,
    confirmations: opts.confirmations ?? (opts.status === 'closed' ? Math.max(1, (pin as CivicPin).confirmations) : (pin as CivicPin).confirmations),
    mockComplaintRef: idx >= ORDER.indexOf('routed')
      ? ((pin as CivicPin).mockComplaintRef ?? 'BMC-HW-2026-09000')
      : undefined,
    resolutionPhoto: opts.resolutionPhoto === null
      ? undefined
      : (wantsPhoto ? (hasPhoto || 'mock:after-photo') : (hasPhoto || undefined)),
  };

  forceSetState({ pins: getState().pins.map((p) => (p.id === id ? next : p)) });
}

/* ── Data lenses ── */

export type Density = 'empty' | 'sparse' | 'dense' | 'collage';

export function setDensity(kind: Density): void {
  if (kind === 'empty') {
    forceSetState({ pins: [], collages: [] });
  } else if (kind === 'sparse') {
    const pins = seedFeed().filter((p) =>
      ['civic-006', 'event-001', 'sell-001'].includes(p.id),
    );
    forceSetState({ pins, collages: [] });
  } else if (kind === 'dense') {
    forceSetState({ pins: densePins(), collages: clone(SEED_COLLAGES) });
  } else {
    // collage-heavy: seed + two extra groups
    const extraGroups = buildExtraCollages();
    forceSetState({
      pins: [...seedFeed(), ...extraGroups.pins],
      collages: [...clone(SEED_COLLAGES), ...extraGroups.collages],
    });
  }
}

function buildExtraCollages(): { pins: CivicPin[]; collages: Collage[] } {
  const { center } = H_WEST_CLUSTER;
  const pins: CivicPin[] = [];
  const collages: Collage[] = [];
  for (let g = 0; g < 2; g++) {
    const geocode = { lat: jitter(center.lat, 0.01), lng: jitter(center.lng, 0.01) };
    const groupId = `extra-group-${g}`;
    const ids: string[] = [];
    for (let m = 0; m < 3; m++) {
      const id = `extra-${g}-${m}`;
      ids.push(id);
      pins.push({
        id,
        type: 'civic',
        category: 'garbage',
        title: `Grouped report ${g}-${m}`,
        body: 'Seeded by the collage-heavy lens.',
        geocode,
        createdAt: isoDaysAgo(m + 1),
        authorAnonymousLabel: 'Resident, H-West',
        clusterId: H_WEST_CLUSTER.id,
        status: 'routed',
        statusHistory: [{ status: 'submitted', at: isoDaysAgo(m + 1) }],
        groupId,
        confirmations: 0,
      } as CivicPin);
    }
    collages.push({
      groupId,
      category: 'garbage',
      geocode,
      pinIds: ids,
      firstReportAt: isoDaysAgo(3),
      latestReportAt: isoDaysAgo(1),
    });
  }
  return { pins, collages };
}

/** Toggle the presence of a pin type: removed → restore from seed, present → strip. */
export function toggleType(type: PinType): void {
  const pins = getState().pins;
  const present = pins.some((p) => p.type === type);
  if (present) {
    forceSetState({ pins: pins.filter((p) => p.type !== type) });
  } else {
    const restored = seedFeed().filter((p) => p.type === type);
    forceSetState({ pins: [...pins, ...restored] });
  }
}

/** Expire or un-expire all non-civic posts. */
export function setNonCivicExpiry(expired: boolean): void {
  const when = expired ? isoDaysAgo(1) : isoDaysFromNow(7);
  forceSetState({
    pins: getState().pins.map((p) =>
      p.type !== 'civic' ? ({ ...p, expiresAt: when } as Pin) : p,
    ),
  });
}
