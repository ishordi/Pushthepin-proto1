import { motion, useReducedMotion } from 'framer-motion';
import { isImageSrc } from '../../lib/photo';

/* The proof moment: before and after sit together. The after cross-reveals
   when freshly resolved — the emotional peak of the product. */

function Photo({ src, label }: { src?: string; label: string }) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
      {src && isImageSrc(src) ? (
        <img src={src} alt={`${label} photo`} className="w-full rounded-md border border-line object-cover aspect-square" />
      ) : (
        <div className="w-full aspect-square rounded-md border border-line bg-paper flex items-center justify-center text-sm text-ink-faint">
          {label}
        </div>
      )}
    </div>
  );
}

interface ResolutionRevealProps {
  beforePhoto?: string;
  afterPhoto: string;
  justRevealed?: boolean;
}

export default function ResolutionReveal({ beforePhoto, afterPhoto, justRevealed = false }: ResolutionRevealProps) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-green/40 bg-green/5 p-3">
      <p className="text-sm font-semibold text-green">It’s sorted. Here’s the proof.</p>
      <div className="flex gap-3">
        <Photo src={beforePhoto} label="Before" />
        <motion.div
          className="flex-1 flex"
          initial={justRevealed && !reduce ? { opacity: 0, scale: 0.92 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: justRevealed ? 0.15 : 0 }}
        >
          <Photo src={afterPhoto} label="After" />
        </motion.div>
      </div>
    </div>
  );
}
