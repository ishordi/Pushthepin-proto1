/*
  Apply resident preferences to the document. The text-size control scales the
  whole interface from the 16px base (via html[data-text-size] in index.css),
  not just one screen — an age-inclusion requirement (PRS section 8).
*/

import { getState } from '../data/store';
import type { AppPrefs } from '../data/store';

export function applyTextSize(size: AppPrefs['textSize']): void {
  if (typeof document === 'undefined') return;
  if (size === 'large') {
    document.documentElement.dataset.textSize = 'large';
  } else {
    delete document.documentElement.dataset.textSize;
  }
}

/** Apply all persisted prefs to the document. Called once at startup. */
export function applyPrefsFromState(): void {
  applyTextSize(getState().prefs.textSize);
}
