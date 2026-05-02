'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Resident {
  full_name: string;
  apartment_number: string;
  building_name: string;
}

interface Signalement {
  id: string;
  titre: string;
  statut: string;
  priorite: string;
  created_at: string;
  parties_communes: { nom: string } | null;
}

const statutColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  en_cours: 'bg-blue-100 text-blue-800',
  resolu: 'bg-green-100 text-green-800',
  rejete: 'bg-red-100 text-red-800',
};

const prioriteColors: Record<string, string> = {
  basse: 'bg-gray-100 text-gray-600',
  normale: 'bg-blue-100 text-blue-700',
  haute: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const [resident, setResident] = useState<Resident | null>(null);
  const [recent, setRecent] = useState<Signalement[]>([]);
  const [stats, setStats] = useState({ total: 0, en_attente: 0, en_cours: 0, resolu: 0 });
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;
      const user = session.user;

      const { data: profile } = await supabase
        .from('residents')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setResident(profile);

      const { data: signalements } = await supabase
        .from('signalements')
        .select('*, parties_communes(nom)')
        .eq('resident_id', user.id)
        .order('created_at', { ascending: false });

      if (signalements) {
        setRecent(signalements.slice(0, 5));
        setStats({
          total: signalements.length,
          en_attente: signalements.filter((s) => s.statut === 'en_attente').length,
          en_cours: signalements.filter((s) => s.statut === 'en_cours').length,
          resolu: signalements.filter((s) => s.statut === 'resolu').length,
        });
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total signalements', value: stats.total, bg: 'bg-slate-50', text: 'text-slate-800' },
    { label: 'En attente', value: stats.en_attente, bg: 'bg-yellow-50', text: 'text-yellow-700' },
    { label: 'En cours', value: stats.en_cours, bg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Résolus', value: stats.resolu, bg: 'bg-green-50', text: 'text-green-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {resident?.full_name?.split(' ')[0] || 'Résident'} 👋
        </h1>
        <p className="mt-1 text-slate-500">
          Appartement {resident?.apartment_number || '—'} • {resident?.building_name || '—'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5 border border-slate-100`}>
            <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/signaler"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        🚨 Signaler un nouveau problème
      </Link>

      {/* Recent signalements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Derniers signalements</h2>
          {recent.length > 0 && (
            <Link href="/dashboard/signalements" className="text-sm text-blue-600 hover:underline">
              Voir tout →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 text-lg">Aucun signalement pour le moment</p>
            <Link href="/dashboard/signaler" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
              Créer votre premier signalement →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/signalement/${s.id}`}
                className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{s.titre}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {s.parties_communes?.nom} • {new Date(s.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prioriteColors[s.priorite]}`}>
                    {s.priorite}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statutColors[s.statut]}`}>
                    {s.statut.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
