import { useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { getState, approveCivicPin, removePin } from '../../data/store';
import { haptic } from '../../lib/haptics';
import EventLogView from '../../components/EventLogView';
import { timeAgo } from '../../lib/time';
import type { CivicPin } from '../../types/pin';

/* Admin moderation — a plain, functional surface (not styled for residents).
   Stands in for neighbour validation: a queue of submitted civic reports to
   approve (→ routed to BMC) or kill. Also surfaces the behaviour event log so a
   run can be read afterwards. */

type Tab = 'queue' | 'log';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('queue');
  const [, force] = useReducer((n) => n + 1, 0);

  const queue = getState().pins.filter(
    (p): p is CivicPin => p.type === 'civic' && p.status === 'submitted',
  );

  function approve(id: string) {
    approveCivicPin(id);
    haptic('tick'); // tracker advances a step
    force();
  }
  function kill(id: string) {
    removePin(id);
    force();
  }

  return (
    <main className="min-h-[100svh] bg-paper text-ink">
      <header className="border-b border-line px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin moderation</h1>
          <p className="text-sm text-ink-soft">Stands in for neighbour validation. Not a resident surface.</p>
        </div>
        <Link to="/app/pulse" className="text-sm text-cobalt underline min-h-[44px] flex items-center">
          ← App
        </Link>
      </header>

      <div className="flex gap-1 px-4 pt-3 border-b border-line">
        <TabButton active={tab === 'queue'} onClick={() => setTab('queue')}>
          Queue ({queue.length})
        </TabButton>
        <TabButton active={tab === 'log'} onClick={() => setTab('log')}>
          Event log
        </TabButton>
      </div>

      <div className="px-4 py-4 max-w-2xl">
        {tab === 'queue' &&
          (queue.length === 0 ? (
            <p className="text-ink-soft py-8">Nothing waiting. New civic reports land here for review.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {queue.map((pin) => (
                <li key={pin.id} className="border border-line rounded-md bg-paper-raised p-3">
                  <div className="flex items-center gap-2 text-xs text-ink-faint uppercase tracking-wide mb-1">
                    <span>{pin.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{pin.authorAnonymousLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{timeAgo(pin.createdAt)}</span>
                  </div>
                  <p className="font-semibold">{pin.title}</p>
                  <p className="text-sm text-ink-soft mt-0.5">{pin.body}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approve(pin.id)}
                      className="min-h-[40px] px-4 rounded-md bg-cobalt text-paper-raised font-semibold text-sm"
                    >
                      Approve → route
                    </button>
                    <button
                      onClick={() => kill(pin.id)}
                      className="min-h-[40px] px-4 rounded-md border border-line text-ink font-semibold text-sm hover:bg-line"
                    >
                      Kill
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'log' && <EventLogView />}
      </div>
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        'min-h-[44px] px-4 text-sm font-semibold border-b-2 -mb-px',
        active ? 'border-cobalt text-cobalt' : 'border-transparent text-ink-soft hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
