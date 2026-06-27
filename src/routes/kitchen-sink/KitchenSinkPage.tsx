import { useState } from 'react';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import type { PinType } from '../../components/Chip';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import BottomSheet from '../../components/BottomSheet';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import type { ToastVariant } from '../../components/Toast';
import { getState, resetState, logEvent } from '../../data/store';

const PIN_TYPES: Array<PinType | 'all'> = ['all', 'civic', 'event', 'help', 'sell', 'buy', 'service'];

export default function KitchenSinkPage() {
  const [activeChip, setActiveChip] = useState<PinType | 'all'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success');
  const [inputVal, setInputVal] = useState('');
  const [textareaVal, setTextareaVal] = useState('');

  function showToast(v: ToastVariant) {
    setToastVariant(v);
    setToastVisible(true);
  }

  return (
    <div
      className="min-h-screen bg-paper p-6 pb-24"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <h1
        className="text-3xl font-bold text-ink mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Kitchen sink
      </h1>
      <p className="text-sm text-ink-faint mb-8">Phase 1 — design tokens and primitives</p>

      {/* Colour swatches */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-3">Colour tokens</h2>
        <div className="flex flex-wrap gap-3">
          {[
            ['paper', '#F4EEE3'],
            ['paper-raised', '#FBF7EF'],
            ['ink', '#211D17'],
            ['ink-soft', '#5A554C'],
            ['ink-faint', '#8E887C'],
            ['cobalt', '#2B43E6'],
            ['cobalt-deep', '#1E31B0'],
            ['coral', '#F4633A'],
            ['green', '#2E9E6B'],
            ['amber', '#E8A93C'],
            ['line', '#E3DCCE'],
            ['pin-buy', '#2B9EA6'],
            ['pin-service', '#7A5AD8'],
          ].map(([name, hex]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 rounded-md border border-line shadow-elevation-1"
                style={{ backgroundColor: hex }}
                title={hex}
              />
              <span className="text-xs text-ink-faint">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-3">Button</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" shape="pill">Primary pill</Button>
          <Button variant="secondary" shape="pill">Secondary pill</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Filter chips */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-3">Filter chips</h2>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Filter by type"
        >
          {PIN_TYPES.map((type) => (
            <Chip
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              pinType={type}
              active={activeChip === type}
              onClick={() => setActiveChip(type)}
            />
          ))}
        </div>
      </section>

      {/* Text inputs */}
      <section className="mb-10 max-w-sm">
        <h2 className="text-lg font-semibold text-ink mb-3">Text input</h2>
        <div className="flex flex-col gap-4">
          <TextInput
            label="Street or landmark"
            placeholder="e.g. near Waroda Road bus stop"
            hint="Used only to help locate your report"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <TextInput
            label="With error"
            placeholder="Try typing something"
            error="Something went wrong here"
          />
          <Textarea
            label="Description"
            placeholder="What did you see?"
            hint="Short and factual is fine"
            value={textareaVal}
            onChange={(e) => setTextareaVal(e.target.value)}
          />
        </div>
      </section>

      {/* Cards */}
      <section className="mb-10 max-w-sm">
        <h2 className="text-lg font-semibold text-ink mb-3">Card</h2>
        <div className="flex flex-col gap-3">
          <Card>
            <p className="text-sm font-semibold text-ink">Static card</p>
            <p className="text-sm text-ink-soft mt-1">Carries content, not interactive.</p>
          </Card>
          <Card onClick={() => alert('Card tapped')}>
            <p className="text-sm font-semibold text-ink">Interactive card</p>
            <p className="text-sm text-ink-soft mt-1">Tap me. Has keyboard and focus support.</p>
          </Card>
        </div>
      </section>

      {/* Empty state */}
      <section className="mb-10 max-w-sm border border-line rounded-lg">
        <h2 className="text-lg font-semibold text-ink p-4 pb-0">Empty state</h2>
        <EmptyState
          message="Nothing here yet."
          sub="Be the first to post something on your street."
        />
      </section>

      {/* Bottom sheet */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-3">Bottom sheet</h2>
        <Button onClick={() => setSheetOpen(true)}>Open bottom sheet</Button>
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Report a thing"
        >
          <p className="text-sm text-ink-soft mb-4">
            This is a bottom sheet. Dismiss with the backdrop, the Escape key, or a close action.
          </p>
          <Button variant="secondary" fullWidth onClick={() => setSheetOpen(false)}>
            Close
          </Button>
        </BottomSheet>
      </section>

      {/* Toasts */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-3">Toast</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => showToast('success')}>
            Success toast
          </Button>
          <Button variant="secondary" onClick={() => showToast('info')}>
            Info toast
          </Button>
          <Button variant="secondary" onClick={() => showToast('error')}>
            Error toast
          </Button>
        </div>
      </section>

      {/* Typography scale */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-3">Typography</h2>
        <div className="flex flex-col gap-2">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, lineHeight: '36px' }}>
            Display L — Bricolage Grotesque 700
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, lineHeight: '30px' }}>
            Display M — Bricolage Grotesque 600
          </p>
          <p className="text-xl font-semibold text-ink">Title — Hanken Grotesque 600</p>
          <p className="text-lg text-ink">Body L — Hanken Grotesque 400</p>
          <p className="text-base text-ink">Body — Hanken Grotesque 400 (minimum)</p>
          <p className="text-sm text-ink-soft">Caption — Hanken Grotesque 400</p>
          <p className="text-xs text-ink-faint">Micro — Hanken Grotesque 400</p>
        </div>
      </section>

      {/* Phase 2 — data layer verification */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-ink mb-3">Phase 2 — data layer</h2>
        <DataVerifier />
      </section>

      <Toast
        message={
          toastVariant === 'success'
            ? 'Report noted. Thanks for keeping an eye on the street.'
            : toastVariant === 'info'
            ? 'Your post is now live on the neighbourhood map.'
            : 'Something went wrong. Try again.'
        }
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </div>
  );
}

function DataVerifier() {
  const [state, setState] = useState(() => getState());

  function handleReset() {
    const fresh = resetState();
    logEvent('data_reset');
    setState(fresh);
  }

  const civicPins = state.pins.filter((p) => p.type === 'civic');
  const waradaGroup = state.collages.find((c) => c.groupId === 'waroda-road-group');
  const hasAnonymousLabels = state.pins.every((p) => p.authorAnonymousLabel && !p.authorAnonymousLabel.match(/\b(Hardi|Priya|Aamir|Royston)\b/i));
  const appOpenEvents = state.eventLog.filter((e) => e.name === 'app_open');

  return (
    <div className="bg-paper-raised rounded-lg border border-line p-4 text-sm font-mono flex flex-col gap-2">
      <p><strong>Total pins:</strong> {state.pins.length}</p>
      <p><strong>Civic pins:</strong> {civicPins.length}</p>
      <p><strong>Collages:</strong> {state.collages.length} (Waroda Road group: {waradaGroup ? `${waradaGroup.pinIds.length} pins ✓` : '✗ missing'})</p>
      <p><strong>Buildings:</strong> {state.buildings.length}</p>
      <p><strong>All labels anonymous:</strong> {hasAnonymousLabels ? '✓' : '✗ name found'}</p>
      <p><strong>Event log entries:</strong> {state.eventLog.length} (app_open events: {appOpenEvents.length})</p>
      <div className="flex gap-2 mt-2">
        <Button variant="secondary" onClick={handleReset}>Reset to seed</Button>
        <Button variant="ghost" onClick={() => setState(getState())}>Refresh</Button>
      </div>
    </div>
  );
}
