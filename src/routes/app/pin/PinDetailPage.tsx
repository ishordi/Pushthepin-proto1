import { useReducer, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Hash, Users, Layers } from 'lucide-react';
import BottomSheet from '../../../components/BottomSheet';
import Button from '../../../components/Button';
import EmptyState from '../../../components/EmptyState';
import Vipin from '../../../components/Vipin';
import PhotoUploadTile from '../../../components/PhotoUploadTile';
import { TypeBadge } from '../../../components/pin/pinVisuals';
import CivicTracker from '../../../components/civic/CivicTracker';
import ResolutionReveal from '../../../components/civic/ResolutionReveal';
import {
  getPinById,
  getCollageForPin,
  addResolutionPhoto,
  confirmCivicPin,
} from '../../../data/store';
import { log } from '../../../lib/log';
import { haptic } from '../../../lib/haptics';
import { isCivic } from '../../../types/pin';
import type { CivicCategory } from '../../../types/pin';
import { timeAgo, timeUntil } from '../../../lib/time';
import { haversineMeters, formatDistance } from '../../../lib/geo';
import { H_WEST_CLUSTER } from '../../../data/cluster';
import { isImageSrc } from '../../../lib/photo';

const CATEGORY_LABEL: Record<CivicCategory, string> = {
  pothole: 'Pothole', garbage: 'Garbage', water: 'Water',
  streetlight: 'Streetlight', footpath: 'Footpath', other: 'Other',
};

function PhotoBlock({ photo }: { photo: string }) {
  if (isImageSrc(photo)) {
    return <img src={photo} alt="" className="w-full rounded-lg border border-line object-cover max-h-64" />;
  }
  return (
    <div className="w-full h-40 rounded-lg bg-paper flex items-center justify-center border border-line text-ink-faint text-sm">
      Photo
    </div>
  );
}

export default function PinDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, force] = useReducer((x) => x + 1, 0);
  const [showResolveUpload, setShowResolveUpload] = useState(false);
  const [justResolvedId, setJustResolvedId] = useState<string | null>(null);

  const pin = id ? getPinById(id) : undefined;
  const close = () => navigate(-1);

  if (!pin) {
    return (
      <BottomSheet open onClose={close} title="Not found">
        <EmptyState message="This pin is no longer here." sub="It may have expired or been removed." />
        <Button variant="secondary" fullWidth onClick={close}>
          Back
        </Button>
      </BottomSheet>
    );
  }

  const dist = formatDistance(haversineMeters(H_WEST_CLUSTER.center, pin.geocode));
  const collage = isCivic(pin) ? getCollageForPin(pin.id) : undefined;

  function handleResolutionPhoto(dataUrl: string | undefined) {
    if (!dataUrl || !pin) return;
    addResolutionPhoto(pin.id, dataUrl);
    haptic('success');
    log('civic_resolved', { id: pin.id });
    setJustResolvedId(pin.id);
    setShowResolveUpload(false);
    force();
  }

  function handleConfirm() {
    if (!pin) return;
    confirmCivicPin(pin.id);
    haptic('confirm');
    force();
  }

  const canResolve = isCivic(pin) && (pin.status === 'routed' || pin.status === 'waiting') && !pin.resolutionPhoto;
  const canConfirm = isCivic(pin) && pin.status === 'resolved';

  return (
    <BottomSheet open onClose={close}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={pin.type} />
          {!isCivic(pin) && pin.isBusiness && (
            <span className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold bg-ink text-paper-raised">
              Business
            </span>
          )}
          {isCivic(pin) && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft">
              <Hash size={12} aria-hidden="true" />
              {CATEGORY_LABEL[pin.category] ?? pin.category}
            </span>
          )}
          {collage && (
            <button
              onClick={() => navigate(`/app/collage/${collage.groupId}`)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-cobalt min-h-[44px]"
            >
              <Layers size={12} aria-hidden="true" />
              {collage.pinIds.length} reports here
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold text-ink leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {pin.title}
        </h1>

        {/* Photo: standalone unless it's the "before" in a resolution reveal */}
        {pin.photo && !(isCivic(pin) && pin.resolutionPhoto) && <PhotoBlock photo={pin.photo} />}

        <p className="text-base text-ink-soft leading-relaxed whitespace-pre-line">{pin.body}</p>

        <div className="flex flex-col gap-1.5 text-sm text-ink-faint tabular-nums">
          <span>{pin.authorAnonymousLabel}</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" />
            {timeAgo(pin.createdAt)}
            {!isCivic(pin) && <> · {timeUntil(pin.expiresAt)}</>}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} aria-hidden="true" />
            {dist} away
          </span>
          {!isCivic(pin) && pin.type === 'event' && pin.interestedCount != null && (
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} aria-hidden="true" />
              {pin.interestedCount} interested
            </span>
          )}
        </div>

        {/* ── Civic loop ── */}
        {isCivic(pin) && (
          <div className="flex flex-col gap-4 rounded-lg border border-line bg-paper p-4">
            <CivicTracker status={pin.status} statusHistory={pin.statusHistory} confirmations={pin.confirmations} />
            {pin.mockComplaintRef && (
              <span className="text-xs text-ink-faint tabular-nums">BMC reference {pin.mockComplaintRef}</span>
            )}

            {/* The dead-zone wait — hold the user steady, honestly */}
            {pin.status === 'waiting' && (
              <div className="flex items-start gap-3 rounded-md bg-amber/10 p-3">
                <Vipin mood="patient" size={48} />
                <p className="text-sm text-ink-soft leading-relaxed">
                  It’s with the city now. This is the slow part — days can pass with nothing visible.
                  That’s normal, not broken. We’ll show you the moment anything changes.
                </p>
              </div>
            )}

            {/* The proof: before & after */}
            {pin.resolutionPhoto && (
              <ResolutionReveal
                beforePhoto={pin.photo}
                afterPhoto={pin.resolutionPhoto}
                justRevealed={justResolvedId === pin.id}
              />
            )}

            {/* Add the after photo → resolved */}
            {canResolve && (
              showResolveUpload ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink-soft">Add the after photo</span>
                  <PhotoUploadTile onChange={handleResolutionPhoto} label="Add the after photo" />
                  <Button variant="ghost" onClick={() => setShowResolveUpload(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" fullWidth onClick={() => setShowResolveUpload(true)}>
                  Add a resolution photo
                </Button>
              )
            )}

            {/* Neighbour confirmation → closed */}
            {canConfirm && (
              <Button fullWidth onClick={handleConfirm}>
                Confirm it’s fixed
              </Button>
            )}
          </div>
        )}

        <Button variant="secondary" fullWidth onClick={close}>
          Close
        </Button>
      </div>
    </BottomSheet>
  );
}
