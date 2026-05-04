'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[LOGIN] Attempting login for:', formData.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('[LOGIN] Auth error:', error.message);
        toast.error('Erreur de connexion : Email ou mot de passe incorrect.');
        setLoading(false);
        return;
      }

      if (data.session) {
        console.log('[LOGIN] Login successful!', {
          userId: data.session.user.id,
          email: data.session.user.email,
          accessToken: data.session.access_token ? 'present' : 'missing',
        });

        toast.success('Connexion réussie !');

        // IMPORTANT: Redirect immediately after successful auth.
        // Profile creation is handled by the dashboard layout if needed.
        // Use window.location.href for a full page reload so middleware runs.
        console.log('[LOGIN] Redirecting to /dashboard...');
        window.location.href = '/dashboard';
        return; // Stop execution — don't run finally/setLoading
      } else {
        console.error('[LOGIN] No session returned despite no error');
        toast.error('Erreur : aucune session créée.');
        setLoading(false);
      }
    } catch (err) {
      console.error('[LOGIN] Unexpected error:', err);
      toast.error('Une erreur inattendue est survenue.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Building className="h-7 w-7" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Connexion à votre espace résident
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-gray-400">
          Ou{' '}
          <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
            créer un compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-gray-300">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
