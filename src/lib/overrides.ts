/*
  Test Console overrides — a lens layer that sits on top of the real store and
  drives live, document-level behaviour (motion, contrast, grain, haptics) plus
  a global clock offset for the Time control. These are tester settings, not
  resident product state, so they live under their own key and never ship.
  Phase 13 only — changes no product behaviour, only a lens onto it.
*/

import { setHapticsForcedOff } from './haptics';

export type ReducedMotionMode = 'system' | 'on' | 'off';
export type MapStyle = 'positron' | 'voyager';
export type FeedFilter = 'all' | 'civic' | 'event' | 'help' | 'sell' | 'buy' | 'service';

export interface ConsoleOverrides {
  reducedMotion: ReducedMotionMode;
  highContrast: boolean;
  hapticsOff: boolean;
  grain: boolean;
  nav: boolean;
  businessPosts: boolean;
  mapStyle: MapStyle;
  clockOffsetMs: number;
  feedDefaultFilter: FeedFilter;
}

const KEY = 'ptp_console_overrides';

const DEFAULTS: ConsoleOverrides = {
  reducedMotion: 'system',
  highContrast: false,
  hapticsOff: false,
  grain: true,
  nav: true,
  businessPosts: true,
  mapStyle: 'positron',
  clockOffsetMs: 0,
  feedDefaultFilter: 'all',
};

function load(): ConsoleOverrides {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ConsoleOverrides>) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS };
}

let state: ConsoleOverrides = load();
let listeners: Array<() => void> = [];

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getOverrides(): ConsoleOverrides {
  return state;
}

export function getClockOffset(): number {
  return state.clockOffsetMs;
}

export function subscribeOverrides(cb: () => void): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function setOverrides(partial: Partial<ConsoleOverrides>): void {
  state = { ...state, ...partial };
  save();
  applyOverrides();
  listeners.forEach((l) => l());
}

export function resetOverrides(): void {
  state = { ...DEFAULTS };
  save();
  applyOverrides();
  listeners.forEach((l) => l());
}

/** Apply the document-level lenses (motion, contrast, grain, haptics). Called at
    startup and on every change. */
export function applyOverrides(): void {
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    if (state.highContrast) html.dataset.contrast = 'high';
    else delete html.dataset.contrast;

    if (state.reducedMotion === 'system') delete html.dataset.reducedMotion;
    else html.dataset.reducedMotion = state.reducedMotion; // 'on' | 'off'

    if (state.grain) delete html.dataset.grain;
    else html.dataset.grain = 'off';
  }
  setHapticsForcedOff(state.hapticsOff);
}
