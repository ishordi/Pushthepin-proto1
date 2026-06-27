import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { log } from '../lib/log';

/* The mini-survey micro-prompt (PRS 7.8): one question, a few tap options,
   non-blocking and dismissible. The highest-value behaviour instrument, so
   every state is logged. Fired at meaningful moments (e.g. a first post). */

interface SurveyPromptProps {
  question: string;
  options: string[];
  where: string;
  onDone?: () => void;
}

export default function SurveyPrompt({ question, options, where, onDone }: SurveyPromptProps) {
  const reduce = useReducedMotion();
  const [answered, setAnswered] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    log('survey_shown', { where, question });
  }, [where, question]);

  if (dismissed) return null;

  function answer(option: string) {
    setAnswered(option);
    log('survey_answered', { where, question, answer: option });
  }

  function dismiss() {
    setDismissed(true);
    if (!answered) log('survey_dismissed', { where, question });
    onDone?.();
  }

  return (
    <motion.div
      role="group"
      aria-label="Quick question"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
      className="relative w-full rounded-lg border border-line bg-paper-raised shadow-elevation-1 p-4"
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss question"
        className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-pill text-ink-faint hover:text-ink"
      >
        <X size={18} aria-hidden="true" />
      </button>

      {answered ? (
        <p className="text-base text-ink-soft pr-8">Thanks — noted.</p>
      ) : (
        <>
          <p className="text-base font-semibold text-ink pr-8">{question}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => answer(o)}
                className="min-h-[40px] px-4 rounded-pill border border-line bg-paper text-ink text-sm font-medium hover:border-cobalt hover:text-cobalt transition-colors"
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
