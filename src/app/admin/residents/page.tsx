'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminResidents() {
  const [residents, setResidents] = useState<any[]>([])
  const [filter, setFilter] = useState('tous')
  const [rentAmounts, setRentAmounts] = useState<Record<string, string>>({})
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase
      .from('residents')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
    if (data) {
      setResidents(data)
      const amounts: Record<string, string> = {}
      data.forEach((r: any) => { amounts[r.id] = String(r.rent_amount || 0) })
      setRentAmounts(amounts)
    }
  }

  useEffect(() => { load() }, [])

  const toggleRent = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('residents').update({
      rent_paid: !currentStatus,
      rent_paid_at: !currentStatus ? new Date().toISOString() : null,
    }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(!currentStatus ? 'Loyer marqué comme payé!' : 'Loyer marqué comme impayé')
    load()
  }

  const saveRentAmount = async (id: string) => {
    const amount = parseFloat(rentAmounts[id] || '0')
    const { error } = await supabase.from('residents').update({ rent_amount: amount }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Montant mis à jour!')
    load()
  }

  const filtered = filter === 'tous' ? residents
    : filter === 'payes' ? residents.filter(r => r.rent_paid)
    : residents.filter(r => !r.rent_paid)

  const paidCount = residents.filter(r => r.rent_paid).length
  const unpaidCount = residents.filter(r => !r.rent_paid).length

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Résidents</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{residents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total résidents</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-100 dark:border-green-800">
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">{paidCount}</p>
          <p className="text-xs text-gray-500 mt-1">Loyers payés</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 border border-red-100 dark:border-red-800">
          <p className="text-3xl font-bold text-red-700 dark:text-red-400">{unpaidCount}</p>
          <p className="text-xs text-gray-500 mt-1">Loyers impayés</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'tous', label: `Tous (${residents.length})` },
          { key: 'payes', label: `Payés (${paidCount})` },
          { key: 'impayes', label: `Impayés (${unpaidCount})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.key ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Résident</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Appartement</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Téléphone</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Statut loyer</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Montant (DA)</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.avatar_url ? (
                      <img src={r.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold">
                        {r.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{r.full_name}</p>
                      <p className="text-xs text-gray-400">{r.building_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.apartment_number}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.phone || '—'}</td>
                <td className="px-4 py-3">
                  {r.rent_paid ? (
                    <div>
                      <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">✅ Payé</span>
                      {r.rent_paid_at && <p className="text-xs text-gray-400 mt-1">{new Date(r.rent_paid_at).toLocaleDateString('fr-FR')}</p>}
                    </div>
                  ) : (
                    <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">❌ Impayé</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={rentAmounts[r.id] || '0'}
                      onChange={e => setRentAmounts(prev => ({ ...prev, [r.id]: e.target.value }))}
                      className="w-24 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs dark:bg-gray-700 dark:text-white"
                    />
                    <button onClick={() => saveRentAmount(r.id)}
                      className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 transition">
                      💾
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRent(r.id, r.rent_paid)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      r.rent_paid
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200'
                    }`}>
                    {r.rent_paid ? '↩️ Marquer impayé' : '✅ Marquer payé'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Aucun résident</div>
        )}
      </div>
    </div>
  )
}
