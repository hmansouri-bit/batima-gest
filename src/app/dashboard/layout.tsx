'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import DarkModeToggle from '@/components/ui/DarkModeToggle';

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
    const checkSession = async () => {
      console.log('[DASHBOARD] Checking session...');

      // Use getUser() instead of getSession() — it validates against the server
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      console.log('[DASHBOARD] getUser result:', {
        hasUser: !!user,
        userId: user?.id ?? null,
        email: user?.email ?? null,
        error: userError?.message ?? null,
      });

      if (!user || userError) {
        console.log('[DASHBOARD] No user found, redirecting to login');
        // Not authenticated — middleware should handle redirect,
        // but as a fallback:
        router.push('/auth/login');
        return;
      }

      // Try to fetch the profile
      const { data: profile } = await supabase
        .from('residents')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        if (profile.role === 'admin') {
          router.push('/admin');
          return;
        }
        setResident(profile);
        setLoading(false);
        return;
      }


      // Profile is missing — auto-create one using user metadata or email
      const metadata = user.user_metadata ?? {};
      const { data: newProfile, error: insertError } = await supabase
        .from('residents')
        .insert({
          id: user.id,
          full_name: metadata.full_name ?? user.email?.split('@')[0] ?? 'Résident',
          apartment_number: metadata.apartment_number ?? 'N/A',
          building_name: metadata.building_name ?? 'N/A',
          phone: metadata.phone ?? null,
        })
        .select()
        .single();

      if (insertError) {
        // Insert might fail if the row already exists (race condition) — try fetching again
        const { data: retryProfile } = await supabase
          .from('residents')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        setResident(retryProfile);
      } else {
        setResident(newProfile);
      }

      setLoading(false);
    };

    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-gray-400 text-sm">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-gray-900 p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Profil introuvable</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-6">
          Impossible de créer ou récupérer votre profil. Veuillez réessayer ou contacter l&apos;administrateur.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/auth/login';
            }}
            className="bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
    { href: '/dashboard/espaces', label: 'Parties communes', icon: '🏢' },
    { href: '/dashboard/signaler', label: 'Signaler un problème', icon: '🚨' },
    { href: '/dashboard/signalements', label: 'Mes signalements', icon: '📋' },
    { href: '/dashboard/annonces', label: 'Annonces', icon: '📢' },
    { href: '/dashboard/profile', label: 'Mon profil', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600">Batima-Gest</h1>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Espace Résident</p>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
          <p className="font-semibold text-slate-800 dark:text-gray-100 truncate">{resident?.full_name || 'Résident'}</p>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 truncate">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/auth/login';
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <span className="text-base">🚪</span>
            Se déconnecter
          </button>
          <DarkModeToggle />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-4 h-14 flex items-center justify-between shrink-0">
          <span className="font-bold text-blue-600">Batima-Gest</span>
          <div className="flex gap-3 text-xl">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} title={l.label}>{l.icon}</Link>
            ))}
            <DarkModeToggle />
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
