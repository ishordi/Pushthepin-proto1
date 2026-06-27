import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { CivicStatus, StatusHistoryEntry } from '../../types/pin';
import { daysSince } from '../../lib/time';

/* The civic loop, as a calm stepped tracker — not a loud progress bar.
   Completed portion fills in the current status colour, the active step
   pulses gently, elapsed time is shown honestly under the tracker. */

const STEPS: { key: CivicStatus; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'in_review', label: 'In review' },
  { key: 'routed', label: 'Routed' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const STATUS_FILL: Record<CivicStatus, string> = {
  submitted: 'var(--color-ink-soft)',
  in_review: 'var(--color-ink-soft)',
  routed: 'var(--color-cobalt)',
  waiting: 'var(--color-amber)',
  resolved: 'var(--color-green)',
  closed: 'var(--color-green)',
};

const STATUS_LABEL: Record<CivicStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In review',
  routed: 'Routed to BMC',
  waiting: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed by neighbours',
};

interface CivicTrackerProps {
  status: CivicStatus;
  statusHistory: StatusHistoryEntry[];
  confirmations: number;
}

function elapsedText(days: number): string {
  if (days <= 0) return 'today';
  return `${days} day${days === 1 ? '' : 's'}`;
}

export default function CivicTracker({ status, statusHistory, confirmations }: CivicTrackerProps) {
  const reduce = useReducedMotion();
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const fill = STATUS_FILL[status];

  // honest elapsed time since the current step began
  const entry = [...statusHistory].reverse().find((e) => e.status === status);
  const sinceIso = entry?.at ?? statusHistory[statusHistory.length - 1]?.at;
  const days = sinceIso ? daysSince(sinceIso) : 0;

  return (
    <div className="flex flex-col gap-3" aria-label={`Status: ${STATUS_LABEL[status]}`}>
      <ol className="flex items-start justify-between">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const upcoming = i > currentIndex;
          return (
            <li key={step.key} className="flex flex-col items-center flex-1 min-w-0 relative">
              {/* connector to previous node — the fill sweeps in on advance */}
              {i > 0 && (
                <span className="absolute top-[11px] right-1/2 h-[2px] w-full" aria-hidden="true">
                  <span className="absolute inset-0" style={{ backgroundColor: 'var(--color-line)' }} />
                  {i <= currentIndex && (
                    <motion.span
                      className="absolute inset-0 origin-left"
                      style={{ backgroundColor: fill }}
                      initial={reduce ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.4, ease: 'easeOut', delay: i * 0.08 }}
                    />
                  )}
                </span>
              )}
              {/* node */}
              <span className="relative z-10 flex items-center justify-center" style={{ width: 24, height: 24 }}>
                {active && !reduce && (
                  <motion.span
                    className="absolute inset-0 rounded-pill"
                    style={{ backgroundColor: fill }}
                    initial={{ opacity: 0.4, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="relative flex items-center justify-center rounded-pill"
                  style={{
                    width: active ? 22 : 16,
                    height: active ? 22 : 16,
                    backgroundColor: upcoming ? 'var(--color-paper-raised)' : fill,
                    border: upcoming ? '2px solid var(--color-line)' : 'none',
                  }}
                >
                  {(done || status === 'closed') && (
                    <Check size={active ? 13 : 10} color="var(--color-paper-raised)" strokeWidth={3} aria-hidden="true" />
                  )}
                </span>
              </span>
              <span
                className="text-[10px] leading-tight text-center mt-1.5 px-0.5"
                style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink-faint)', fontWeight: active ? 600 : 400 }}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="text-sm tabular-nums" style={{ color: fill }}>
        <span className="font-semibold">{STATUS_LABEL[status]}</span>
        {status !== 'closed' && <span className="text-ink-faint font-normal"> · {elapsedText(days)} at this step</span>}
        {status === 'closed' && (
          <span className="text-ink-faint font-normal">
            {' '}· {confirmations} neighbour{confirmations === 1 ? '' : 's'} confirmed
          </span>
        )}
      </div>
    </div>
  );
}
