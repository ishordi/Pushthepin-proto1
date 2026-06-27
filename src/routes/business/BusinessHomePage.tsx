import { useOutletContext, useNavigate } from 'react-router-dom';
import { PlusSquare, BarChart3, Info, ExternalLink } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { getBusinessPins } from '../../data/store';
import { timeAgo, isExpired } from '../../lib/time';
import type { BusinessSession } from './BusinessPage';

export default function BusinessHomePage() {
  const session = useOutletContext<BusinessSession>();
  const navigate = useNavigate();
  const posts = getBusinessPins(session.businessName);
  const live = posts.filter((p) => !isExpired(p.expiresAt));

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome back
        </h1>
        <p className="text-sm text-ink-soft">{session.businessName}</p>
      </div>

      {/* Honest constraint */}
      <div className="flex items-start gap-2 rounded-lg bg-cobalt/5 border border-cobalt/20 p-3">
        <Info size={18} className="text-cobalt flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-ink-soft leading-relaxed">
          Posting doesn’t buy rank. Your post shows because it’s nearby and recent — never because
          you paid. The feed stays hyperlocal and honest.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card onClick={() => navigate('/business/post')} className="flex flex-col gap-2">
          <PlusSquare size={22} className="text-cobalt" aria-hidden="true" />
          <span className="text-base font-semibold text-ink">New post</span>
          <span className="text-sm text-ink-soft">Offer, event, or notice</span>
        </Card>
        <Card onClick={() => navigate('/business/stats')} className="flex flex-col gap-2">
          <BarChart3 size={22} className="text-cobalt" aria-hidden="true" />
          <span className="text-base font-semibold text-ink">Stats</span>
          <span className="text-sm text-ink-soft">How your posts are doing</span>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Your live posts ({live.length})</span>
        {posts.length === 0 ? (
          <p className="text-sm text-ink-faint">No posts yet. Create your first one.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {posts.map((p) => (
              <Card key={p.id} as="li" className="flex items-center justify-between gap-3 list-none">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{p.title}</span>
                  <span className="block text-xs text-ink-faint tabular-nums">
                    {p.postType} · {timeAgo(p.createdAt)} · {isExpired(p.expiresAt) ? 'expired' : 'live'}
                  </span>
                </span>
                <button
                  onClick={() => window.open('/app/pulse', '_blank')}
                  aria-label="View in the feed"
                  className="text-cobalt min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                </button>
              </Card>
            ))}
          </ul>
        )}
      </div>

      <Button variant="secondary" fullWidth onClick={() => navigate('/business/post')}>
        Create a post
      </Button>
    </div>
  );
}
