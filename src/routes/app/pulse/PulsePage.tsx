import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Map as MapIcon, List as ListIcon, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

import Chip from '../../../components/Chip';
import EmptyState from '../../../components/EmptyState';
import PinCard from '../../../components/PinCard';
import Card from '../../../components/Card';
import { TypeBadge } from '../../../components/pin/pinVisuals';
import ClusteredMarkers from './ClusteredMarkers';
import { buildMapItems, sortNewestFirst } from './mapItems';
import type { MapItem } from './mapItems';

import { getState } from '../../../data/store';
import { log } from '../../../lib/log';
import { H_WEST_CLUSTER } from '../../../data/cluster';
import type { PinType } from '../../../types/pin';

type Filter = PinType | 'all';
const FILTERS: Filter[] = ['all', 'civic', 'event', 'help', 'sell', 'buy', 'service'];
const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  civic: 'Civic',
  event: 'Events',
  help: 'Help',
  sell: 'Sell',
  buy: 'Buy',
  service: 'Service',
};

export default function PulsePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<'map' | 'list'>('map');

  const { pins, collages } = getState();

  const allItems = useMemo(() => buildMapItems(pins, collages), [pins, collages]);
  const filteredItems = useMemo(
    () => (filter === 'all' ? allItems : allItems.filter((i) => i.type === filter)),
    [allItems, filter],
  );
  const listItems = useMemo(() => sortNewestFirst(filteredItems), [filteredItems]);

  const handleFilter = (f: Filter) => {
    setFilter(f);
    log('filter_changed', { filter: f });
  };

  const handleSelect = useCallback(
    (item: MapItem) => {
      if (item.kind === 'collage') {
        log('collage_opened', { groupId: item.groupId });
        navigate(`/app/collage/${item.groupId}`);
      } else {
        log('pin_opened', { type: item.type, id: item.id });
        navigate(`/app/pin/${item.id}`);
      }
    },
    [navigate],
  );

  const isEmpty = filteredItems.length === 0;
  const center: [number, number] = [H_WEST_CLUSTER.center.lat, H_WEST_CLUSTER.center.lng];

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-paper">
      {/* ── Top controls ── */}
      <div className="absolute top-0 inset-x-0 z-20 px-3 pt-3 pb-2 flex flex-col gap-2 bg-gradient-to-b from-paper/95 to-paper/0 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1"
            role="radiogroup"
            aria-label="Filter pins by type"
          >
            {FILTERS.map((f) => (
              <Chip
                key={f}
                label={FILTER_LABELS[f]}
                pinType={f}
                active={filter === f}
                onClick={() => handleFilter(f)}
              />
            ))}
          </div>
        </div>

        {/* Map / list toggle */}
        <div className="pointer-events-auto self-start">
          <div className="inline-flex rounded-pill bg-paper-raised border border-line p-0.5 shadow-elevation-1">
            <ToggleButton active={view === 'map'} onClick={() => setView('map')} icon={<MapIcon size={16} />} label="Map" />
            <ToggleButton active={view === 'list'} onClick={() => setView('list')} icon={<ListIcon size={16} />} label="List" />
          </div>
        </div>
      </div>

      {/* ── Map view ── */}
      {view === 'map' && (
        <MapContainer
          center={center}
          zoom={H_WEST_CLUSTER.defaultZoom}
          className="absolute inset-0 z-0"
          zoomControl={false}
          attributionControl
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
            maxZoom={20}
          />
          <ClusteredMarkers items={filteredItems} onSelect={handleSelect} />
        </MapContainer>
      )}

      {/* Map empty overlay */}
      {view === 'map' && isEmpty && (
        <div className="absolute inset-x-0 bottom-28 top-32 z-10 flex items-center justify-center px-6 pointer-events-none">
          <div className="pointer-events-auto bg-paper-raised rounded-xl shadow-elevation-2 max-w-xs">
            <EmptyState
              message="Nothing of this kind nearby right now."
              sub="Try another filter, or be the first to post."
            />
          </div>
        </div>
      )}

      {/* ── List view ── */}
      {view === 'list' && (
        <div className="absolute inset-0 z-0 overflow-y-auto pt-32 pb-28 px-4">
          {isEmpty ? (
            <EmptyState
              message="Nothing of this kind nearby right now."
              sub="Try another filter, or be the first to post."
            />
          ) : (
            <ul className="flex flex-col gap-3 max-w-lg mx-auto">
              {listItems.map((item) =>
                item.kind === 'collage' ? (
                  <CollageListCard key={item.groupId} item={item} onClick={() => handleSelect(item)} />
                ) : (
                  <PinCard key={item.id} pin={item.pin} onClick={() => handleSelect(item)} />
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
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

function CollageListCard({
  item,
  onClick,
}: {
  item: Extract<MapItem, { kind: 'collage' }>;
  onClick: () => void;
}) {
  return (
    <Card as="li" onClick={onClick} className="flex gap-3 items-center list-none">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <TypeBadge type="civic" />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-cobalt">
            <Layers size={12} aria-hidden="true" />
            {item.count} reports
          </span>
        </div>
        <p className="text-base font-semibold text-ink leading-snug">{item.title}</p>
        <p className="text-sm text-ink-soft mt-0.5">Same spot, grouped together.</p>
      </div>
    </Card>
  );
}
