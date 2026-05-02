'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import toast from 'react-hot-toast';

export default function SignalerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const espaceIdParam = searchParams.get('espace_id');
  const supabase = createClient();

  const [espaces, setEspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    espace_id: espaceIdParam || '',
    titre: '',
    description: '',
    priorite: 'normale',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchEspaces = async () => {
      const { data } = await supabase.from('parties_communes').select('id, nom, type').order('nom');
      if (data) setEspaces(data);
      setFetching(false);
    };
    fetchEspaces();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.espace_id) {
      toast.error('Veuillez sélectionner une partie commune.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let photo_url = null;

      // Upload photo if exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('signalement-photos')
          .upload(fileName, file);

        if (uploadError) {
          toast.error("Erreur lors de l'envoi de la photo.");
          console.error(uploadError);
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('signalement-photos')
          .getPublicUrl(fileName);
          
        photo_url = urlData.publicUrl;
      }

      // Insert signalement
      const { error: insertError } = await supabase
        .from('signalements')
        .insert([{
          resident_id: user.id,
          espace_id: formData.espace_id,
          titre: formData.titre,
          description: formData.description,
          priorite: formData.priorite,
          photo_url: photo_url,
          statut: 'en_attente'
        }]);

      if (insertError) throw insertError;

      toast.success('Votre signalement a été envoyé avec succès !');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur s'est produite lors de la soumission.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div><div className="h-2 bg-slate-200 rounded"></div></div></div></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Signaler un problème</h1>
        <p className="mt-1 text-sm text-slate-500">
          Remplissez ce formulaire pour informer le syndic d&apos;une panne ou d&apos;un incident.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Informations générales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="espace_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Partie commune concernée <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="espace_id"
                    name="espace_id"
                    required
                    value={formData.espace_id}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionnez un espace...</option>
                    {espaces.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nom} ({e.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Input
                    label="Titre du problème"
                    name="titre"
                    required
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder="Ex: Ascenseur bloqué au 3ème étage"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="priorite" className="block text-sm font-medium text-slate-700 mb-1">
                    Niveau de priorité
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    {['basse', 'normale', 'haute', 'urgente'].map((p) => (
                      <label 
                        key={p} 
                        className={`
                          flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer transition-colors text-sm font-medium capitalize
                          ${formData.priorite === p 
                            ? p === 'urgente' ? 'bg-red-50 border-red-500 text-red-700'
                            : p === 'haute' ? 'bg-orange-50 border-orange-500 text-orange-700'
                            : p === 'normale' ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-slate-100 border-slate-500 text-slate-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="priorite"
                          value={p}
                          checked={formData.priorite === p}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description détaillée <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez le problème avec le plus de détails possible..."
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Photo du problème</h3>
              <FileUpload onFileSelect={(f) => setFile(f)} />
            </div>

            <div className="pt-6 flex items-center justify-end border-t border-slate-100 gap-3">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" isLoading={loading}>
                Envoyer le signalement
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
