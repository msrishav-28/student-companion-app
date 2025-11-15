import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get user data
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if student profile exists
      const { data: existingProfile } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // Create profile if doesn't exist
      if (!existingProfile) {
        await supabase.from('students').insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata.name || 'Student',
          department: user.user_metadata.department || '',
          year: user.user_metadata.year || 1,
          semester: user.user_metadata.semester || 1,
          degree: 'Bachelor',
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
