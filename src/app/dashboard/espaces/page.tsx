import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Info, ArrowRight } from 'lucide-react';

export default async function EspacesPage() {
  const supabase = createClient();
  
  // Fetch all parties_communes (RLS allows all authenticated users to select)
  const { data: espaces, error } = await supabase
    .from('parties_communes')
    .select('*')
    .order('nom');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parties Communes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Parcourez les espaces partagés de votre résidence pour signaler un problème.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {espaces?.map((espace) => (
          <Card key={espace.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary-50 p-2.5 rounded-lg text-primary-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <Badge type="type_espace" value={espace.type} />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">{espace.nom}</h3>
              
              {espace.etage && (
                <div className="flex items-center text-xs text-slate-500 mb-3 bg-slate-100 w-max px-2 py-1 rounded">
                  Étage : <span className="font-medium ml-1 text-slate-700">{espace.etage}</span>
                </div>
              )}
              
              <p className="text-sm text-slate-600 mb-6 flex-1">
                {espace.description || "Aucune description pour cet espace."}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <Link 
                  href={`/dashboard/signaler?espace_id=${espace.id}`}
                  className="flex items-center justify-center w-full gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 py-2 rounded-md transition-colors"
                >
                  <Info className="h-4 w-4" />
                  Signaler un problème ici
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {(!espaces || espaces.length === 0) && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Aucune partie commune n&apos;a été configurée pour votre résidence.</p>
        </div>
      )}
    </div>
  );
}
