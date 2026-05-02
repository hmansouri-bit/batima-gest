import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PlusCircle, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch profile
  const { data: profile } = await supabase
    .from('residents')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch signalements stats
  const { data: signalements } = await supabase
    .from('signalements')
    .select('id, statut, priorite, titre, created_at, espace:espaces(nom)') // Assuming relation name is espaces or just manually fetch
    .eq('resident_id', user.id)
    .order('created_at', { ascending: false });

  // Fallback if the relation name is different, let's fetch without join and then join manually for simplicity
  const { data: rawSignalements } = await supabase
    .from('signalements')
    .select('*, parties_communes(nom)')
    .eq('resident_id', user.id)
    .order('created_at', { ascending: false });

  const myReports = rawSignalements || [];
  
  const stats = {
    total: myReports.length,
    en_attente: myReports.filter(s => s.statut === 'en_attente').length,
    en_cours: myReports.filter(s => s.statut === 'en_cours').length,
    resolu: myReports.filter(s => s.statut === 'resolu').length,
  };

  const recentReports = myReports.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {profile?.full_name?.split(' ')[0] || 'Résident'} 👋
        </h1>
        <p className="mt-1 text-slate-500">
          Apt {profile?.apartment_number} • {profile?.building_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total signalements</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">En attente</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats.en_attente}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">En cours</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats.en_cours}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Résolus</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats.resolu}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Derniers signalements</CardTitle>
          <Link href="/dashboard/signaler">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Signaler un problème
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentReports.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {recentReports.map((report) => (
                <li key={report.id}>
                  <Link href={`/dashboard/signalement/${report.id}`} className="block hover:bg-slate-50 transition-colors">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                          <div>
                            <p className="text-sm font-medium text-primary-600 truncate">{report.titre}</p>
                            <p className="mt-2 flex items-center text-sm text-slate-500">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                              <span className="truncate">{report.parties_communes?.nom || 'Espace inconnu'}</span>
                            </p>
                          </div>
                          <div className="hidden md:block">
                            <div>
                              <p className="text-sm text-slate-900">
                                Date : {new Date(report.created_at).toLocaleDateString('fr-FR')}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge type="statut" value={report.statut} />
                                <Badge type="priorite" value={report.priorite} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12 px-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun signalement</h3>
              <p className="mt-1 text-sm text-slate-500">Vous n&apos;avez encore signalé aucun problème.</p>
              <div className="mt-6">
                <Link href="/dashboard/signaler">
                  <Button className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Créer un signalement
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
        {myReports.length > 5 && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 rounded-b-xl text-center">
            <Link href="/dashboard/signalements" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Voir tous mes signalements
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
