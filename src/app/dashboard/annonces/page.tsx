'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const typeConfig: Record<string, { label: string; color: string; border: string; icon: string }> = {
  info: { label: 'Information', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', border: 'border-l-blue-500', icon: '📢' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', border: 'border-l-red-500', icon: '🚨' },
  travaux: { label: 'Travaux', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', border: 'border-l-orange-500', icon: '🔧' },
  reunion: { label: 'Réunion', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', border: 'border-l-purple-500', icon: '📅' },
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('annonces').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAnnonces(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📢 Annonces</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Toutes les annonces de la direction</p>
      {annonces.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucune annonce pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {annonces.map(a => {
            const config = typeConfig[a.type] || typeConfig.info
            return (
              <div key={a.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-l-4 ${config.border} p-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{a.titre}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{a.contenu}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
