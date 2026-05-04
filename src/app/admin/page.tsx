'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, en_attente: 0, en_cours: 0, resolu: 0, urgente: 0 })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('signalements').select('statut, priorite').then(({ data }) => {
      if (data) setStats({
        total: data.length,
        en_attente: data.filter(s => s.statut === 'en_attente').length,
        en_cours: data.filter(s => s.statut === 'en_cours').length,
        resolu: data.filter(s => s.statut === 'resolu').length,
        urgente: data.filter(s => s.priorite === 'urgente').length,
      })
    })
  }, [supabase])

  const cards = [
    { label: 'Total signalements', value: stats.total, color: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-800 dark:text-white' },
    { label: 'En attente', value: stats.en_attente, color: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    { label: 'En cours', value: stats.en_cours, color: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Résolus', value: stats.resolu, color: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    { label: 'Urgents', value: stats.urgente, color: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tableau de bord Admin</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Vue globale de tous les signalements</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4 border border-gray-100 dark:border-gray-700`}>
            <p className={`text-3xl font-bold ${c.text}`}>{c.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
      <a href="/admin/signalements" 
        className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition">
        Voir tous les signalements →
      </a>
    </div>
  )
}
