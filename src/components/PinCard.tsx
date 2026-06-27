import Card from './Card';
import { TypeBadge, PIN_VISUALS } from './pin/pinVisuals';
import type { Pin } from '../types/pin';
import { isCivic } from '../types/pin';
import { timeAgo, timeUntil } from '../lib/time';
import { haversineMeters, formatDistance } from '../lib/geo';
import { H_WEST_CLUSTER } from '../data/cluster';
import { isImageSrc } from '../lib/photo';
import { ImageIcon } from 'lucide-react';

interface PinCardProps {
  pin: Pin;
  onClick: () => void;
}

/* Real uploaded photos (data URLs) render directly. Seed/mock photo strings
   render a calm placeholder — we never load a fabricated URL. */
function PhotoThumb({ photo, type }: { photo: string; type: Pin['type'] }) {
  const colorVar = PIN_VISUALS[type].colorVar;
  if (isImageSrc(photo)) {
    return (
      <img
        src={photo}
        alt=""
        className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-line"
      />
    );
  }
  return (
    <div
      className="w-16 h-16 rounded-md flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `color-mix(in srgb, ${colorVar} 12%, var(--color-paper))` }}
      aria-hidden="true"
    >
      <ImageIcon size={20} className="text-ink-faint" />
    </div>
  );
}

export default function PinCard({ pin, onClick }: PinCardProps) {
  const dist = formatDistance(haversineMeters(H_WEST_CLUSTER.center, pin.geocode));
  const hasPhoto = !!pin.photo;

  return (
    <Card as="li" onClick={onClick} className="flex gap-3 items-start list-none">
      {hasPhoto && <PhotoThumb photo={pin.photo!} type={pin.type} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <TypeBadge type={pin.type} />
          {!isCivic(pin) && pin.isBusiness && (
            <span className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold bg-ink text-paper-raised">
              Business
            </span>
          )}
          {isCivic(pin) && pin.status === 'resolved' && (
            <span className="text-xs font-semibold text-green">Resolved</span>
          )}
          {isCivic(pin) && pin.status === 'closed' && (
            <span className="text-xs font-semibold text-green">Sorted</span>
          )}
        </div>
        <p className="text-base font-semibold text-ink leading-snug">{pin.title}</p>
        <p className="text-sm text-ink-soft mt-0.5 line-clamp-2">{pin.body}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-ink-faint tabular-nums">
          <span>{pin.authorAnonymousLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{timeAgo(pin.createdAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{dist}</span>
          {!isCivic(pin) && (
            <>
              <span aria-hidden="true">·</span>
              <span>{timeUntil(pin.expiresAt)}</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
