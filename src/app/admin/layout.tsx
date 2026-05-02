'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return; }
      
      const { data: profile } = await supabase
        .from('residents')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') { 
        router.push('/dashboard'); 
        return; 
      }
      setLoading(false)
    }
    check()
  }, [router, supabase])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400">Vérification des droits...</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white">Batima-Gest</h1>
          <p className="text-xs text-gray-400 mt-1">Panel Administrateur</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
            📊 Tableau de bord
          </a>
          <a href="/admin/signalements" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
            🚨 Tous les signalements
          </a>
          <a href="/admin/residents" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
            👥 Résidents
          </a>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/auth/login')
            }}
            className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 rounded-lg transition text-sm">
            🚪 Se déconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
