import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, ShieldCheck, TriangleAlert, Clock, Layers } from 'lucide-react';
import { getState } from '../../data/store';
import { timeAgo } from '../../lib/time';
import type { CivicCategory } from '../../types/pin';

const CATEGORY_LABEL: Record<CivicCategory, string> = {
  pothole: 'Potholes', garbage: 'Garbage', water: 'Water logging',
  streetlight: 'Streetlights', footpath: 'Footpaths', other: 'Other',
};

export default function GovPage() {
  const navigate = useNavigate();
  const gov = getState().govData;

  const headlineResolved = Math.round(gov.totalFiled * gov.headlineResolvedRate);
  const maxCat = Math.max(...gov.byCategory.map((c) => c.count));
  const maxArea = Math.max(...gov.byArea.map((a) => a.count));

  return (
    <div className="min-h-[100svh] bg-paper">
      {/* Persistent vision banner */}
      <div className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2 text-sm font-semibold" style={{ backgroundColor: 'var(--color-amber)', color: 'var(--color-ink)' }}>
        <Eye size={16} aria-hidden="true" />
        Vision preview — mock data, not a live BMC integration. Wired to nothing real.
      </div>

      <header className="px-4 pt-5 pb-3 flex items-start gap-2 max-w-2xl mx-auto">
        <button onClick={() => navigate('/app/pulse')} aria-label="Back to app" className="w-11 h-11 -ml-2 flex items-center justify-center rounded-pill text-ink hover:bg-line flex-shrink-0">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">H-West · Bandra West</p>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            Civic health, honestly
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            A verification and closure layer on top of BMC’s existing intake — not another intake channel.
          </p>
        </div>
      </header>

      <div className="px-4 pb-12 max-w-2xl mx-auto flex flex-col gap-6">
        {/* The honest-number contrast — the heart of the pitch */}
        <section className="rounded-xl border border-line bg-paper-raised p-4 flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">The number that matters</h2>
          <div className="grid grid-cols-2 gap-3">
            <ContrastCard
              tone="muted"
              icon={<TriangleAlert size={18} />}
              pct={gov.headlineResolvedRate}
              count={headlineResolved}
              label="Marked “resolved”"
              caption="The headline figure. Absorbs invalid and other-agency cases."
            />
            <ContrastCard
              tone="trust"
              icon={<ShieldCheck size={18} />}
              pct={gov.neighbourConfirmedRate}
              count={gov.genuinelyFixed}
              label="Neighbour-confirmed fixed"
              caption="The honest number. A resident saw the after-photo."
            />
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            A live BMC field test showed a headline {Math.round(gov.headlineResolvedRate * 100)}% “resolved” rate, while
            genuinely actionable complaints were fixed about {Math.round(gov.neighbourConfirmedRate * 100)}% of the time.
            Push The Pin only ever counts a report closed when a neighbour confirms the fix — so the number is real.
          </p>
        </section>

        {/* Headline stats */}
        <section className="grid grid-cols-3 gap-3">
          <StatTile icon={<Layers size={18} />} value={gov.totalFiled} label="Reports filed" />
          <StatTile icon={<ShieldCheck size={18} />} value={gov.genuinelyFixed} label="Verified fixed" />
          <StatTile icon={<Clock size={18} />} value={gov.timeToResolutionDays} label="Median days to fix" />
        </section>

        {/* By category */}
        <section className="rounded-xl border border-line bg-paper-raised p-4 flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Reports by category</h2>
          <div className="flex flex-col gap-3">
            {gov.byCategory.map((c) => (
              <BarRow
                key={c.category}
                label={CATEGORY_LABEL[c.category]}
                count={c.count}
                max={maxCat}
                aside={`avg ${c.avgDaysOpen}d open`}
              />
            ))}
          </div>
        </section>

        {/* By area */}
        <section className="rounded-xl border border-line bg-paper-raised p-4 flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Reports by area</h2>
          <div className="flex flex-col gap-3">
            {gov.byArea.map((a) => (
              <BarRow key={a.area} label={a.area} count={a.count} max={maxArea} />
            ))}
          </div>
        </section>

        <p className="text-xs text-ink-faint text-center">
          Preview surface · mock data, last refreshed {timeAgo(gov.lastUpdated)} · not connected to any government system.
        </p>
      </div>
    </div>
  );
}

function ContrastCard({
  tone, icon, pct, count, label, caption,
}: {
  tone: 'muted' | 'trust';
  icon: React.ReactNode;
  pct: number;
  count: number;
  label: string;
  caption: string;
}) {
  const color = tone === 'trust' ? 'var(--color-cobalt)' : 'var(--color-ink-faint)';
  return (
    <div className="rounded-lg p-3 flex flex-col gap-1" style={{ backgroundColor: `color-mix(in srgb, ${color} 10%, var(--color-paper))` }}>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
        {icon}
        {label}
      </span>
      <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color }}>
        {Math.round(pct * 100)}%
      </span>
      <span className="text-xs text-ink-faint tabular-nums">{count} of reports</span>
      <span className="text-xs text-ink-soft leading-snug mt-1">{caption}</span>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper-raised p-3 flex flex-col gap-1">
      <span className="text-cobalt">{icon}</span>
      <span className="text-2xl font-bold text-ink tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>{value}</span>
      <span className="text-xs text-ink-faint leading-tight">{label}</span>
    </div>
  );
}

function BarRow({ label, count, max, aside }: { label: string; count: number; max: number; aside?: string }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-ink">{label}</span>
        <span className="text-ink-faint tabular-nums">
          {count}{aside ? ` · ${aside}` : ''}
        </span>
      </div>
      <div className="h-2.5 rounded-pill bg-paper overflow-hidden">
        <div className="h-full rounded-pill" style={{ width: `${pct}%`, backgroundColor: 'var(--color-cobalt)' }} />
      </div>
    </div>
  );
}
