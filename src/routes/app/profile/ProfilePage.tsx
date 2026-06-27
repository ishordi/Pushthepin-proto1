import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, MapPin, Bell, Type, Trash2, ShieldCheck } from 'lucide-react';
import PinCard from '../../../components/PinCard';
import Button from '../../../components/Button';
import { getState, setPrefs, setLocationGranted, resetState, getPinById } from '../../../data/store';
import { applyTextSize } from '../../../lib/prefs';
import { log } from '../../../lib/log';
import { haptic } from '../../../lib/haptics';
import { isInCluster } from '../../../data/cluster';
import type { Pin } from '../../../types/pin';

/* Profile — an anonymous self view of your own pins and their status, plus the
   resident settings: location state and its fallback, mocked notifications, the
   text-size control that scales the whole interface, and the prototype reset. */

export default function ProfilePage() {
  const navigate = useNavigate();
  const state = getState();

  const ownPins: Pin[] = state.ownPinIds
    .map((id) => getPinById(id))
    .filter((p): p is Pin => !!p)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [textSize, setTextSizeState] = useState(state.prefs.textSize);
  const [notifyCivic, setNotifyCivic] = useState(state.prefs.notifyCivicUpdates);
  const [notifyNearby, setNotifyNearby] = useState(state.prefs.notifyNearby);
  const [locationGranted, setLocationGrantedState] = useState(state.locationGranted);
  const [confirmReset, setConfirmReset] = useState(false);

  function changeTextSize(size: 'normal' | 'large') {
    setTextSizeState(size);
    setPrefs({ textSize: size });
    applyTextSize(size); // scales the whole interface live
    haptic('tick');
  }

  function toggleCivic() {
    const v = !notifyCivic;
    setNotifyCivic(v);
    setPrefs({ notifyCivicUpdates: v });
  }
  function toggleNearby() {
    const v = !notifyNearby;
    setNotifyNearby(v);
    setPrefs({ notifyNearby: v });
  }

  function enableLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationGranted(false);
      setLocationGrantedState(false);
      log('location_denied', { reason: 'unsupported', where: 'profile' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationGranted(true);
        setLocationGrantedState(true);
        log('location_granted', { inCluster: isInCluster(pos.coords.latitude, pos.coords.longitude), where: 'profile' });
        haptic('confirm');
      },
      () => {
        setLocationGranted(false);
        setLocationGrantedState(false);
        log('location_denied', { reason: 'permission', where: 'profile' });
      },
    );
  }

  function doReset() {
    resetState();
    applyTextSize('normal');
    log('data_reset');
    // Full reload so every surface re-reads clean seeded state; root gate sends
    // a fresh user back through onboarding.
    window.location.assign('/');
  }

  return (
    <main className="min-h-[100svh] bg-paper text-ink overflow-y-auto pb-28">
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Identity — anonymous */}
        <header className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-pill bg-cobalt/10 text-cobalt flex-shrink-0">
            <UserRound size={26} aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-[26px] leading-8 font-bold">You</h1>
            <p className="text-caption text-ink-soft flex items-center gap-1 mt-0.5">
              <ShieldCheck size={14} aria-hidden="true" className="text-green" />
              You appear as a neighbour. Your name is never shown.
            </p>
          </div>
        </header>

        {/* Your pins */}
        <Section title="Your pins" sub={ownPins.length ? `${ownPins.length} posted` : undefined}>
          {ownPins.length === 0 ? (
            <p className="text-body text-ink-soft py-2">
              You haven't posted yet. Anything you place will show here with its status.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {ownPins.map((pin) => (
                <PinCard key={pin.id} pin={pin} onClick={() => navigate(`/app/pin/${pin.id}`)} />
              ))}
            </ul>
          )}
        </Section>

        {/* Location */}
        <Section title="Location" icon={<MapPin size={18} aria-hidden="true" />}>
          {locationGranted ? (
            <Row
              label="Precise location is on"
              sub="Your pins are placed exactly where you are."
            />
          ) : (
            <div className="flex flex-col gap-3">
              <Row
                label="Browsing from the centre of Bandra West"
                sub="The app works fully. Precise location just places your own pins more accurately."
              />
              <Button variant="secondary" onClick={enableLocation}>
                Turn on precise location
              </Button>
            </div>
          )}
        </Section>

        {/* Notifications — mocked */}
        <Section title="Notifications" icon={<Bell size={18} aria-hidden="true" />} sub="Mocked in this prototype.">
          <div className="flex flex-col">
            <Toggle
              label="Updates on my civic reports"
              sub="When something you reported moves forward."
              checked={notifyCivic}
              onChange={toggleCivic}
            />
            <div className="h-px bg-line my-1" />
            <Toggle
              label="New posts nearby"
              sub="Events, things to give or sell on your street."
              checked={notifyNearby}
              onChange={toggleNearby}
            />
          </div>
        </Section>

        {/* Accessibility — text size scales the whole interface */}
        <Section title="Text size" icon={<Type size={18} aria-hidden="true" />} sub="Scales the whole app.">
          <div className="flex gap-2" role="group" aria-label="Text size">
            <SizeOption label="Normal" active={textSize === 'normal'} onClick={() => changeTextSize('normal')} />
            <SizeOption label="Large" active={textSize === 'large'} onClick={() => changeTextSize('large')} big />
          </div>
        </Section>

        {/* Data reset */}
        <Section title="Prototype" icon={<Trash2 size={18} aria-hidden="true" />}>
          {!confirmReset ? (
            <Button variant="secondary" onClick={() => setConfirmReset(true)}>
              Reset prototype data
            </Button>
          ) : (
            <div className="rounded-lg border border-line bg-paper-raised p-4">
              <p className="text-body text-ink">
                This clears everything back to the seeded Bandra West data and starts you
                fresh. Sure?
              </p>
              <div className="flex gap-2 mt-4">
                <Button onClick={doReset}>Yes, reset</Button>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>Keep my data</Button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}

/* ── Small building blocks ── */

function Section({
  title,
  sub,
  icon,
  children,
}: {
  title: string;
  sub?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-ink-soft">{icon}</span>}
        <h2 className="title font-semibold text-ink text-[20px] leading-6">{title}</h2>
        {sub && <span className="text-caption text-ink-faint ml-auto">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, sub }: { label: string; sub?: string }) {
  return (
    <div>
      <p className="text-body text-ink">{label}</p>
      {sub && <p className="text-caption text-ink-soft mt-0.5">{sub}</p>}
    </div>
  );
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center gap-3 py-3 text-left min-h-[44px] w-full"
    >
      <span className="flex-1">
        <span className="block text-body text-ink">{label}</span>
        {sub && <span className="block text-caption text-ink-soft mt-0.5">{sub}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`relative w-12 h-7 rounded-pill flex-shrink-0 transition-colors ${
          checked ? 'bg-cobalt' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-pill bg-paper-raised shadow-elevation-1 transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </button>
  );
}

function SizeOption({
  label,
  active,
  onClick,
  big,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex-1 min-h-[48px] rounded-md border px-4 font-semibold transition-colors ${
        big ? 'text-[20px]' : 'text-base'
      } ${
        active
          ? 'bg-cobalt text-paper-raised border-cobalt'
          : 'bg-paper-raised text-ink border-line hover:border-ink-faint'
      }`}
    >
      {label}
    </button>
  );
}
