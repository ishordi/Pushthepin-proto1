import { useSyncExternalStore } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingNav from '../../components/FloatingNav';
import { subscribeOverrides, getOverrides } from '../../lib/overrides';

/* The floating bottom nav appears on the browsing destinations (Pulse, Gather,
   Building, Profile) and gives way on focused tasks (create, pin detail,
   collage) so the user is never lost mid-task. */
function isFocusedTask(pathname: string): boolean {
  return (
    pathname.startsWith('/app/create') ||
    pathname.startsWith('/app/pin/') ||
    pathname.startsWith('/app/collage/')
  );
}

export default function AppShell() {
  const { pathname } = useLocation();
  const navOverride = useSyncExternalStore(subscribeOverrides, () => getOverrides().nav);
  const showNav = !isFocusedTask(pathname) && navOverride;

  return (
    <div className="min-h-[100svh] flex flex-col bg-paper">
      <Outlet />
      {showNav && <FloatingNav />}
    </div>
  );
}
