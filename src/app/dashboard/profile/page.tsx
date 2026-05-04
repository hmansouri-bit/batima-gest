'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [resident, setResident] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ full_name: '', phone: '', apartment_number: '', building_name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email || '')
      const { data } = await supabase.from('residents').select('*').eq('id', user.id).single()
      if (data) {
        setResident(data)
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          apartment_number: data.apartment_number || '',
          building_name: data.building_name || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('residents').update(form).eq('id', user.id)
    if (error) { toast.error(error.message) } else { toast.success('Profil mis à jour!') }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatar').upload(path, file, { upsert: true })
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(path)
    const { error: updateError } = await supabase.from('residents').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
    if (updateError) { toast.error(updateError.message) } else {
      setResident((prev: any) => ({ ...prev, avatar_url: urlData.publicUrl }))
      toast.success('Photo de profil mise à jour!')
    }
    setUploading(false)
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>

  const initials = form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Mon profil</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Photo de profil</h2>
        <div className="flex items-center gap-6">
          {resident?.avatar_url ? (
            <img src={resident.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold">{initials}</div>
          )}
          <div>
            <label className="cursor-pointer inline-block bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
              {uploading ? 'Envoi...' : 'Changer la photo'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 5MB</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Informations personnelles</h2>
        <div className="space-y-4">
          {[
            { label: 'Nom complet', key: 'full_name', type: 'text' },
            { label: 'Téléphone', key: 'phone', type: 'tel' },
            { label: "Numéro d'appartement", key: 'apartment_number', type: 'text' },
            { label: 'Nom de la résidence', key: 'building_name', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Statut du loyer</h2>
        {resident?.rent_paid ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4">
            <p className="text-green-700 dark:text-green-400 font-semibold text-lg">✅ Loyer payé</p>
            {resident.rent_paid_at && (
              <p className="text-green-600 dark:text-green-500 text-sm mt-1">Payé le {new Date(resident.rent_paid_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            )}
            {resident.rent_amount > 0 && (
              <p className="text-green-600 dark:text-green-500 text-sm">Montant: {resident.rent_amount} DA</p>
            )}
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400 font-semibold text-lg">⚠️ Loyer en attente de paiement</p>
            {resident?.rent_amount > 0 && (
              <p className="text-red-600 dark:text-red-500 text-sm mt-1">Montant dû: {resident.rent_amount} DA</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Informations du compte</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="text-gray-800 dark:text-gray-200">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Membre depuis</span>
            <span className="text-gray-800 dark:text-gray-200">
              {resident?.created_at ? new Date(resident.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
