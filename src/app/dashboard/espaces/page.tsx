'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Espace {
  id: string;
  nom: string;
  type: string;
  description: string | null;
  etage: string | null;
}

const typeIcons: Record<string, string> = {
  ascenseur: '🛗',
  couloir: '🚪',
  parking: '🅿️',
  jardin: '🌳',
  toit: '🏠',
  local_poubelle: '🗑️',
  local_velo: '🚲',
  escalier: '🪜',
  autre: '🏢',
};

export default function EspacesPage() {
  const [espaces, setEspaces] = useState<Espace[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('parties_communes')
      .select('*')
      .order('nom')
      .then(({ data }) => {
        if (data) setEspaces(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Parties Communes</h1>
        <p className="mt-1 text-slate-500">
          Sélectionnez un espace pour signaler un problème.
        </p>
      </div>

      {espaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-400">Aucune partie commune configurée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {espaces.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="text-3xl mb-3">{typeIcons[e.type] || '🏢'}</div>
              <h3 className="font-semibold text-slate-800 text-lg">{e.nom}</h3>
              {e.etage && (
                <p className="text-xs text-slate-400 mt-1">Étage : {e.etage}</p>
              )}
              <p className="text-sm text-slate-500 mt-2 flex-1">
                {e.description || 'Aucune description.'}
              </p>
              <Link
                href={`/dashboard/signaler?espace_id=${e.id}`}
                className="mt-4 w-full text-center bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                🚨 Signaler un problème ici
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
