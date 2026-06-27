/* Time helpers — elapsed time shown honestly, tabular figures in the UI.
   All "now" reads route through getNow() so the Test Console's clock offset can
   fast-forward the civic timeline without waiting real days (Phase 13). */

import { getClockOffset } from './overrides';

export function getNow(): number {
  return Date.now() + getClockOffset();
}

export function timeAgo(iso: string): string {
  const diff = getNow() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const wks = Math.floor(days / 7);
  return `${wks}w ago`;
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - getNow();
  if (diff <= 0) return 'expired';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h left`;
  const days = Math.floor(hrs / 24);
  return `${days}d left`;
}

export function daysBetween(aIso: string, bIso: string): number {
  const diff = Math.abs(new Date(bIso).getTime() - new Date(aIso).getTime());
  return Math.floor(diff / 86400000);
}

export function daysSince(iso: string): number {
  return Math.floor((getNow() - new Date(iso).getTime()) / 86400000);
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < getNow();
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
