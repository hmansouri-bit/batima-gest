import Link from 'next/link';
import { Building, ShieldAlert, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg text-white">
                <Building className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Batima-Gest</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Se connecter
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-y-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-slate-50 to-slate-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Gérez votre copropriété en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">toute simplicité</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme extranet dédiée aux résidents. Signalez les pannes dans les parties communes, suivez leur résolution et participez à l&apos;entretien de votre immeuble.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/25">
                Créer un compte
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Tout ce dont vous avez besoin</h2>
            <p className="mt-4 text-lg text-slate-600">Une interface simple et intuitive pour améliorer votre quotidien.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center text-red-600 mb-6">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Signalez en 2 minutes</h3>
              <p className="text-slate-600">Ascenseur en panne ? Ampoule grillée ? Prenez une photo et signalez le problème instantanément à votre syndic.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Suivi en temps réel</h3>
              <p className="text-slate-600">Ne restez plus dans le flou. Consultez l&apos;état d&apos;avancement de vos signalements (en attente, en cours, résolu).</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Parties communes</h3>
              <p className="text-slate-600">Accédez à l&apos;inventaire complet des espaces partagés de votre immeuble (parking, jardin, locaux poubelles).</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Comment ça marche ?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Steps line on desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-slate-700"></div>
            
            {[
              { title: "Créez votre compte", desc: "Renseignez votre appartement et immeuble.", step: 1 },
              { title: "Signalez un problème", desc: "Choisissez la partie commune et ajoutez une photo.", step: 2 },
              { title: "Suivez la résolution", desc: "Le syndic prend le relai et met à jour le statut.", step: 3 }
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-xl font-bold text-primary-400 z-10 shadow-xl">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-slate-400" />
            <span className="font-semibold text-slate-900">Batima-Gest</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Batima-Gest. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
