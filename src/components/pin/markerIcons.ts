/* Leaflet divIcon factories built from the React marker SVGs. */

import * as L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { PinMarkerSvg, CollageMarkerSvg, PIN_VISUALS } from './pinVisuals';
import type { PinType } from '../../types/pin';

export function createPinDivIcon(type: PinType, opts: { resolved?: boolean } = {}): L.DivIcon {
  const html = renderToStaticMarkup(
    createElement(PinMarkerSvg, { type, resolved: opts.resolved }),
  );
  return L.divIcon({
    html,
    className: 'ptp-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 49],
    popupAnchor: [0, -46],
  });
}

export function createCollageDivIcon(type: PinType, count: number): L.DivIcon {
  const html = renderToStaticMarkup(
    createElement(CollageMarkerSvg, { type, count }),
  );
  return L.divIcon({
    html,
    className: 'ptp-marker',
    iconSize: [48, 54],
    iconAnchor: [22, 52],
    popupAnchor: [0, -48],
  });
}

/* Cluster bubble: single-type carries that type colour at low saturation,
   mixed is neutral ink with a thin ring. */
export function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const markers = cluster.getAllChildMarkers();
  const count = cluster.getChildCount();
  const types = new Set<string>();
  markers.forEach((m) => {
    const t = (m as unknown as { pinType?: string }).pinType;
    if (t) types.add(t);
  });

  const single = types.size === 1 ? ([...types][0] as PinType) : null;
  const colorVar = single ? PIN_VISUALS[single].colorVar : 'var(--color-ink)';

  const html = single
    ? `<div class="ptp-cluster" style="--cluster-c:${colorVar}">${count}</div>`
    : `<div class="ptp-cluster ptp-cluster-mixed">${count}</div>`;

  return L.divIcon({
    html,
    className: 'ptp-cluster-wrap',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}
