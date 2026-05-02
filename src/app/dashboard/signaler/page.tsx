'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface Espace {
  id: string;
  nom: string;
  type: string;
}

export default function SignalerPage() {
  const [espaces, setEspaces] = useState<Espace[]>([]);
  const [form, setForm] = useState({
    espace_id: '',
    titre: '',
    description: '',
    priorite: 'normale',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    supabase
      .from('parties_communes')
      .select('*')
      .order('nom')
      .then(({ data }) => {
        if (data) setEspaces(data);
      });

    const espaceId = searchParams.get('espace_id');
    if (espaceId) setForm((f) => ({ ...f, espace_id: espaceId }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.espace_id) {
      toast.error('Veuillez sélectionner une partie commune.');
      return;
    }
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/auth/login';
        return;
      }
      const user = session.user;

      let photo_url: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('signalement-photos')
          .upload(path, file);

        if (uploadError) {
          toast.error("Erreur lors de l'envoi de la photo : " + uploadError.message);
          setLoading(false);
          return;
        }

        // Store just the path, not the full URL - we'll use our API proxy to serve it
        photo_url = path;
      }

      const { error } = await supabase.from('signalements').insert({
        resident_id: user.id,
        espace_id: form.espace_id,
        titre: form.titre,
        description: form.description,
        priorite: form.priorite,
        photo_url,
        statut: 'en_attente',
      });

      if (error) throw error;

      toast.success('Signalement envoyé avec succès !');
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Signaler un problème</h1>
        <p className="mt-1 text-slate-500">
          Remplissez ce formulaire pour informer le syndic d&apos;un incident.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-6 space-y-5 shadow-sm">
        {/* Partie commune */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Partie commune concernée <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.espace_id}
            onChange={(e) => setForm({ ...form, espace_id: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Sélectionnez un espace...</option>
            {espaces.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom} ({e.type})
              </option>
            ))}
          </select>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Titre du problème <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            placeholder="Ex: Ascenseur bloqué au 3ème étage"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Niveau de priorité</label>
          <div className="grid grid-cols-4 gap-2">
            {(['basse', 'normale', 'haute', 'urgente'] as const).map((p) => (
              <label
                key={p}
                className={`flex items-center justify-center py-2 rounded-lg cursor-pointer border text-sm font-medium capitalize transition-colors ${form.priorite === p
                  ? p === 'urgente' ? 'bg-red-50 border-red-400 text-red-700'
                    : p === 'haute' ? 'bg-orange-50 border-orange-400 text-orange-700'
                      : p === 'normale' ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-slate-100 border-slate-400 text-slate-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="radio"
                  name="priorite"
                  value={p}
                  checked={form.priorite === p}
                  onChange={() => setForm({ ...form, priorite: p })}
                  className="sr-only"
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description détaillée <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez le problème avec le plus de détails possible..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Photo du problème (optionnel)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
          />
          {file && <p className="text-xs text-green-600 mt-1">✅ {file.name}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Envoi en cours...' : '🚨 Envoyer le signalement'}
          </button>
        </div>
      </form>
    </div>
  );
}
