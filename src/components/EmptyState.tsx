interface EmptyStateProps {
  message: string;
  sub?: string;
}

/* VIPIN — a minimal line-drawn SVG neighbour. Warm, simple, hand-quality. */
function VipinFigure() {
  return (
    <svg
      width="64"
      height="80"
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Body */}
      <rect x="18" y="38" width="28" height="30" rx="8" stroke="#2B43E6" strokeWidth="2.5" fill="#F4EEE3" />
      {/* Head */}
      <circle cx="32" cy="24" r="14" stroke="#2B43E6" strokeWidth="2.5" fill="#FBF7EF" />
      {/* Eyes */}
      <circle cx="26" cy="23" r="2.5" fill="#2B43E6" />
      <circle cx="38" cy="23" r="2.5" fill="#2B43E6" />
      {/* Smile */}
      <path d="M27 30 Q32 34 37 30" stroke="#2B43E6" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Arms */}
      <line x1="18" y1="48" x2="8" y2="56" stroke="#2B43E6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="48" x2="56" y2="56" stroke="#2B43E6" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <line x1="24" y1="68" x2="20" y2="78" stroke="#2B43E6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="68" x2="44" y2="78" stroke="#2B43E6" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function EmptyState({ message, sub }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      <VipinFigure />
      <p className="text-base font-medium text-ink-soft max-w-xs">{message}</p>
      {sub && <p className="text-sm text-ink-faint max-w-xs">{sub}</p>}
    </div>
  );
}
