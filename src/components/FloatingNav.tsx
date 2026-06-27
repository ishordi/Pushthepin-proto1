import { NavLink } from 'react-router-dom';
import { MapPin, CalendarDays, Plus, Building2, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/pulse', label: 'Pulse', icon: MapPin },
  { to: '/app/gather', label: 'Gather', icon: CalendarDays },
  { to: '/app/building', label: 'Building', icon: Building2 },
  { to: '/app/profile', label: 'Profile', icon: User },
];

export default function FloatingNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-4 inset-x-0 z-30 flex justify-center pointer-events-none px-4"
    >
      <div className="pointer-events-auto flex items-center gap-1 bg-paper-raised rounded-pill shadow-elevation-2 px-2 py-1.5 border border-line">
        {/* First two slots */}
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavSlot key={item.to} item={item} />
        ))}

        {/* Create — centre, raised, the primary action */}
        <NavLink
          to="/app/create"
          aria-label="Create a pin"
          className="flex items-center justify-center w-14 h-14 -my-3 mx-1 rounded-pill bg-cobalt text-paper-raised shadow-elevation-2 hover:bg-cobalt-deep transition-colors"
        >
          <Plus size={28} strokeWidth={2.5} aria-hidden="true" />
        </NavLink>

        {/* Last two slots */}
        {NAV_ITEMS.slice(2).map((item) => (
          <NavSlot key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}

function NavSlot({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      aria-label={item.label}
      className={({ isActive }) =>
        [
          'flex flex-col items-center justify-center gap-0.5',
          'min-w-[56px] min-h-[48px] px-2 rounded-pill',
          'transition-colors',
          isActive ? 'text-cobalt' : 'text-ink-soft hover:text-ink',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
          <span className="text-[11px] font-medium leading-none">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}
