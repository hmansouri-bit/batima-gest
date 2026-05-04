'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  info: { label: 'Information', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: '📢' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: '🚨' },
  travaux: { label: 'Travaux', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: '🔧' },
  reunion: { label: 'Réunion', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: '📅' },
}

export default function AdminAnnonces() {
  const [annonces, setAnnonces] = useState<any[]>([])
  const [form, setForm] = useState({ titre: '', contenu: '', type: 'info' })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('annonces').select('*').order('created_at', { ascending: false })
    if (data) setAnnonces(data)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('annonces').insert({
      titre: form.titre,
      contenu: form.contenu,
      type: form.type,
      auteur_id: user.id,
    })
    if (error) { toast.error(error.message) } else {
      toast.success('Annonce publiée!')
      setForm({ titre: '', contenu: '', type: 'info' })
      load()
    }
    setLoading(false)
  }

  const deleteAnnonce = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    const { error } = await supabase.from('annonces').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Annonce supprimée')
    load()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Gestion des annonces</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Nouvelle annonce</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input required type="text" value={form.titre}
              onChange={e => setForm({ ...form, titre: e.target.value })}
              placeholder="Ex: Travaux d'ascenseur prévus"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu *</label>
            <textarea required rows={4} value={form.contenu}
              onChange={e => setForm({ ...form, contenu: e.target.value })}
              placeholder="Détails de l'annonce..."
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="info">📢 Information</option>
              <option value="urgent">🚨 Urgent</option>
              <option value="travaux">🔧 Travaux</option>
              <option value="reunion">📅 Réunion</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition">
            {loading ? 'Publication...' : '📤 Publier l\'annonce'}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Annonces publiées ({annonces.length})
      </h2>
      <div className="space-y-4">
        {annonces.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            Aucune annonce publiée
          </div>
        )}
        {annonces.map(a => {
          const config = typeConfig[a.type] || typeConfig.info
          return (
            <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{a.titre}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.contenu}</p>
                </div>
                <button onClick={() => deleteAnnonce(a.id)}
                  className="ml-4 text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
