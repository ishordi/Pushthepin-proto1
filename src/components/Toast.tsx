import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const variantConfig: Record<ToastVariant, { icon: React.ReactNode; bg: string; text: string }> = {
  success: {
    icon: <CheckCircle size={20} aria-hidden="true" />,
    bg: 'bg-green',
    text: 'text-paper-raised',
  },
  info: {
    icon: <Info size={20} aria-hidden="true" />,
    bg: 'bg-cobalt',
    text: 'text-paper-raised',
  },
  error: {
    icon: <AlertCircle size={20} aria-hidden="true" />,
    bg: 'bg-coral',
    text: 'text-paper-raised',
  },
};

export default function Toast({
  message,
  variant = 'info',
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const { icon, bg, text } = variantConfig[variant];

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`fixed bottom-24 inset-x-4 z-50 mx-auto max-w-sm flex items-center gap-3 px-4 py-3 rounded-lg shadow-elevation-2 ${bg} ${text}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        >
          {icon}
          <span className="text-sm font-medium flex-1">{message}</span>
          <button
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 opacity-80 hover:opacity-100"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
