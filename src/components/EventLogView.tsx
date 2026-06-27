import { useEffect, useReducer } from 'react';
import { getState, onLogChange, clearLog } from '../data/store';

/* A plain, inspectable view of the behaviour event log so a friends-and-family
   run can be read after the fact (PRS section 9). Utility styling — neutral and
   compact — so it reads the same in the admin view and the Test Console. */

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function sessionLength(events: { at: string }[]): string {
  if (events.length < 2) return '—';
  const first = new Date(events[0].at).getTime();
  const last = new Date(events[events.length - 1].at).getTime();
  const secs = Math.round((last - first) / 1000);
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

interface Props {
  /** allow clearing the log (admin/console) */
  onClearable?: boolean;
}

export default function EventLogView({ onClearable = true }: Props) {
  const [, force] = useReducer((n) => n + 1, 0);

  useEffect(() => onLogChange(force), []);

  const events = getState().eventLog;
  const ordered = [...events].reverse(); // newest first

  return (
    <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>
      <div className="flex items-center justify-between gap-3 mb-2 text-ink-soft">
        <span>
          {events.length} event{events.length === 1 ? '' : 's'} · session {sessionLength(events)}
        </span>
        {onClearable && (
          <button
            onClick={() => { clearLog(); force(); }}
            className="px-2 py-1 border border-line rounded-sm hover:bg-line min-h-[32px]"
          >
            Clear log
          </button>
        )}
      </div>

      {ordered.length === 0 ? (
        <p className="text-ink-faint">No events yet.</p>
      ) : (
        <ol className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto border border-line rounded-sm p-2 bg-paper-raised">
          {ordered.map((e) => (
            <li key={e.id} className="flex gap-2 items-baseline py-0.5 border-b border-line/60 last:border-0">
              <span className="text-ink-faint tabular-nums shrink-0">{fmtTime(e.at)}</span>
              <span className="text-cobalt font-semibold shrink-0">{e.name}</span>
              {e.payload && (
                <span className="text-ink-soft break-all">{JSON.stringify(e.payload)}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
