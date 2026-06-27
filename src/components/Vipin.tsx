/* VIPIN — the product's friendly neighbour. A small, simple, line-drawn
   character. A few expressions are enough: hello, patient, pleased. */

export type VipinMood = 'hello' | 'patient' | 'pleased';

interface VipinProps {
  mood?: VipinMood;
  size?: number;
}

export default function Vipin({ mood = 'hello', size = 72 }: VipinProps) {
  return (
    <svg
      width={size}
      height={(size * 90) / 72}
      viewBox="0 0 72 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VIPIN, your neighbourhood guide"
    >
      {/* Body */}
      <rect x="20" y="42" width="32" height="34" rx="9" stroke="var(--color-cobalt)" strokeWidth="2.5" fill="var(--color-paper-raised)" />
      {/* Head */}
      <circle cx="36" cy="26" r="16" stroke="var(--color-cobalt)" strokeWidth="2.5" fill="var(--color-paper-raised)" />
      {/* Eyes */}
      {mood === 'pleased' ? (
        <>
          <path d="M28 25 q3 -3 6 0" stroke="var(--color-cobalt)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M38 25 q3 -3 6 0" stroke="var(--color-cobalt)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="31" cy="25" r="2.6" fill="var(--color-cobalt)" />
          <circle cx="41" cy="25" r="2.6" fill="var(--color-cobalt)" />
        </>
      )}
      {/* Mouth */}
      {mood === 'patient' ? (
        <line x1="31" y1="33" x2="41" y2="33" stroke="var(--color-cobalt)" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M30 32 q6 5 12 0" stroke="var(--color-cobalt)" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
      {/* Arms */}
      <line x1="20" y1="54" x2="9" y2={mood === 'hello' ? 46 : 62} stroke="var(--color-cobalt)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="54" x2="63" y2="62" stroke="var(--color-cobalt)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <line x1="28" y1="76" x2="24" y2="87" stroke="var(--color-cobalt)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="76" x2="48" y2="87" stroke="var(--color-cobalt)" strokeWidth="2.5" strokeLinecap="round" />
      {/* A little coral spot, hand-quality warmth */}
      <circle cx="36" cy="59" r="2.4" fill="var(--color-coral)" />
    </svg>
  );
}
