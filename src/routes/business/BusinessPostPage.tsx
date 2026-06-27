import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import PhotoUploadTile from '../../components/PhotoUploadTile';
import { addBusinessPin } from '../../data/store';
import { log } from '../../lib/log';
import { haptic } from '../../lib/haptics';
import { H_WEST_CLUSTER } from '../../data/cluster';
import type { NonCivicPin, BusinessPostType, PinType } from '../../types/pin';
import type { BusinessSession } from './BusinessPage';

const POST_TYPES: { key: BusinessPostType; label: string; mapsTo: Exclude<PinType, 'civic'> }[] = [
  { key: 'offer', label: 'Offer', mapsTo: 'sell' },
  { key: 'event', label: 'Event', mapsTo: 'event' },
  { key: 'notice', label: 'Notice', mapsTo: 'service' },
];

function isoIn(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function BusinessPostPage() {
  const session = useOutletContext<BusinessSession>();
  const navigate = useNavigate();
  const [postType, setPostType] = useState<BusinessPostType>('offer');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [posted, setPosted] = useState(false);

  function submit() {
    if (!title.trim()) return;
    const def = POST_TYPES.find((t) => t.key === postType)!;
    const now = new Date().toISOString();
    const pin: NonCivicPin = {
      id: `biz-${Date.now()}`,
      type: def.mapsTo,
      title: title.trim(),
      body: body.trim(),
      ...(photo ? { photo } : {}),
      geocode: { ...H_WEST_CLUSTER.center },
      createdAt: now,
      expiresAt: postType === 'event' ? isoIn(7) : isoIn(14),
      authorAnonymousLabel: session.businessName,
      clusterId: H_WEST_CLUSTER.id,
      isBusiness: true,
      businessName: session.businessName,
      postType,
      // mocked reach so the stats view has believable numbers from the start
      stats: { views: 14 + (Date.now() % 40), taps: 2 + (Date.now() % 8) },
    };
    addBusinessPin(pin);
    log('create_completed', { type: def.mapsTo, business: true, postType });
    haptic('confirm');
    setPosted(true);
  }

  if (posted) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-12 max-w-sm mx-auto">
        <CheckCircle size={48} className="text-green" aria-hidden="true" />
        <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          It’s live in the feed
        </h1>
        <p className="text-sm text-ink-soft">
          Your post is now on the neighbourhood map, clearly marked as from {session.businessName}.
          It shows because it’s nearby and recent.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button fullWidth onClick={() => window.open('/app/pulse', '_blank')}>
            See it in the feed
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/business/stats')}>
            View stats
          </Button>
          <Button variant="ghost" onClick={() => { setPosted(false); setTitle(''); setBody(''); setPhoto(undefined); }}>
            Post another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
        New post
      </h1>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink-soft mb-1">Post type</legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Post type">
          {POST_TYPES.map((t) => (
            <Chip key={t.key} label={t.label} pinType={t.mapsTo} active={postType === t.key} onClick={() => setPostType(t.key)} />
          ))}
        </div>
      </fieldset>

      <TextInput label="Title" placeholder="e.g. 20% off whole cakes this weekend" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
      <Textarea label="Details" placeholder="What’s on offer, and how to claim it." value={body} onChange={(e) => setBody(e.target.value)} maxLength={400} />
      <PhotoUploadTile value={photo} onChange={setPhoto} label="Add a photo (optional)" />

      <div className="flex items-start gap-2 rounded-md bg-paper-raised border border-line p-3">
        <span className="text-xs text-ink-faint leading-relaxed">
          Your post will be clearly marked as from <strong className="text-ink-soft">{session.businessName}</strong> —
          never disguised as a resident. Posting doesn’t buy rank.
        </span>
      </div>

      <Button fullWidth disabled={!title.trim()} onClick={submit}>
        Post to the feed
      </Button>
    </div>
  );
}
