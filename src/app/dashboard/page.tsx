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
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, en_attente: 0, en_cours: 0, resolu: 0 });
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      const { data: annoncesData } = await supabase
        .from('annonces')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      if (annoncesData) setAnnonces(annoncesData)
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total signalements', value: stats.total, bg: 'bg-slate-50 dark:bg-gray-800', text: 'text-slate-800 dark:text-white' },
    { label: 'En attente', value: stats.en_attente, bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    { label: 'En cours', value: stats.en_cours, bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Résolus', value: stats.resolu, bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bonjour, {resident?.full_name?.split(' ')[0] || 'Résident'} 👋
        </h1>
        <p className="mt-1 text-slate-500 dark:text-gray-400">
          Appartement {resident?.apartment_number || '—'} • {resident?.building_name || '—'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5 border border-slate-100 dark:border-gray-700`}>
            <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{s.label}</p>
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

      {/* Announcements */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100">📢 Annonces de la direction</h2>
          <a href="/dashboard/annonces" className="text-sm text-blue-600 hover:underline">Voir tout →</a>
        </div>
        {annonces.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune annonce pour le moment</p>
        ) : (
          <div className="space-y-3">
            {annonces.map(a => {
              const colors: Record<string,string> = {
                info: 'border-l-blue-500',
                urgent: 'border-l-red-500',
                travaux: 'border-l-orange-500',
                reunion: 'border-l-purple-500',
              }
              const badges: Record<string,string> = {
                info: 'bg-blue-100 text-blue-700',
                urgent: 'bg-red-100 text-red-700',
                travaux: 'bg-orange-100 text-orange-700',
                reunion: 'bg-purple-100 text-purple-700',
              }
              return (
                <div key={a.id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-l-4 ${colors[a.type] || 'border-l-blue-500'} p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badges[a.type] || badges.info}`}>{a.type}</span>
                    <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{a.titre}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{a.contenu}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent signalements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100">Derniers signalements</h2>
          {recent.length > 0 && (
            <Link href="/dashboard/signalements" className="text-sm text-blue-600 hover:underline">
              Voir tout →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-slate-300 dark:border-gray-600">
            <p className="text-slate-400 dark:text-gray-500 text-lg">Aucun signalement pour le moment</p>
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
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-gray-100 truncate">{s.titre}</p>
                  <p className="text-sm text-slate-400 dark:text-gray-500 mt-0.5">
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
