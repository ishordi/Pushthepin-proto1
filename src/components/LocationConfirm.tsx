import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { createPinDivIcon } from './pin/markerIcons';
import { H_WEST_CLUSTER } from '../data/cluster';
import type { Geocode, PinType } from '../types/pin';

interface LocationConfirmProps {
  type: PinType;
  value: Geocode;
  onChange: (geocode: Geocode) => void;
}

/* Pans the map when the point moves (e.g. after locating). */
function Recenter({ value }: { value: Geocode }) {
  const map = useMap();
  map.panTo([value.lat, value.lng], { animate: true });
  return null;
}

export default function LocationConfirm({ type, value, onChange }: LocationConfirmProps) {
  const [accuracy, setAccuracy] = useState(120); // metres, phone-native
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('Drag the pin to the exact spot.');

  const icon = createPinDivIcon(type);

  const handleLocate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setNote('Location is not available. Drag the pin to the spot.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setAccuracy(Math.round(pos.coords.accuracy) || 60);
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNote('This is your phone’s location. Drag to nudge it.');
      },
      () => {
        setLocating(false);
        setNote('Could not get your location. Drag the pin to the spot.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md overflow-hidden border border-line h-56">
        <MapContainer
          center={[value.lat, value.lng]}
          zoom={16}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />
          <Circle
            center={[value.lat, value.lng]}
            radius={accuracy}
            pathOptions={{
              color: 'var(--color-cobalt)',
              fillColor: 'var(--color-cobalt)',
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
          <Marker
            position={[value.lat, value.lng]}
            draggable
            icon={icon}
            eventHandlers={{
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng();
                onChange({ lat: ll.lat, lng: ll.lng });
              },
            }}
          />
          <Recenter value={value} />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-ink-faint flex-1">{note}</p>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-pill border border-line bg-paper-raised text-sm font-medium text-cobalt hover:border-ink-faint transition-colors disabled:opacity-50"
        >
          <LocateFixed size={16} aria-hidden="true" />
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>
      <p className="text-xs text-ink-faint tabular-nums">
        Accuracy about {accuracy} m · {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
      </p>
    </div>
  );
}

export const DEFAULT_GEOCODE: Geocode = { ...H_WEST_CLUSTER.center };
