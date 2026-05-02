'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const statutOptions = ['en_attente', 'en_cours', 'resolu', 'rejete']
const statutColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  en_cours: 'bg-blue-100 text-blue-800',
  resolu: 'bg-green-100 text-green-800',
  rejete: 'bg-red-100 text-red-800',
}
const prioriteColors: Record<string, string> = {
  basse: 'bg-gray-100 text-gray-700',
  normale: 'bg-blue-100 text-blue-700',
  haute: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
}

// Added typings to prevent tsc errors
interface Signalement {
  id: string;
  titre: string;
  description: string;
  statut: string;
  priorite: string;
  photo_url?: string;
  created_at: string;
  parties_communes?: { nom: string };
  residents?: {
    full_name: string;
    apartment_number: string;
    building_name: string;
  };
}

export default function AdminSignalements() {
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [filter, setFilter] = useState('tous')
  const [selected, setSelected] = useState<Signalement | null>(null)
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase
      .from('signalements')
      .select('*, parties_communes(nom), residents(full_name, apartment_number, building_name)')
      .order('created_at', { ascending: false })
    if (data) setSignalements(data as any)
  }

  useEffect(() => { load() }, [])

  const updateStatut = async (id: string, statut: string) => {
    const { error } = await supabase
      .from('signalements')
      .update({ statut, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { toast.error('Erreur lors de la mise à jour'); return; }
    toast.success('Statut mis à jour!')
    setSelected(prev => prev?.id === id ? { ...prev, statut } : prev)
    load()
  }

  const deleteSignalement = async (id: string) => {
    if (!confirm('Supprimer ce signalement définitivement ?')) return
    const { error } = await supabase.from('signalements').delete().eq('id', id)
    if (error) { toast.error('Erreur lors de la suppression'); return; }
    toast.success('Signalement supprimé')
    setSelected(null)
    load()
  }

  const filtered = filter === 'tous' ? signalements : signalements.filter(s => s.statut === filter)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tous les signalements</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['tous', ...statutOptions].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f.replace('_', ' ')} {f === 'tous' ? `(${signalements.length})` : `(${signalements.filter(s=>s.statut===f).length})`}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Aucun signalement</div>
          )}
          {filtered.map(s => (
            <div key={s.id}
              onClick={() => setSelected(s)}
              className={`bg-white p-4 rounded-xl border cursor-pointer hover:shadow-sm transition ${
                selected?.id === s.id ? 'border-gray-900 shadow-sm' : 'border-gray-100'
              }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{s.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.residents?.full_name} — Appt {s.residents?.apartment_number}
                  </p>
                  <p className="text-xs text-gray-400">{s.parties_communes?.nom}</p>
                </div>
                <div className="flex flex-col gap-1 items-end ml-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statutColors[s.statut] || 'bg-gray-100'}`}>
                    {s.statut.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioriteColors[s.priorite] || 'bg-gray-100'}`}>
                    {s.priorite}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(s.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 bg-white rounded-xl border border-gray-100 p-5 h-fit sticky top-0 space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-gray-800 text-sm leading-snug flex-1">{selected.titre}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>👤 {selected.residents?.full_name}</p>
              <p>🏠 Appt {selected.residents?.apartment_number} — {selected.residents?.building_name}</p>
              <p>📍 {selected.parties_communes?.nom}</p>
              <p>🗓️ {new Date(selected.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">{selected.description}</p>
            </div>

            {selected.photo_url && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.photo_url} alt="Photo" className="w-full rounded-lg object-cover max-h-40" />
                <a href={selected.photo_url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 text-xs mt-1 inline-block hover:underline">
                  Voir en plein écran →
                </a>
              </div>
            )}

            {/* Change status */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Changer le statut:</p>
              <div className="grid grid-cols-2 gap-2">
                {statutOptions.map(statut => (
                  <button key={statut}
                    onClick={() => updateStatut(selected.id, statut)}
                    className={`text-xs py-1.5 px-2 rounded-lg border transition font-medium ${
                      selected.statut === statut
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}>
                    {statut.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete */}
            <button onClick={() => deleteSignalement(selected.id)}
              className="w-full text-xs py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
              🗑️ Supprimer ce signalement
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
