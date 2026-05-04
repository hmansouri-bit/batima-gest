'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    })
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
      toast.success('Email envoyé!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-gray-400">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-100 dark:border-gray-700">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Un lien de réinitialisation a été envoyé à {email}
              </p>
              <p className="text-sm text-gray-500">Vérifiez votre boîte mail</p>
              <Link href="/auth/login" className="text-blue-600 hover:underline text-sm">
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <div className="text-center">
                <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
                  ← Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
