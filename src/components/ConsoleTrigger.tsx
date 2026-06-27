import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* Hidden access to the Test Console (PRS section 11): a triple-tap on the
   top-right corner, or Ctrl/Cmd+Shift+K on desktop. Never visible, never in the
   resident navigation. Remembers where the tester was so the console can return
   them on close. */

let returnTo = '/app/pulse';
export function getConsoleReturn(): string {
  return returnTo;
}

export default function ConsoleTrigger() {
  const navigate = useNavigate();
  const location = useLocation();
  const taps = useRef<number[]>([]);

  // Keep the last non-console path as the return target.
  useEffect(() => {
    if (location.pathname !== '/console') returnTo = location.pathname + location.search;
  }, [location]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        navigate('/console');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  if (location.pathname === '/console') return null;

  function onCornerTap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 700), now];
    if (taps.current.length >= 3) {
      taps.current = [];
      navigate('/console');
    }
  }

  return (
    <button
      onClick={onCornerTap}
      aria-hidden="true"
      tabIndex={-1}
      title=""
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        zIndex: 10000,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'default',
      }}
    />
  );
}
