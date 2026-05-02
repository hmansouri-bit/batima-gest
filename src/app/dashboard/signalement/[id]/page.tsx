import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, Calendar, MapPin, AlignLeft, Download } from 'lucide-react';

export default async function SignalementDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: report, error } = await supabase
    .from('signalements')
    .select('*, espace:parties_communes(*)')
    .eq('id', params.id)
    .eq('resident_id', user?.id)
    .single();

  if (error || !report) {
    notFound();
  }

  const dateFormatee = new Date(report.created_at).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Retour au tableau de bord
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{report.titre}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              {new Date(report.created_at).toLocaleDateString('fr-FR')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center">
              ID: {report.id.split('-')[0]}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge type="statut" value={report.statut} className="px-3 py-1 text-sm" />
          <Badge type="priorite" value={report.priorite} className="px-3 py-1 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center text-lg">
                <AlignLeft className="h-5 w-5 mr-2 text-slate-400" />
                Description complète
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>
            </CardContent>
          </Card>

          {/* Photo Section */}
          <Card>
            <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg">Photo du problème</CardTitle>
              {report.photo_url && (
                <a href={report.photo_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </a>
              )}
            </CardHeader>
            <CardContent className="p-0 bg-slate-100 overflow-hidden rounded-b-xl flex justify-center">
              {report.photo_url ? (
                <img src={report.photo_url} alt={report.titre} className="max-w-full h-auto max-h-[500px] object-contain" />
              ) : (
                <div className="py-20 text-center text-slate-400">
                  <p>Aucune photo fournie</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-base">Partie Commune</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="bg-primary-50 p-2 rounded-lg text-primary-600 mt-1">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{report.espace?.nom}</h4>
                  <div className="mt-1 flex flex-col gap-1">
                    <Badge type="type_espace" value={report.espace?.type || 'Inconnu'} className="w-max" />
                    {report.espace?.etage && (
                      <span className="text-sm text-slate-500">Étage : {report.espace.etage}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-base">Historique</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l border-slate-200 ml-3 pl-5 py-1">
                <div className="absolute w-3 h-3 bg-primary-600 rounded-full -left-[6.5px] top-1.5 ring-4 ring-white"></div>
                <p className="text-sm font-medium text-slate-900">Signalement créé</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{dateFormatee}</p>
              </div>
              {/* Additional history items could go here if implemented in DB */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
