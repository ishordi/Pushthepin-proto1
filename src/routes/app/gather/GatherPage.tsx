import { useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import * as L from 'leaflet';
import { Map as MapIcon, List as ListIcon, Clock, MapPin, Users, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import Card from '../../../components/Card';
import EmptyState from '../../../components/EmptyState';
import { TypeBadge } from '../../../components/pin/pinVisuals';
import { createPinDivIcon } from '../../../components/pin/markerIcons';
import { getState, addInterest } from '../../../data/store';
import { log } from '../../../lib/log';
import { haptic } from '../../../lib/haptics';
import { formatWhen, isExpired } from '../../../lib/time';
import { haversineMeters, formatDistance } from '../../../lib/geo';
import { H_WEST_CLUSTER } from '../../../data/cluster';
import type { NonCivicPin } from '../../../types/pin';

export default function GatherPage() {
  const navigate = useNavigate();
  const [, force] = useReducer((x) => x + 1, 0);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());

  const { pins } = getState();
  const events = useMemo(
    () =>
      pins
        .filter((p): p is NonCivicPin => p.type === 'event' && !isExpired(p.expiresAt))
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()),
    [pins],
  );

  function handleInterested(id: string) {
    if (interestedIds.has(id)) return;
    addInterest(id);
    setInterestedIds((prev) => new Set(prev).add(id));
    log('interested_tapped', { id });
    haptic('tick');
    force();
  }

  const center: [number, number] = [H_WEST_CLUSTER.center.lat, H_WEST_CLUSTER.center.lng];

  return (
    <div className="min-h-[100svh] bg-paper">
      <header className="sticky top-0 z-10 px-4 pt-4 pb-3 bg-paper/95 border-b border-line flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            Gather
          </h1>
          <p className="text-sm text-ink-faint">What’s on nearby</p>
        </div>
        <div className="inline-flex rounded-pill bg-paper-raised border border-line p-0.5">
          <ToggleButton active={view === 'list'} onClick={() => setView('list')} icon={<ListIcon size={16} />} label="List" />
          <ToggleButton active={view === 'map'} onClick={() => setView('map')} icon={<MapIcon size={16} />} label="Map" />
        </div>
      </header>

      {events.length === 0 ? (
        <EmptyState message="Nothing on right now." sub="When neighbours post events, they’ll show up here." />
      ) : view === 'list' ? (
        <ul className="flex flex-col gap-3 px-4 py-4 pb-28 max-w-lg mx-auto">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              interested={interestedIds.has(ev.id)}
              onInterested={() => handleInterested(ev.id)}
              onOpen={() => navigate(`/app/pin/${ev.id}`)}
            />
          ))}
        </ul>
      ) : (
        <div className="h-[calc(100svh-150px)] w-full">
          <MapContainer center={center} zoom={H_WEST_CLUSTER.defaultZoom} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" maxZoom={20} />
            {events.map((ev) => (
              <Marker
                key={ev.id}
                position={[ev.geocode.lat, ev.geocode.lng]}
                icon={createPinDivIcon('event')}
                eventHandlers={{ click: () => navigate(`/app/pin/${ev.id}`) }}
                {...({ title: ev.title } as L.MarkerOptions)}
              />
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  interested,
  onInterested,
  onOpen,
}: {
  event: NonCivicPin;
  interested: boolean;
  onInterested: () => void;
  onOpen: () => void;
}) {
  const dist = formatDistance(haversineMeters(H_WEST_CLUSTER.center, event.geocode));
  const count = event.interestedCount ?? 0;

  return (
    <Card as="li" className="flex flex-col gap-2 list-none">
      <button onClick={onOpen} className="text-left flex flex-col gap-2">
        <TypeBadge type="event" />
        <p className="text-base font-semibold text-ink leading-snug">{event.title}</p>
        <p className="text-sm text-ink-soft line-clamp-2">{event.body}</p>
        <div className="flex flex-col gap-1 text-xs text-ink-faint tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} aria-hidden="true" />
            {formatWhen(event.expiresAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} aria-hidden="true" />
            {dist} away · {event.authorAnonymousLabel}
          </span>
        </div>
      </button>
      <div className="flex items-center justify-between pt-1 border-t border-line">
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft tabular-nums">
          <Users size={15} aria-hidden="true" />
          {count} interested
        </span>
        <button
          onClick={onInterested}
          disabled={interested}
          aria-pressed={interested}
          className={[
            'inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-pill text-sm font-semibold transition-colors',
            interested
              ? 'bg-green/15 text-green'
              : 'bg-paper text-cobalt border border-line hover:border-cobalt',
          ].join(' ')}
        >
          {interested ? <><Check size={15} aria-hidden="true" /> Interested</> : "I’m interested"}
        </button>
      </div>
    </Card>
  );
}

function ToggleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} view`}
      className={[
        'inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-pill text-sm font-medium transition-colors',
        active ? 'bg-cobalt text-paper-raised' : 'text-ink-soft hover:text-ink',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}
