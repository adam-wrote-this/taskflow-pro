import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's teams
  const { data: teamMemberships } = await supabase
    .from('team_members')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('user_id', user.id)

  const teams = teamMemberships?.map(m => m.team).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar 
        user={user} 
        profile={profile} 
        teams={teams}
      />
      <div className="lg:pl-64">
        <DashboardHeader user={user} profile={profile} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
