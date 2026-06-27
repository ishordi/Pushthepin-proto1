import Vipin from './Vipin';
import type { VipinMood } from './Vipin';

interface EmptyStateProps {
  message: string;
  sub?: string;
  mood?: VipinMood;
}

/* Never a blank screen — the shared VIPIN plus one calm line. */
export default function EmptyState({ message, sub, mood = 'hello' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      <Vipin mood={mood} size={72} />
      <p className="text-base font-medium text-ink-soft max-w-xs">{message}</p>
      {sub && <p className="text-sm text-ink-faint max-w-xs">{sub}</p>}
    </div>
  );
}
