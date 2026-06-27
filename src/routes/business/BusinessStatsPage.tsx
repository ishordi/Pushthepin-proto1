import { useOutletContext } from 'react-router-dom';
import { Eye, MousePointerClick, Info } from 'lucide-react';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { getBusinessPins } from '../../data/store';
import { timeAgo, isExpired } from '../../lib/time';
import type { BusinessSession } from './BusinessPage';

export default function BusinessStatsPage() {
  const session = useOutletContext<BusinessSession>();
  const posts = getBusinessPins(session.businessName);

  const totalViews = posts.reduce((s, p) => s + (p.stats?.views ?? 0), 0);
  const totalTaps = posts.reduce((s, p) => s + (p.stats?.taps ?? 0), 0);

  if (posts.length === 0) {
    return <EmptyState message="No stats yet." sub="Post something and reach numbers will show up here." />;
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
        Stats
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={<Eye size={20} />} label="Total views" value={totalViews} />
        <StatTile icon={<MousePointerClick size={20} />} label="Total taps" value={totalTaps} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">By post</span>
        <ul className="flex flex-col gap-2">
          {posts.map((p) => (
            <Card key={p.id} as="li" className="flex flex-col gap-2 list-none">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink truncate">{p.title}</span>
                <span className="text-xs text-ink-faint tabular-nums flex-shrink-0">
                  {isExpired(p.expiresAt) ? 'expired' : 'live'} · {timeAgo(p.createdAt)}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-ink-soft tabular-nums">
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={14} aria-hidden="true" /> {p.stats?.views ?? 0} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MousePointerClick size={14} aria-hidden="true" /> {p.stats?.taps ?? 0} taps
                </span>
              </div>
            </Card>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-2 rounded-md bg-paper-raised border border-line p-3">
        <Info size={16} className="text-ink-faint flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span className="text-xs text-ink-faint leading-relaxed">
          These numbers are mocked for the prototype. Reach comes from being nearby and recent —
          there is no paid ranking.
        </span>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-paper-raised border border-line p-4 flex flex-col gap-1">
      <span className="text-cobalt">{icon}</span>
      <span className="text-2xl font-bold text-ink tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
        {value}
      </span>
      <span className="text-xs text-ink-faint">{label}</span>
    </div>
  );
}
