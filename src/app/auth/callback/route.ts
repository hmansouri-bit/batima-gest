import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const metadata = user.user_metadata ?? {}

      const { data: existingProfile } = await supabase
        .from('residents')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        await supabase.from('residents').insert({
          id: user.id,
          full_name: metadata.full_name ?? user.email ?? 'Nouveau résident',
          apartment_number: metadata.apartment_number ?? 'N/A',
          building_name: metadata.building_name ?? 'N/A',
          phone: metadata.phone ?? null,
        })
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
