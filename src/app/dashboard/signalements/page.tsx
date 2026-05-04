'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { getSignalementImageUrl } from '@/lib/imageUtils';

interface Signalement {
  id: string;
  titre: string;
  description: string;
  statut: string;
  priorite: string;
  created_at: string;
  photo_url: string | null;
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

export default function SignalementsList() {
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('signalements')
        .select('*, parties_communes(nom)')
        .eq('resident_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setSignalements(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Signalements</h1>
          <p className="mt-1 text-sm text-slate-500">Historique complet de tous vos rapports.</p>
        </div>
        <Link
          href="/dashboard/signaler"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nouveau
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : signalements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-lg">Aucun signalement pour le moment</p>
          <Link href="/dashboard/signaler" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
            Créer votre premier signalement →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {signalements.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/signalement/${s.id}`}
              className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              {/* Thumbnail */}
              {s.photo_url ? (
                <img
                  src={getSignalementImageUrl(s.photo_url)}
                  alt={s.titre}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-2xl">
                  📋
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{s.titre}</p>
                <p className="text-sm text-slate-400 mt-0.5 truncate">
                  {s.parties_communes?.nom} • {new Date(s.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 items-end shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statutColors[s.statut]}`}>
                  {s.statut.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prioriteColors[s.priorite]}`}>
                  {s.priorite}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
