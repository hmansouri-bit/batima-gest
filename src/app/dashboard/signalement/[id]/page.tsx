'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSignalementImageUrl } from '@/lib/imageUtils';

interface SignalementDetail {
  id: string;
  titre: string;
  description: string;
  statut: string;
  priorite: string;
  created_at: string;
  photo_url: string | null;
  parties_communes: { nom: string; type: string; etage: string | null } | null;
}

const statutColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  en_cours: 'bg-blue-100 text-blue-800',
  resolu: 'bg-green-100 text-green-800',
  rejete: 'bg-red-100 text-red-800',
};

export default function SignalementDetailPage() {
  const [s, setS] = useState<SignalementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const params = useParams();

  useEffect(() => {
    supabase
      .from('signalements')
      .select('*, parties_communes(nom, type, etage)')
      .eq('id', params.id as string)
      .single()
      .then(({ data }) => {
        setS(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-slate-400 animate-pulse">Chargement...</div>;
  }

  if (!s) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Signalement introuvable.</p>
        <Link href="/dashboard" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
          ← Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/signalements" className="text-blue-600 text-sm hover:underline">
        ← Retour aux signalements
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{s.titre}</h1>
          <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${statutColors[s.statut]}`}>
            {s.statut.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Partie commune</p>
            <p className="font-medium text-slate-800 dark:text-gray-100">{s.parties_communes?.nom || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Étage</p>
            <p className="font-medium text-slate-800 dark:text-gray-100">{s.parties_communes?.etage || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Priorité</p>
            <p className="font-medium text-slate-800 dark:text-gray-100 capitalize">{s.priorite}</p>
          </div>
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Date</p>
            <p className="font-medium text-slate-800 dark:text-gray-100">
              {new Date(s.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Description</p>
          <p className="text-sm text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-gray-700 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
            {s.description}
          </p>
        </div>

        {s.photo_url && (
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Photo du problème</p>
            <img
              src={getSignalementImageUrl(s.photo_url)}
              alt="Photo du problème"
              className="rounded-xl w-full object-cover max-h-72 border border-slate-100"
            />
            <a
              href={getSignalementImageUrl(s.photo_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-xs mt-2 inline-block hover:underline"
            >
              Voir en plein écran →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
