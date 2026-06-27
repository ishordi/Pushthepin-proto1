/*
  Haptics — navigator.vibrate behind a capability check, silent no-op where
  unsupported (iOS Safari never vibrates, and that is fine). Patterns from
  DESIGN_SYSTEM.md section 8. The full motion+haptic catalogue is wired across
  the app in Phase 11; this is the shared primitive.
*/

export type HapticName = 'tick' | 'confirm' | 'success';

const PATTERNS: Record<HapticName, number | number[]> = {
  tick: 10,
  confirm: [15, 40, 25],
  success: [15, 30, 15, 30, 40],
};

let forcedOff = false;

/** Test Console can force haptics off independent of device settings. */
export function setHapticsForcedOff(off: boolean): void {
  forcedOff = off;
}

export function haptic(name: HapticName): void {
  if (forcedOff) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(PATTERNS[name]);
  } catch {
    /* silent no-op */
  }
}
