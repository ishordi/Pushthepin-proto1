import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonShape = 'rounded' | 'pill';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  shape?: ButtonShape;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-cobalt text-paper-raised hover:bg-cobalt-deep active:bg-cobalt-deep font-semibold shadow-elevation-1',
  secondary:
    'bg-paper-raised text-cobalt border border-line hover:bg-line active:bg-line font-semibold',
  ghost:
    'bg-transparent text-cobalt hover:bg-line active:bg-line font-semibold',
};

const shapeStyles: Record<ButtonShape, string> = {
  rounded: 'rounded-md',
  pill: 'rounded-pill',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', shape = 'rounded', fullWidth = false, className = '', children, ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-2',
          'min-h-[48px] min-w-[44px] px-6',
          'text-body leading-none',
          'transition-colors duration-100',
          'disabled:opacity-40 disabled:pointer-events-none',
          variantStyles[variant],
          shapeStyles[shape],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
