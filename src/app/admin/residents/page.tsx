'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminResidents() {
  const [residents, setResidents] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.from('residents')
      .select('*, signalements(count)')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setResidents(data) })
  }, [supabase])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Résidents</h1>
      <p className="text-gray-500 mb-6">{residents.length} résidents enregistrés</p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Nom</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Appartement</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Résidence</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Téléphone</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {residents.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">{r.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{r.apartment_number}</td>
                <td className="px-4 py-3 text-gray-600">{r.building_name}</td>
                <td className="px-4 py-3 text-gray-500">{r.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {residents.length === 0 && (
          <div className="text-center py-12 text-gray-400">Aucun résident enregistré</div>
        )}
      </div>
    </div>
  )
}
