'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    apartmentNumber: '',
    buildingName: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast.error(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Insert into residents table
        const { error: profileError } = await supabase
          .from('residents')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.fullName,
              apartment_number: formData.apartmentNumber,
              building_name: formData.buildingName,
              phone: formData.phone || null,
            }
          ]);

        if (profileError) {
          toast.error('Erreur lors de la création du profil résident.');
          console.error(profileError);
        } else {
          toast.success('Compte créé avec succès !');
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err) {
      toast.error('Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Building className="h-7 w-7" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Créer votre compte résident
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou{' '}
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            se connecter
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Nom complet"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ex: Jean Dupont"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Téléphone (optionnel)"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Mot de passe"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <Input
                label="Confirmer mot de passe"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nom de la résidence"
                name="buildingName"
                required
                value={formData.buildingName}
                onChange={handleChange}
                placeholder="Ex: Résidence Les Mimosas"
              />
              <Input
                label="Numéro d'appartement"
                name="apartmentNumber"
                required
                value={formData.apartmentNumber}
                onChange={handleChange}
                placeholder="Ex: A12"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={loading}>
                S&apos;inscrire
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
