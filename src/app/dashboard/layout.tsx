'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface Resident {
  full_name: string;
  apartment_number: string;
  building_name: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        if (!session) {
          // Instead of redirecting instantly, just stop loading and let the user see the problem.
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from('residents')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        setResident(data);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // If loading is false, and we still have no resident and no session...
  // wait, we don't have a state for "no session" explicitly, but we can check if resident is null
  // Actually, we just need to verify if the layout renders without crashing.
  // We'll let it render. If it fails, they'll see the empty layout.
  // To be safe, if we get here and want to show a fallback:
  if (!resident) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Non connecté ou profil introuvable</h2>
        <p className="text-slate-500 mb-6">Nous n&apos;avons pas pu récupérer votre session.</p>
        <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  const navLinks = [
    { href: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
    { href: '/dashboard/espaces', label: 'Parties communes', icon: '🏢' },
    { href: '/dashboard/signaler', label: 'Signaler un problème', icon: '🚨' },
    { href: '/dashboard/signalements', label: 'Mes signalements', icon: '📋' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-blue-600">Batima-Gest</h1>
          <p className="text-xs text-slate-400 mt-0.5">Espace Résident</p>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <p className="font-semibold text-slate-800 truncate">{resident?.full_name || 'Résident'}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Appt {resident?.apartment_number} — {resident?.building_name}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/auth/login';
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-base">🚪</span>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between shrink-0">
          <span className="font-bold text-blue-600">Batima-Gest</span>
          <div className="flex gap-3 text-xl">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} title={l.label}>{l.icon}</Link>
            ))}
            <button
              title="Déconnexion"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/auth/login';
              }}
            >🚪</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
