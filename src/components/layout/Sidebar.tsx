'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building, Home, MapPin, AlertTriangle, List, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SidebarProps {
  user: any; // User from Supabase
  profile: any; // Profile from residents table
}

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    } else {
        window.location.href = '/auth/login';
      router.refresh();
    }
  };

  const navItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Parties communes', href: '/dashboard/espaces', icon: MapPin },
    { name: 'Signaler un problème', href: '/dashboard/signaler', icon: AlertTriangle },
    { name: 'Mes signalements', href: '/dashboard/signalements', icon: List },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white h-full border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary-500 p-2 rounded-lg">
            <Building className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Batima-Gest</span>
        </Link>
      </div>

      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-primary-400 font-bold uppercase overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.charAt(0) || 'U'
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate" title={profile?.full_name}>
              {profile?.full_name || 'Utilisateur'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              Apt {profile?.apartment_number} • {profile?.building_name}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 text-slate-400" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
