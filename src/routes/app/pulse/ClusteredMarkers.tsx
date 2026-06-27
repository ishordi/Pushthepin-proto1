/* Raw leaflet.markercluster layer driven by react-leaflet's useMap.
   react-leaflet v5 has no cluster wrapper, so we manage the layer by hand. */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
// Default import (not `import * as L`): leaflet.markercluster mutates the leaflet
// module object at runtime to add markerClusterGroup. A `* as` namespace import
// is immutable in the production (rolldown) bundle, so that mutation never shows
// up and the map throws. The default export is the live, mutable leaflet object.
import L from 'leaflet';
import 'leaflet.markercluster';
import { createPinDivIcon, createCollageDivIcon, createClusterIcon } from '../../../components/pin/markerIcons';
import { haptic } from '../../../lib/haptics';
import type { MapItem } from './mapItems';

interface Props {
  items: MapItem[];
  onSelect: (item: MapItem) => void;
}

export default function ClusteredMarkers({ items, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    const group = L.markerClusterGroup({
      iconCreateFunction: createClusterIcon,
      showCoverageOnHover: false,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      chunkedLoading: true,
    });

    items.forEach((item) => {
      const icon =
        item.kind === 'collage'
          ? createCollageDivIcon(item.type, item.count)
          : createPinDivIcon(item.type, { resolved: item.resolved });

      const marker = L.marker([item.lat, item.lng], {
        icon,
        title: item.title,
        keyboard: true,
        alt: item.title,
      });
      // tag the marker with its type so the cluster icon can read it
      (marker as unknown as { pinType: string }).pinType = item.type;
      marker.on('click', () => onSelect(item));
      group.addLayer(marker);
    });

    // Cluster expand beat: leaflet springs the bubble open into its members.
    group.on('clusterclick', () => haptic('tick'));

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [items, map, onSelect]);

  return null;
}
