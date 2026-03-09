import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Users, ArrowRight, Crown, Shield, User } from 'lucide-react'
import type { Team, TeamMember, TeamRole } from '@/lib/types'
import { TEAM_ROLE_CONFIG } from '@/lib/types'

export default async function TeamsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user's team memberships with team details
  const { data: teamMemberships } = await supabase
    .from('team_members')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('user_id', user.id)

  const teams = teamMemberships?.map(m => ({
    ...m.team,
    role: m.role,
    memberCount: 0, // Will be fetched separately
  })) || []

  // Get member counts for each team
  const teamsWithCounts = await Promise.all(
    teams.map(async (team) => {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)
      return { ...team, memberCount: count || 0 }
    })
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">团队</h1>
          <p className="text-muted-foreground">管理您的团队和成员</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teams/new">
            <Plus className="mr-2 h-4 w-4" />
            创建团队
          </Link>
        </Button>
      </div>

      {teamsWithCounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamsWithCounts.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">还没有加入任何团队</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              创建一个团队来开始协作，或者等待被邀请加入现有团队
            </p>
            <Button asChild>
              <Link href="/dashboard/teams/new">
                <Plus className="mr-2 h-4 w-4" />
                创建团队
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TeamCard({ team }: { team: Team & { role: TeamRole; memberCount: number } }) {
  const roleConfig = TEAM_ROLE_CONFIG[team.role]
  
  const RoleIcon = team.role === 'owner' ? Crown : team.role === 'admin' ? Shield : User

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary text-xl font-bold">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RoleIcon className="h-3 w-3" />
                {roleConfig.label}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {team.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{team.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{team.memberCount} 位成员</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/teams/${team.id}`}>
              管理
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
