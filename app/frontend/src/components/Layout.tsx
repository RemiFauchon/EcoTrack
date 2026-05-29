import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

interface NavLink {
  to: string;
  label: string;
  icon: string;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const isManager = user?.role === 'GESTIONNAIRE' || user?.role === 'ADMIN';

  const links: NavLink[] = [
    ...(isManager ? [{ to: '/dashboard', label: 'Pilotage', icon: '🗺️' }] : []),
    ...(user?.role === 'AGENT' || isManager ? [{ to: '/agent', label: 'Tournées', icon: '🚛' }] : []),
    { to: '/citoyen', label: 'Citoyen', icon: '♻️' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin', icon: '🛠️' }] : []),
  ];

  const active = (to: string) => loc.pathname === to;

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <header className="bg-ink text-paper z-[1000]">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand-500 text-white text-lg">♻︎</span>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-lg">ECOTRACK</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-200/70 -mt-0.5">Lyon Métropole</div>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition ${
                  active(l.to) ? 'bg-brand-500 text-white' : 'text-paper/70 hover:bg-white/10'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-sm font-semibold">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[11px] text-brand-200/70">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="btn bg-white/10 text-paper hover:bg-white/20 !px-3 !py-2 text-xs"
            >
              Quitter
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

      {/* Nav mobile (barre basse) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-ink text-paper border-t border-white/10 flex z-[1000]">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold ${
              active(l.to) ? 'text-brand-300' : 'text-paper/60'
            }`}
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
