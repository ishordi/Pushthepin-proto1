import { useReducer, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getState,
  resetState,
  setPrefs,
} from '../../data/store';
import {
  getOverrides,
  subscribeOverrides,
  setOverrides,
  resetOverrides,
} from '../../lib/overrides';
import { applyTextSize } from '../../lib/prefs';
import {
  SCENARIOS,
  PERSONAS,
  forceCivic,
  setDensity,
  toggleType,
  setNonCivicExpiry,
} from '../../lib/scenario';
import EventLogView from '../../components/EventLogView';
import { getConsoleReturn } from '../../components/ConsoleTrigger';
import type { CivicPin, CivicStatus, PinType } from '../../types/pin';

/* The hidden Test Console (PRS section 11). Deliberately off-brand and
   utilitarian per DESIGN_SYSTEM section 11 — system/monospace, stark, flat —
   so it is never mistaken for product UI. It drives the same store the app
   uses, adding no product behaviour, only a lens onto it. Never ships. */

const NAV_TARGETS: [string, string][] = [
  ['Pulse', '/app/pulse'],
  ['Gather', '/app/gather'],
  ['Create', '/app/create'],
  ['Building', '/app/building'],
  ['Profile', '/app/profile'],
  ['Onboarding', '/onboarding'],
  ['WhatsApp', '/whatsapp'],
  ['Business', '/business'],
  ['Gov', '/gov'],
  ['Admin', '/admin'],
];

const STATUSES: CivicStatus[] = ['submitted', 'in_review', 'routed', 'waiting', 'resolved', 'closed'];
const TYPES: PinType[] = ['civic', 'event', 'help', 'sell', 'buy', 'service'];

export default function ConsolePage() {
  const navigate = useNavigate();
  const ov = useSyncExternalStore(subscribeOverrides, getOverrides);
  const [, force] = useReducer((n) => n + 1, 0);

  const civicPins = getState().pins.filter((p): p is CivicPin => p.type === 'civic');
  const presentTypes = new Set(getState().pins.map((p) => p.type));

  // Civic lifecycle controls
  const [pinId, setPinId] = useState(civicPins[0]?.id ?? '');
  const [status, setStatus] = useState<CivicStatus>('waiting');
  const [elapsed, setElapsed] = useState(7);
  const [confirmations, setConfirmations] = useState(0);
  const [withPhoto, setWithPhoto] = useState(false);

  function applyCivic() {
    if (!pinId) return;
    forceCivic(pinId, {
      status,
      elapsedDays: elapsed,
      confirmations,
      resolutionPhoto: withPhoto ? 'mock:after-photo' : null,
    });
    force();
  }

  function exportLog() {
    const data = JSON.stringify(getState().eventLog, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ptp-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function hardReset() {
    resetState();
    resetOverrides();
    applyTextSize('normal');
    force();
  }

  const offsetDays = Math.round(ov.clockOffsetMs / 86400000);

  return (
    <div style={S.root}>
      <div style={S.bar}>
        <strong>PTP Test Console</strong>
        <span style={S.muted}>tester instrument · not part of the product</span>
        <button style={S.closeBtn} onClick={() => navigate(getConsoleReturn())}>
          Close ✕
        </button>
      </div>

      <div style={S.grid}>
        {/* Navigate */}
        <Section title="Navigate">
          <div style={S.wrap}>
            {NAV_TARGETS.map(([label, path]) => (
              <button key={path} style={S.btn} onClick={() => navigate(path)}>
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Scenarios */}
        <Section title="Scenarios">
          <div style={S.wrap}>
            {SCENARIOS.map((s) => (
              <button key={s.id} style={S.btn} title={s.note} onClick={() => navigate(s.run())}>
                {s.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Civic lifecycle */}
        <Section title="Civic lifecycle">
          <label style={S.row}>
            Pin
            <select style={S.input} value={pinId} onChange={(e) => setPinId(e.target.value)}>
              {civicPins.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.title.slice(0, 28)}
                </option>
              ))}
            </select>
          </label>
          <label style={S.row}>
            Status
            <select style={S.input} value={status} onChange={(e) => setStatus(e.target.value as CivicStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label style={S.row}>
            Elapsed days
            <input style={S.input} type="number" min={0} value={elapsed} onChange={(e) => setElapsed(+e.target.value)} />
          </label>
          <label style={S.row}>
            Confirmations
            <input style={S.input} type="number" min={0} value={confirmations} onChange={(e) => setConfirmations(+e.target.value)} />
          </label>
          <label style={S.check}>
            <input type="checkbox" checked={withPhoto} onChange={(e) => setWithPhoto(e.target.checked)} />
            Attach resolution photo
          </label>
          <div style={S.wrap}>
            <button style={S.btnPrimary} onClick={applyCivic}>Apply</button>
            <button style={S.btn} onClick={() => pinId && navigate(`/app/pin/${pinId}`)}>View pin</button>
          </div>
        </Section>

        {/* Data lenses */}
        <Section title="Data lenses">
          <div style={S.label}>Feed density</div>
          <div style={S.wrap}>
            {(['empty', 'sparse', 'dense', 'collage'] as const).map((d) => (
              <button key={d} style={S.btn} onClick={() => { setDensity(d); force(); }}>{d}</button>
            ))}
          </div>
          <div style={S.label}>Pin types present</div>
          <div style={S.wrap}>
            {TYPES.map((t) => (
              <button
                key={t}
                style={presentTypes.has(t) ? S.btnOn : S.btn}
                onClick={() => { toggleType(t); force(); }}
              >
                {t} {presentTypes.has(t) ? '✓' : '✗'}
              </button>
            ))}
          </div>
          <div style={S.label}>Non-civic expiry</div>
          <div style={S.wrap}>
            <button style={S.btn} onClick={() => { setNonCivicExpiry(true); force(); }}>Expire all</button>
            <button style={S.btn} onClick={() => { setNonCivicExpiry(false); force(); }}>Un-expire all</button>
          </div>
        </Section>

        {/* Persona lens */}
        <Section title="Persona lens">
          <div style={S.wrap}>
            {PERSONAS.map((p) => (
              <button key={p.id} style={S.btn} title={p.note} onClick={() => { p.apply(); force(); }}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={S.muted}>Viewing aid only — does not change the underlying data.</div>
        </Section>

        {/* Accessibility overrides */}
        <Section title="Accessibility overrides">
          <label style={S.row}>
            Reduced motion
            <select
              style={S.input}
              value={ov.reducedMotion}
              onChange={(e) => setOverrides({ reducedMotion: e.target.value as 'system' | 'on' | 'off' })}
            >
              <option value="system">system</option>
              <option value="on">force on</option>
              <option value="off">force off</option>
            </select>
          </label>
          <label style={S.row}>
            Text size
            <select
              style={S.input}
              value={getState().prefs.textSize}
              onChange={(e) => { const v = e.target.value as 'normal' | 'large'; setPrefs({ textSize: v }); applyTextSize(v); force(); }}
            >
              <option value="normal">normal</option>
              <option value="large">large</option>
            </select>
          </label>
          <label style={S.check}>
            <input type="checkbox" checked={ov.hapticsOff} onChange={(e) => setOverrides({ hapticsOff: e.target.checked })} />
            Force haptics off
          </label>
          <label style={S.check}>
            <input type="checkbox" checked={ov.highContrast} onChange={(e) => setOverrides({ highContrast: e.target.checked })} />
            High contrast
          </label>
        </Section>

        {/* Surface toggles */}
        <Section title="Surface toggles">
          <label style={S.check}>
            <input type="checkbox" checked={ov.grain} onChange={(e) => setOverrides({ grain: e.target.checked })} />
            Grain
          </label>
          <label style={S.check}>
            <input type="checkbox" checked={ov.nav} onChange={(e) => setOverrides({ nav: e.target.checked })} />
            Floating nav
          </label>
          <label style={S.check}>
            <input type="checkbox" checked={ov.businessPosts} onChange={(e) => setOverrides({ businessPosts: e.target.checked })} />
            Business posts in feed
          </label>
          <label style={S.row}>
            Map style
            <select style={S.input} value={ov.mapStyle} onChange={(e) => setOverrides({ mapStyle: e.target.value as 'positron' | 'voyager' })}>
              <option value="positron">positron</option>
              <option value="voyager">voyager</option>
            </select>
          </label>
        </Section>

        {/* Time control */}
        <Section title="Time control">
          <div style={S.label}>Clock offset: {offsetDays >= 0 ? '+' : ''}{offsetDays}d</div>
          <div style={S.wrap}>
            <button style={S.btn} onClick={() => setOverrides({ clockOffsetMs: ov.clockOffsetMs + 86400000 })}>+1d</button>
            <button style={S.btn} onClick={() => setOverrides({ clockOffsetMs: ov.clockOffsetMs + 7 * 86400000 })}>+7d</button>
            <button style={S.btn} onClick={() => setOverrides({ clockOffsetMs: ov.clockOffsetMs + 30 * 86400000 })}>+30d</button>
            <button style={S.btn} onClick={() => setOverrides({ clockOffsetMs: ov.clockOffsetMs - 86400000 })}>-1d</button>
            <button style={S.btn} onClick={() => setOverrides({ clockOffsetMs: 0 })}>reset clock</button>
          </div>
          <div style={S.muted}>Ages pins, expires events, advances the dead-zone wait.</div>
        </Section>

        {/* Instrumentation */}
        <Section title="Instrumentation" wide>
          <div style={S.wrap}>
            <button style={S.btn} onClick={exportLog}>Export session (JSON)</button>
          </div>
          <div style={S.logWrap}>
            <EventLogView />
          </div>
        </Section>

        {/* Reset */}
        <Section title="Reset">
          <button style={S.btnDanger} onClick={hardReset}>Hard reseed → clean state</button>
          <div style={S.muted}>Restores clean seeded data and clears all console overrides.</div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section style={{ ...S.section, ...(wide ? { gridColumn: '1 / -1' } : {}) }}>
      <h2 style={S.h2}>{title}</h2>
      {children}
    </section>
  );
}

/* ── Deliberately off-brand styling (DESIGN_SYSTEM section 11) ── */
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const S: Record<string, React.CSSProperties> = {
  root: { position: 'fixed', inset: 0, zIndex: 9998, background: '#0f1318', color: '#d7dde4', fontFamily: mono, fontSize: 13, overflowY: 'auto' },
  bar: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid #2a313b', position: 'sticky', top: 0, background: '#0f1318', zIndex: 1 },
  muted: { color: '#7d8794', fontSize: 11 },
  closeBtn: { marginLeft: 'auto', background: '#1c232c', color: '#d7dde4', border: '1px solid #3a434f', padding: '6px 12px', cursor: 'pointer', fontFamily: mono, minHeight: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, padding: 14 },
  section: { border: '1px solid #2a313b', background: '#141a21', padding: 12 },
  h2: { margin: '0 0 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#9fb0c3' },
  wrap: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  btn: { background: '#1c232c', color: '#d7dde4', border: '1px solid #3a434f', padding: '6px 10px', cursor: 'pointer', fontFamily: mono, fontSize: 12, minHeight: 30 },
  btnOn: { background: '#1f3a2a', color: '#bff0cf', border: '1px solid #2e7d4f', padding: '6px 10px', cursor: 'pointer', fontFamily: mono, fontSize: 12, minHeight: 30 },
  btnPrimary: { background: '#2b43e6', color: '#fff', border: '1px solid #2b43e6', padding: '6px 12px', cursor: 'pointer', fontFamily: mono, fontSize: 12, minHeight: 30 },
  btnDanger: { background: '#3a1c1c', color: '#f3b6b6', border: '1px solid #7d3a3a', padding: '8px 12px', cursor: 'pointer', fontFamily: mono, fontSize: 12, minHeight: 32 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  check: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' },
  input: { background: '#0f1318', color: '#d7dde4', border: '1px solid #3a434f', padding: '5px 8px', fontFamily: mono, fontSize: 12, minHeight: 30 },
  label: { color: '#7d8794', fontSize: 11, margin: '6px 0 4px' },
  logWrap: { background: '#fbf7ef', color: '#211d17', padding: 8, marginTop: 6, borderRadius: 4 },
};
