import { useReducer, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Store, LayoutDashboard, PlusSquare, BarChart3, LogOut, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { getState, setBusinessSession, clearBusinessSession } from '../../data/store';

export interface BusinessSession {
  businessName: string;
}

export default function BusinessPage() {
  const navigate = useNavigate();
  const [, force] = useReducer((x) => x + 1, 0);
  const [name, setName] = useState('The Bandra Bakehouse');
  const businessName = getState().businessSession;

  function signIn() {
    if (!name.trim()) return;
    setBusinessSession(name.trim());
    force();
  }
  function signOut() {
    clearBusinessSession();
    force();
  }

  if (!businessName) {
    return (
      <div className="min-h-[100svh] bg-paper flex flex-col">
        <header className="flex items-center gap-2 px-3 py-2 border-b border-line">
          <button onClick={() => navigate('/app/pulse')} aria-label="Back to app" className="w-11 h-11 flex items-center justify-center rounded-pill text-ink hover:bg-line">
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <span className="text-base font-semibold text-ink">Business</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="w-14 h-14 rounded-lg bg-cobalt/10 flex items-center justify-center">
                <Store size={28} className="text-cobalt" aria-hidden="true" />
              </span>
              <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
                Push The Pin for business
              </h1>
              <p className="text-sm text-ink-soft">
                Post to the neighbourhood feed. Reach the people who actually live nearby.
              </p>
            </div>
            <TextInput label="Business name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button fullWidth disabled={!name.trim()} onClick={signIn}>
              Sign in
            </Button>
            <p className="text-xs text-ink-faint text-center">
              Mock sign-in for the prototype — no password, nothing stored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-paper flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-line bg-paper-raised">
        <span className="w-9 h-9 rounded-md bg-cobalt/10 flex items-center justify-center flex-shrink-0">
          <Store size={18} className="text-cobalt" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink leading-tight">{businessName}</p>
          <p className="text-xs text-ink-faint leading-tight">Business dashboard</p>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink min-h-[44px] px-2">
          <LogOut size={16} aria-hidden="true" /> Sign out
        </button>
      </header>

      <nav className="flex gap-1 px-3 py-2 border-b border-line" aria-label="Business sections">
        <Tab to="/business" end icon={<LayoutDashboard size={16} />} label="Dashboard" />
        <Tab to="/business/post" icon={<PlusSquare size={16} />} label="New post" />
        <Tab to="/business/stats" icon={<BarChart3 size={16} />} label="Stats" />
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <Outlet context={{ businessName } satisfies BusinessSession} />
      </div>
    </div>
  );
}

function Tab({ to, end, icon, label }: { to: string; end?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-md text-sm font-semibold transition-colors',
          isActive ? 'bg-cobalt text-paper-raised' : 'text-ink-soft hover:bg-line',
        ].join(' ')
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
