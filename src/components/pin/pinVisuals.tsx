/*
  The pin system — the signature visual of Push The Pin.
  Each type carries a unique colour, head shape, and lucide glyph, plus a label,
  so type is readable by shape and label alone, never colour only.

  Colours are pulled from CSS variables (tokens), never hardcoded hex, so SVG
  fills stay token-driven.
*/

import { Flag, CalendarDays, Hand, Tag, ShoppingBag, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PinType } from '../../types/pin';

export interface PinVisual {
  label: string;
  colorVar: string;
  glyph: LucideIcon;
  /** Use dark ink glyph instead of paper for legibility on light fills. */
  glyphOnLight?: boolean;
}

export const PIN_VISUALS: Record<PinType, PinVisual> = {
  civic: { label: 'Civic', colorVar: 'var(--color-pin-civic)', glyph: Flag },
  event: { label: 'Events', colorVar: 'var(--color-pin-event)', glyph: CalendarDays },
  help: { label: 'Help', colorVar: 'var(--color-pin-help)', glyph: Hand, glyphOnLight: true },
  sell: { label: 'Sell', colorVar: 'var(--color-pin-sell)', glyph: Tag },
  buy: { label: 'Buy', colorVar: 'var(--color-pin-buy)', glyph: ShoppingBag },
  service: { label: 'Service', colorVar: 'var(--color-pin-service)', glyph: Wrench },
};

/* ── Head silhouettes, distinct per type ── */
function HeadShape({ type, fill }: { type: PinType; fill: string }) {
  switch (type) {
    case 'civic': // rounded square
      return <rect x="5" y="3" width="30" height="30" rx="9" fill={fill} />;
    case 'service': // soft square (squarer than civic)
      return <rect x="5" y="3" width="30" height="30" rx="4" fill={fill} />;
    case 'help': // round
      return <circle cx="20" cy="18" r="15.5" fill={fill} />;
    case 'buy': // round
      return <circle cx="20" cy="18" r="15.5" fill={fill} />;
    case 'sell': // tag — rounded square with a tag hole
      return (
        <>
          <rect x="5" y="3" width="30" height="30" rx="9" fill={fill} />
          <circle cx="13" cy="11" r="2.6" fill="var(--color-paper-raised)" />
        </>
      );
    case 'event': // notched / tabbed top, calendar feel
      return (
        <>
          <rect x="11" y="2" width="4" height="7" rx="2" fill={fill} />
          <rect x="25" y="2" width="4" height="7" rx="2" fill={fill} />
          <rect x="5" y="6" width="30" height="27" rx="7" fill={fill} />
        </>
      );
  }
}

interface PinMarkerSvgProps {
  type: PinType;
  resolved?: boolean;
  size?: number;
}

/** The full marker: head with glyph, narrowing to a point at the geocode. */
export function PinMarkerSvg({ type, resolved = false, size = 40 }: PinMarkerSvgProps) {
  const visual = PIN_VISUALS[type];
  const Glyph = visual.glyph;
  const glyphColor = visual.glyphOnLight ? 'var(--color-ink)' : 'var(--color-paper-raised)';

  return (
    <svg
      width={size}
      height={(size * 50) / 40}
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* pointer (drawn behind the head so they merge) */}
      <path d="M20 48 L13 27 H27 Z" fill={visual.colorVar} />
      <HeadShape type={type} fill={visual.colorVar} />
      {/* glyph centred in the head */}
      <g transform="translate(12,10)">
        <Glyph size={16} color={glyphColor} strokeWidth={2.5} />
      </g>
      {/* resolved/closed civic check badge */}
      {resolved && (
        <g>
          <circle cx="31" cy="9" r="7.5" fill="var(--color-green)" stroke="var(--color-paper)" strokeWidth="2" />
          <path
            d="M27.6 9 l2.2 2.2 l3.8 -4.3"
            fill="none"
            stroke="var(--color-paper-raised)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}

/** Collage marker — layered heads with a count badge (civic only). */
export function CollageMarkerSvg({ type, count, size = 48 }: { type: PinType; count: number; size?: number }) {
  const visual = PIN_VISUALS[type];
  const Glyph = visual.glyph;
  const glyphColor = visual.glyphOnLight ? 'var(--color-ink)' : 'var(--color-paper-raised)';

  return (
    <svg
      width={size}
      height={(size * 54) / 48}
      viewBox="0 0 48 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22 52 L15 30 H29 Z" fill={visual.colorVar} />
      {/* back stacked heads */}
      <rect x="14" y="7" width="26" height="26" rx="8" fill={visual.colorVar} opacity="0.4" />
      <rect x="10" y="4" width="26" height="26" rx="8" fill={visual.colorVar} opacity="0.7" />
      {/* front head */}
      <rect x="4" y="1" width="28" height="28" rx="9" fill={visual.colorVar} />
      <g transform="translate(10,7)">
        <Glyph size={16} color={glyphColor} strokeWidth={2.5} />
      </g>
      {/* count badge */}
      <g>
        <circle cx="39" cy="9" r="8.5" fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth="2" />
        <text
          x="39"
          y="12.5"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="var(--color-paper-raised)"
          fontFamily="var(--font-body)"
        >
          {count}
        </text>
      </g>
    </svg>
  );
}

/** Small non-interactive type badge for cards. */
export function TypeBadge({ type }: { type: PinType }) {
  const visual = PIN_VISUALS[type];
  const Glyph = visual.glyph;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: `color-mix(in srgb, ${visual.colorVar} 16%, var(--color-paper-raised))`,
        color: visual.colorVar,
      }}
    >
      <Glyph size={12} strokeWidth={2.5} aria-hidden="true" />
      {visual.label}
    </span>
  );
}
