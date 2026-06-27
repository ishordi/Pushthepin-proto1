import { useReducer, useState } from 'react';
import { Building2, Plus, Lock } from 'lucide-react';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import TextInput from '../../../components/TextInput';
import Textarea from '../../../components/Textarea';
import EmptyState from '../../../components/EmptyState';
import Vipin from '../../../components/Vipin';
import {
  getState,
  getBuilding,
  getBuildingPosts,
  addBuilding,
  joinBuilding,
  addBuildingPost,
} from '../../../data/store';
import { log } from '../../../lib/log';
import { haptic } from '../../../lib/haptics';
import { H_WEST_CLUSTER } from '../../../data/cluster';
import { timeAgo } from '../../../lib/time';
import type { Building } from '../../../types/pin';

export default function BuildingPage() {
  const [, force] = useReducer((x) => x + 1, 0);
  const state = getState();
  const joined = state.joinedBuildingId ? getBuilding(state.joinedBuildingId) : undefined;

  return (
    <div className="min-h-[100svh] bg-paper">
      <header className="sticky top-0 z-10 px-4 pt-4 pb-3 bg-paper/95 border-b border-line">
        <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Building
        </h1>
        <p className="text-sm text-ink-faint inline-flex items-center gap-1.5">
          <Lock size={13} aria-hidden="true" />
          A private space for your building, separate from the ward feed
        </p>
      </header>

      <div className="px-4 py-4 pb-28 max-w-lg mx-auto">
        {joined ? <BuildingFeed building={joined} onChange={force} /> : <JoinOrRegister onChange={force} />}
      </div>
    </div>
  );
}

function JoinOrRegister({ onChange }: { onChange: () => void }) {
  const buildings = getState().buildings;
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  function join(id: string) {
    joinBuilding(id);
    log('building_joined', { buildingId: id });
    haptic('confirm');
    onChange();
  }

  function register() {
    if (!name.trim()) return;
    const building: Building = {
      id: `building-${Date.now()}`,
      name: name.trim(),
      address: address.trim() || 'Bandra West',
      clusterId: H_WEST_CLUSTER.id,
      geocode: { ...H_WEST_CLUSTER.center },
      registeredAt: new Date().toISOString(),
    };
    addBuilding(building);
    log('building_registered', { buildingId: building.id });
    joinBuilding(building.id);
    log('building_joined', { buildingId: building.id });
    haptic('success');
    onChange();
  }

  if (registering) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Register your building</h2>
        <TextInput label="Building name" placeholder="e.g. Rose Villa" value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput label="Where (optional)" placeholder="e.g. Off Hill Road" value={address} onChange={(e) => setAddress(e.target.value)} />
        <p className="text-xs text-ink-faint">
          Only your building name is shown. No resident names, here or anywhere.
        </p>
        <div className="flex flex-col gap-2">
          <Button fullWidth disabled={!name.trim()} onClick={register}>
            Create the space
          </Button>
          <Button variant="ghost" onClick={() => setRegistering(false)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <Vipin mood="hello" size={56} />
        <p className="text-base text-ink-soft leading-relaxed">
          Buildings can keep their own quiet corner — lift notices, water timings, society plans.
          Join yours, or set one up.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Buildings near you</span>
        {buildings.map((b) => (
          <Card key={b.id} className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-md bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-cobalt" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-base font-semibold text-ink">{b.name}</span>
              <span className="block text-sm text-ink-faint">{b.address}</span>
            </span>
            <Button onClick={() => join(b.id)}>Join</Button>
          </Card>
        ))}
      </div>

      <Button variant="secondary" fullWidth onClick={() => setRegistering(true)}>
        <Plus size={18} aria-hidden="true" /> Register a new building
      </Button>
    </div>
  );
}

function BuildingFeed({ building, onChange }: { building: Building; onChange: () => void }) {
  const posts = getBuildingPosts(building.id);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [flat, setFlat] = useState('');

  function post() {
    if (!title.trim()) return;
    addBuildingPost({
      id: `bp-${Date.now()}`,
      buildingId: building.id,
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
      authorLabel: flat.trim() || 'A resident',
    });
    haptic('confirm');
    setTitle('');
    setBody('');
    setFlat('');
    setComposing(false);
    onChange();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-lg bg-cobalt/10 flex items-center justify-center flex-shrink-0">
          <Building2 size={24} className="text-cobalt" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink">{building.name}</h2>
          <p className="text-sm text-ink-faint">{building.address}</p>
        </div>
      </div>

      {composing ? (
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-paper-raised p-4">
          <TextInput label="What’s the note?" placeholder="e.g. Lift servicing on Monday" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Details" placeholder="Anything residents should know." value={body} onChange={(e) => setBody(e.target.value)} />
          <TextInput label="Flat or floor (optional)" placeholder="e.g. Flat 2B" value={flat} onChange={(e) => setFlat(e.target.value)} />
          <div className="flex flex-col gap-2">
            <Button fullWidth disabled={!title.trim()} onClick={post}>Post to the building</Button>
            <Button variant="ghost" onClick={() => setComposing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button fullWidth onClick={() => setComposing(true)}>
          <Plus size={18} aria-hidden="true" /> Post a note
        </Button>
      )}

      {posts.length === 0 ? (
        <EmptyState message="No notes yet." sub="Be the first to share something for the building." />
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((p) => (
            <Card key={p.id} as="li" className="flex flex-col gap-1 list-none">
              <span className="text-base font-semibold text-ink">{p.title}</span>
              {p.body && <span className="text-sm text-ink-soft">{p.body}</span>}
              <span className="text-xs text-ink-faint tabular-nums">{p.authorLabel} · {timeAgo(p.createdAt)}</span>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
