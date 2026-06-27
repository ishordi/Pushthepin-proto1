/*
  Build the set of items shown on the map and in the list.
  Civic pins that belong to a collage of 2+ reports collapse into one collage
  item (the structural case). Everything else is an individual pin item.
  Non-civic pins past expiry are dropped from the feed cleanly.
*/

import type { Pin, Collage, PinType } from '../../../types/pin';
import { isCivic } from '../../../types/pin';
import { isExpired } from '../../../lib/time';

export interface PinItem {
  kind: 'pin';
  id: string;
  type: PinType;
  title: string;
  lat: number;
  lng: number;
  createdAt: string;
  resolved: boolean;
  pin: Pin;
}

export interface CollageItem {
  kind: 'collage';
  groupId: string;
  type: PinType;
  title: string;
  lat: number;
  lng: number;
  createdAt: string; // latest report, for newest-first sorting
  count: number;
}

export type MapItem = PinItem | CollageItem;

export function buildMapItems(pins: Pin[], collages: Collage[]): MapItem[] {
  const items: MapItem[] = [];
  const collagedPinIds = new Set<string>();

  // Collapse multi-report collages into one item each
  for (const collage of collages) {
    const members = pins.filter((p) => collage.pinIds.includes(p.id));
    if (members.length < 2) continue; // single report reads as a normal pin
    members.forEach((m) => collagedPinIds.add(m.id));
    items.push({
      kind: 'collage',
      groupId: collage.groupId,
      type: 'civic',
      title: `${members.length} reports at this spot`,
      lat: collage.geocode.lat,
      lng: collage.geocode.lng,
      createdAt: collage.latestReportAt,
      count: members.length,
    });
  }

  // Individual pins (skip those folded into a collage, skip expired non-civic)
  for (const pin of pins) {
    if (collagedPinIds.has(pin.id)) continue;
    if (!isCivic(pin) && isExpired(pin.expiresAt)) continue;
    items.push({
      kind: 'pin',
      id: pin.id,
      type: pin.type,
      title: pin.title,
      lat: pin.geocode.lat,
      lng: pin.geocode.lng,
      createdAt: pin.createdAt,
      resolved: isCivic(pin) && (pin.status === 'resolved' || pin.status === 'closed'),
      pin,
    });
  }

  return items;
}

export function sortNewestFirst(items: MapItem[]): MapItem[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
