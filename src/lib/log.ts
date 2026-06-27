/* Thin wrapper around store.logEvent for convenience. */

import { logEvent as storeLog } from '../data/store';
import type { EventName } from '../types/events';

export function log(name: EventName, payload?: Record<string, unknown>): void {
  storeLog(name, payload);
}
