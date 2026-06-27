import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import Button from '../../../components/Button';
import Chip from '../../../components/Chip';
import TextInput from '../../../components/TextInput';
import Textarea from '../../../components/Textarea';
import PhotoUploadTile from '../../../components/PhotoUploadTile';
import LocationConfirm from '../../../components/LocationConfirm';
import Vipin from '../../../components/Vipin';
import { PIN_VISUALS, PinMarkerSvg } from '../../../components/pin/pinVisuals';

import { createPin, findNearbyCivic, addCivicToGroup, getCollage } from '../../../data/store';
import { log } from '../../../lib/log';
import { haptic } from '../../../lib/haptics';
import { H_WEST_CLUSTER } from '../../../data/cluster';
import { Layers } from 'lucide-react';
import type { Pin, PinType, CivicPin, CivicCategory, Geocode } from '../../../types/pin';

const CREATE_TYPES: PinType[] = ['civic', 'event', 'help', 'sell', 'buy', 'service'];

const TYPE_TAGLINE: Record<PinType, string> = {
  civic: 'Report something that needs fixing',
  event: 'Something happening nearby',
  help: 'Ask the neighbourhood for something',
  sell: 'Offer something for sale',
  buy: 'Look for something to buy',
  service: 'Offer a service',
};

interface FieldConfig {
  titleLabel: string;
  titlePlaceholder: string;
  bodyLabel: string;
  bodyPlaceholder: string;
  category?: boolean;
  datetime?: boolean;
  duration?: boolean;
  photo?: boolean;
}

const FIELDS: Record<PinType, FieldConfig> = {
  civic: {
    titleLabel: 'What did you see?',
    titlePlaceholder: 'e.g. Open drain cover near the lane',
    bodyLabel: 'A little more',
    bodyPlaceholder: 'Where exactly, and what is the situation.',
    category: true,
    photo: true,
  },
  event: {
    titleLabel: 'What is happening?',
    titlePlaceholder: 'e.g. Sunday cleanup walk',
    bodyLabel: 'Details',
    bodyPlaceholder: 'Who it is for, what to bring.',
    datetime: true,
  },
  help: {
    titleLabel: 'What do you need?',
    titlePlaceholder: 'e.g. A ladder for an hour',
    bodyLabel: 'Details',
    bodyPlaceholder: 'Anything that helps a neighbour respond.',
    duration: true,
  },
  sell: {
    titleLabel: 'What are you selling?',
    titlePlaceholder: 'e.g. Study table, barely used',
    bodyLabel: 'Details',
    bodyPlaceholder: 'Condition, and how to collect.',
    photo: true,
  },
  buy: {
    titleLabel: 'What are you looking for?',
    titlePlaceholder: 'e.g. Second-hand cycle',
    bodyLabel: 'Details',
    bodyPlaceholder: 'Anything that helps someone offer it.',
    photo: true,
  },
  service: {
    titleLabel: 'What do you offer?',
    titlePlaceholder: 'e.g. Maths and science home tutor',
    bodyLabel: 'Details',
    bodyPlaceholder: 'Who it is for, when you are available.',
  },
};

const CATEGORIES: CivicCategory[] = ['pothole', 'garbage', 'water', 'streetlight', 'footpath', 'other'];
const CATEGORY_LABEL: Record<CivicCategory, string> = {
  pothole: 'Pothole', garbage: 'Garbage', water: 'Water',
  streetlight: 'Streetlight', footpath: 'Footpath', other: 'Other',
};

const DURATIONS = [
  { label: 'A day', days: 1 },
  { label: '3 days', days: 3 },
  { label: 'A week', days: 7 },
];

const ANON_LABEL = 'A neighbour, H-West';

type Step = 'choose' | 'form' | 'match' | 'done';

export default function CreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('choose');
  const [type, setType] = useState<PinType | null>(null);

  // form fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<CivicCategory | null>(null);
  const [datetime, setDatetime] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [photo, setPhoto] = useState<string | undefined>();
  const [geocode, setGeocode] = useState<Geocode>({ ...H_WEST_CLUSTER.center });
  const [createdId, setCreatedId] = useState<string | null>(null);

  // upvote-or-add (civic collage) state
  const [matchTarget, setMatchTarget] = useState<CivicPin | null>(null);
  const [pendingPin, setPendingPin] = useState<Pin | null>(null);

  function chooseType(t: PinType) {
    haptic('tick'); // type-select beat
    setType(t);
    setStep('form');
    log('create_started', { type: t });
  }

  function backFromForm() {
    setStep('choose');
    setType(null);
  }

  const cfg = type ? FIELDS[type] : null;
  const canSubmit =
    !!type &&
    title.trim().length > 0 &&
    (!cfg?.category || !!category) &&
    (!cfg?.datetime || !!datetime);

  function buildPin(): Pin {
    const now = new Date().toISOString();
    const id = `${type}-${Date.now()}`;
    const base = {
      id,
      title: title.trim(),
      body: body.trim(),
      geocode,
      createdAt: now,
      authorAnonymousLabel: ANON_LABEL,
      clusterId: H_WEST_CLUSTER.id,
      ...(photo ? { photo } : {}),
    };

    if (type === 'civic') {
      const civic: CivicPin = {
        ...base,
        type: 'civic',
        category: category ?? 'other',
        status: 'submitted',
        statusHistory: [{ status: 'submitted', at: now }],
        confirmations: 0,
      };
      return civic;
    }

    let expiresAt: string;
    if (type === 'event') {
      expiresAt = datetime ? new Date(datetime).toISOString() : isoIn(1);
    } else if (type === 'help') {
      expiresAt = isoIn(durationDays);
    } else if (type === 'service') {
      expiresAt = isoIn(60);
    } else {
      expiresAt = isoIn(7); // sell, buy
    }

    return {
      ...base,
      type: type!,
      expiresAt,
      ...(type === 'event' ? { interestedCount: 0 } : {}),
    } as Pin;
  }

  function handleSubmit() {
    if (!canSubmit || !type) return;
    const pin = buildPin();

    // Civic only: if there is already a report at this spot, offer to join it.
    if (type === 'civic') {
      const nearby = findNearbyCivic(pin.geocode);
      if (nearby) {
        setMatchTarget(nearby);
        setPendingPin(pin);
        setStep('match');
        return;
      }
    }
    finalizeCreate(pin);
  }

  function finalizeCreate(pin: Pin) {
    createPin(pin);
    setCreatedId(pin.id);
    log('create_completed', { type: pin.type });
    if (pin.type === 'civic') {
      log('civic_submitted', { id: pin.id });
      haptic('success');
    } else {
      haptic('confirm');
    }
    setStep('done');
  }

  // user says "yes, same thing" → add to the existing group (pin snaps to the spot)
  function joinGroup() {
    if (!pendingPin || !matchTarget || pendingPin.type !== 'civic') return;
    addCivicToGroup(pendingPin, matchTarget.id);
    setCreatedId(pendingPin.id);
    log(pendingPin.photo ? 'add_photo_chosen' : 'upvote_chosen', { target: matchTarget.id });
    log('create_completed', { type: 'civic' });
    log('civic_submitted', { id: pendingPin.id });
    haptic('success');
    setStep('done');
  }

  // user says "it's different" → post it separately
  function postSeparately() {
    if (!pendingPin) return;
    finalizeCreate(pendingPin);
  }

  // ── Render ──
  if (step === 'choose') {
    return (
      <FocusLayout title="Create" onBack={() => navigate('/app/pulse')}>
        <p className="text-base text-ink-soft mb-4">What would you like to put on the map?</p>
        <div className="grid grid-cols-1 gap-3">
          {CREATE_TYPES.map((t) => (
            <TypeOption key={t} type={t} onSelect={() => chooseType(t)} />
          ))}
        </div>
      </FocusLayout>
    );
  }

  if (step === 'form' && type && cfg) {
    return (
      <FocusLayout title={PIN_VISUALS[type].label} onBack={backFromForm}>
        <div className="flex flex-col gap-5">
          {cfg.category && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-ink-soft mb-1">Category</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    label={CATEGORY_LABEL[c]}
                    pinType="civic"
                    active={category === c}
                    onClick={() => setCategory(c)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <TextInput
            label={cfg.titleLabel}
            placeholder={cfg.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
          />

          {cfg.datetime && (
            <div className="flex flex-col gap-1">
              <label htmlFor="event-when" className="text-sm font-medium text-ink-soft">
                When
              </label>
              <input
                id="event-when"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="min-h-[44px] w-full px-4 py-3 rounded-sm border border-line bg-paper-raised text-ink text-base"
              />
            </div>
          )}

          {cfg.duration && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-ink-soft mb-1">For how long</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Duration">
                {DURATIONS.map((d) => (
                  <Chip
                    key={d.days}
                    label={d.label}
                    pinType="help"
                    active={durationDays === d.days}
                    onClick={() => setDurationDays(d.days)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <Textarea
            label={cfg.bodyLabel}
            placeholder={cfg.bodyPlaceholder}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={400}
          />

          {cfg.photo && <PhotoUploadTile value={photo} onChange={setPhoto} />}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Where is it?</span>
            <LocationConfirm type={type} value={geocode} onChange={setGeocode} />
          </div>

          <Button onClick={handleSubmit} disabled={!canSubmit} fullWidth>
            {type === 'civic' ? 'Submit report' : 'Post to the map'}
          </Button>
        </div>
      </FocusLayout>
    );
  }

  if (step === 'match' && matchTarget) {
    return (
      <FocusLayout title="Is this the same thing?" onBack={() => setStep('form')}>
        <MatchPrompt
          target={matchTarget}
          hasPhoto={!!pendingPin?.photo}
          onJoin={joinGroup}
          onSeparate={postSeparately}
        />
      </FocusLayout>
    );
  }

  // step === 'done'
  return (
    <DoneScreen
      type={type!}
      onView={() => createdId && navigate(`/app/pin/${createdId}`)}
      onMap={() => navigate('/app/pulse')}
    />
  );
}

function isoIn(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/* ── Focused-task layout: a single clear back path, no floating nav ── */
function FocusLayout({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] bg-paper">
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
      <div className="px-4 py-4 max-w-lg mx-auto pb-12">{children}</div>
    </div>
  );
}

function MatchPrompt({
  target,
  hasPhoto,
  onJoin,
  onSeparate,
}: {
  target: CivicPin;
  hasPhoto: boolean;
  onJoin: () => void;
  onSeparate: () => void;
}) {
  const collage = target.groupId ? getCollage(target.groupId) : undefined;
  const existingCount = collage ? collage.pinIds.length : 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <Vipin mood="hello" size={56} />
        <p className="text-base text-ink-soft leading-relaxed">
          There {existingCount === 1 ? 'is already a report' : `are already ${existingCount} reports`} at this exact spot.
          Is your report the same thing?
        </p>
      </div>

      <div className="rounded-lg border border-line bg-paper-raised p-4 flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cobalt">
          <Layers size={12} aria-hidden="true" />
          Already here
        </span>
        <span className="text-base font-semibold text-ink">{target.title}</span>
        <span className="text-sm text-ink-soft">{target.authorAnonymousLabel}</span>
      </div>

      <p className="text-sm text-ink-faint">
        If it’s the same, we’ll place your report at the same spot and add it to the group, so the
        neighbourhood sees one clear thing — and {hasPhoto ? 'your photo joins the record' : 'your report adds weight'}.
      </p>

      <div className="flex flex-col gap-2">
        <Button fullWidth onClick={onJoin}>
          Yes, it’s the same — add mine
        </Button>
        <Button variant="secondary" fullWidth onClick={onSeparate}>
          No, it’s different — post separately
        </Button>
      </div>
    </div>
  );
}

function TypeOption({ type, onSelect }: { type: PinType; onSelect: () => void }) {
  const visual = PIN_VISUALS[type];
  const Glyph = visual.glyph;
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-4 w-full p-4 rounded-lg bg-paper-raised border border-line shadow-elevation-1 text-left hover:shadow-elevation-2 active:scale-[0.99] transition-all min-h-[72px]"
    >
      <span
        className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: visual.colorVar }}
      >
        <Glyph size={24} color={visual.glyphOnLight ? 'var(--color-ink)' : 'var(--color-paper-raised)'} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span className="text-base font-bold text-ink">{visual.label}</span>
        <span className="text-sm text-ink-soft">{TYPE_TAGLINE[type]}</span>
      </span>
    </button>
  );
}

function DoneScreen({ type, onView, onMap }: { type: PinType; onView: () => void; onMap: () => void }) {
  const reduce = useReducedMotion();
  const isCivicType = type === 'civic';

  return (
    <div className="min-h-[100svh] bg-paper flex flex-col items-center justify-center px-6 text-center gap-5">
      {/* The pin-drop beat */}
      <div className="h-[60px] flex items-end justify-center">
        <motion.div
          initial={reduce ? { y: 0, opacity: 1 } : { y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 14 }}
        >
          <PinMarkerSvg type={type} size={48} />
        </motion.div>
      </div>

      <Vipin mood="pleased" size={84} />

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          {isCivicType ? 'Report noted.' : 'It’s on the map.'}
        </h1>
        <p className="text-base text-ink-soft leading-relaxed">
          {isCivicType
            ? 'Thanks for keeping a record for the street. It will be checked, then routed. The city can be slow, so this may take a while — we will keep you posted honestly, every step.'
            : 'Your post is live for neighbours nearby. It will stay up until it expires.'}
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button onClick={onView} fullWidth>
          View it
        </Button>
        <Button variant="secondary" onClick={onMap} fullWidth>
          Back to the map
        </Button>
      </div>
    </div>
  );
}
