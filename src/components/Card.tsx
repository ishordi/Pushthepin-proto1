import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  as?: 'div' | 'article' | 'li';
}

export default function Card({ children, onClick, className = '', as: Tag = 'div' }: CardProps) {
  const isInteractive = !!onClick;

  return (
    <Tag
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={[
        'bg-paper-raised rounded-lg shadow-elevation-1',
        'p-4',
        isInteractive
          ? 'cursor-pointer hover:shadow-elevation-2 active:scale-[0.99] transition-all duration-100'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}
