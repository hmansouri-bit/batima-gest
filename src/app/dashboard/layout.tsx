import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';
import { Menu } from 'lucide-react';
// Note: In a real app, we'd add a mobile menu state here, but for brevity we're keeping it simple

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('residents')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar user={user} profile={profile} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4">
          <div className="font-bold text-lg text-slate-900">Batima-Gest</div>
          <button className="text-slate-500 hover:text-slate-900 focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
