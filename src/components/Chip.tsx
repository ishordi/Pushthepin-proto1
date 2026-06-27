import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type PinType = 'civic' | 'event' | 'help' | 'sell' | 'buy' | 'service';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  pinType?: PinType | 'all';
  label: string;
}

const typeActiveStyles: Record<PinType | 'all', string> = {
  all: 'bg-ink text-paper-raised',
  civic: 'bg-pin-civic text-paper-raised',
  event: 'bg-pin-event text-paper-raised',
  help: 'bg-pin-help text-ink',
  sell: 'bg-pin-sell text-paper-raised',
  buy: 'bg-pin-buy text-paper-raised',
  service: 'bg-pin-service text-paper-raised',
};

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ active = false, pinType = 'all', label, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        role="radio"
        aria-checked={active}
        aria-label={label}
        className={[
          'inline-flex items-center justify-center',
          'min-h-[36px] min-w-[44px] px-4',
          'rounded-pill text-sm font-medium',
          'transition-colors duration-100',
          'whitespace-nowrap',
          active
            ? typeActiveStyles[pinType]
            : 'bg-paper-raised text-ink-soft border border-line hover:border-ink-faint',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {label}
      </button>
    );
  },
);

Chip.displayName = 'Chip';
export default Chip;
