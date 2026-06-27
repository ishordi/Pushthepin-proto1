import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className = '', ...rest }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          rows={4}
          className={[
            'w-full px-4 py-3',
            'rounded-sm border border-line',
            'bg-paper-raised text-ink placeholder-ink-faint',
            'text-base leading-relaxed',
            'resize-y',
            'transition-colors duration-100',
            'hover:border-ink-faint',
            error ? 'border-coral' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {hint && !error && (
          <p id={hintId} className="text-sm text-ink-faint">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-coral" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export default Textarea;
