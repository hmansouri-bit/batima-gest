import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Image as ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function SignalementsList() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: signalements } = await supabase
    .from('signalements')
    .select('*, parties_communes(nom)')
    .eq('resident_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Signalements</h1>
          <p className="mt-1 text-sm text-slate-500">Historique complet de tous vos rapports.</p>
        </div>
        <Link href="/dashboard/signaler">
          <Button>Nouveau signalement</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {signalements?.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow overflow-hidden">
            <Link href={`/dashboard/signalement/${report.id}`}>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-32 md:h-auto bg-slate-100 relative border-r border-slate-100 shrink-0">
                  {report.photo_url ? (
                    <img src={report.photo_url} alt="Photo du signalement" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-xs font-medium">Pas de photo</span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{report.titre}</h3>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{report.parties_communes?.nom}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Badge type="statut" value={report.statut} />
                      <Badge type="priorite" value={report.priorite} />
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                    {report.description}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Créé le {new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
                    <span className="font-medium text-primary-600">Voir les détails →</span>
                  </div>
                </CardContent>
              </div>
            </Link>
          </Card>
        ))}

        {(!signalements || signalements.length === 0) && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Search className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">Aucun signalement trouvé</h3>
            <p className="mt-2 text-slate-500">Vous n&apos;avez pas encore créé de signalement.</p>
            <div className="mt-6">
              <Link href="/dashboard/signaler">
                <Button>Créer mon premier signalement</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
