import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import Button from '../../../components/Button';
import EmptyState from '../../../components/EmptyState';
import PinCard from '../../../components/PinCard';
import { PinMarkerSvg } from '../../../components/pin/pinVisuals';
import { getCollage, getCollageMembers } from '../../../data/store';
import { timeAgo, daysBetween } from '../../../lib/time';
import { isImageSrc } from '../../../lib/photo';

/* Fanned civic heads — the collage signature, several reports at one spot.
   On open the stacked heads fan out (the catalogue's collage beat). */
function FannedHeads({ count }: { count: number }) {
  const reduce = useReducedMotion();
  const heads = Math.min(count, 3);
  const offsets = [-14, 0, 14];
  const rotations = [-12, 0, 12];
  return (
    <div className="relative h-14 w-24 mx-auto" aria-hidden="true">
      {Array.from({ length: heads }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-0"
          style={{ zIndex: i === 1 ? 3 : 1 }}
          initial={reduce ? false : { x: -20, rotate: 0, opacity: 0 }}
          animate={{ x: offsets[i] - 20, rotate: rotations[i], opacity: 1 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 20, delay: i * 0.06 }}
        >
          <PinMarkerSvg type="civic" size={40} />
        </motion.div>
      ))}
    </div>
  );
}

export default function CollagePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const collage = groupId ? getCollage(groupId) : undefined;
  const members = groupId ? getCollageMembers(groupId) : [];

  if (!collage || members.length === 0) {
    return (
      <div className="min-h-[100svh] bg-paper">
        <Header onBack={() => navigate(-1)} title="Grouped reports" />
        <EmptyState message="This group is no longer here." />
      </div>
    );
  }

  const span = daysBetween(collage.firstReportAt, collage.latestReportAt);
  const withPhotos = members.filter((m) => m.photo);

  return (
    <div className="min-h-[100svh] bg-paper">
      <Header onBack={() => navigate(-1)} title="Grouped reports" />
      <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5 pb-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <FannedHeads count={members.length} />
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {members.length} reports at one spot
          </h1>
          <p className="text-sm text-ink-soft max-w-xs">
            Neighbours have flagged the same place. Grouped together so it reads as one thing, not noise.
          </p>
          <div className="inline-flex items-center gap-1.5 text-sm text-ink-faint tabular-nums">
            <Clock size={14} aria-hidden="true" />
            First {timeAgo(collage.firstReportAt)} · latest {timeAgo(collage.latestReportAt)}
            {span > 0 && <> · spanning {span} day{span === 1 ? '' : 's'}</>}
          </div>
        </div>

        {/* Grouped photos */}
        {withPhotos.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Photos from neighbours</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {withPhotos.map((m) =>
                m.photo && isImageSrc(m.photo) ? (
                  <img key={m.id} src={m.photo} alt="" className="w-24 h-24 rounded-md object-cover border border-line flex-shrink-0" />
                ) : (
                  <div key={m.id} className="w-24 h-24 rounded-md bg-paper-raised border border-line flex items-center justify-center text-xs text-ink-faint flex-shrink-0">
                    Photo
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Member reports */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">The reports</span>
          <ul className="flex flex-col gap-3">
            {members.map((m) => (
              <PinCard key={m.id} pin={m} onClick={() => navigate(`/app/pin/${m.id}`)} />
            ))}
          </ul>
        </div>

        <Button variant="secondary" fullWidth onClick={() => navigate('/app/pulse')}>
          Back to the map
        </Button>
      </div>
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-paper/95 border-b border-line">
      <button
        onClick={onBack}
        aria-label="Back"
        className="w-11 h-11 flex items-center justify-center rounded-pill text-ink hover:bg-line transition-colors"
      >
        <ArrowLeft size={22} aria-hidden="true" />
      </button>
      <h1 className="text-lg font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h1>
    </header>
  );
}
