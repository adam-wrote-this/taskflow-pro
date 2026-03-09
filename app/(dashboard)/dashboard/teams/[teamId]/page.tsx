import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus, FolderKanban, Users, Crown, Shield, User, Settings } from 'lucide-react'
import type { Profile, TeamRole } from '@/lib/types'
import { TEAM_ROLE_CONFIG } from '@/lib/types'
import { TeamMembersList } from '@/components/teams/members-list'
import { InviteMemberDialog } from '@/components/teams/invite-member-dialog'

interface TeamDetailPageProps {
  params: Promise<{ teamId: string }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get team details
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  if (teamError || !team) {
    notFound()
  }

  // Get current user's role in this team
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound() // User is not a member of this team
  }

  const userRole = membership.role as TeamRole
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'

  // Get team members with profiles
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('team_id', teamId)
    .order('role', { ascending: true })

  // Get team projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('team_id', teamId)
    .order('updated_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary text-2xl font-bold">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
              {team.description && (
                <p className="text-muted-foreground">{team.description}</p>
              )}
            </div>
          </div>
        </div>
        {isOwnerOrAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teams/${teamId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  项目
                </CardTitle>
                <CardDescription>团队的所有项目</CardDescription>
              </div>
              {isOwnerOrAdmin && (
                <Button asChild size="sm">
                  <Link href={`/dashboard/projects/new?teamId=${teamId}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    新建项目
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'active' 
                          ? 'bg-success/10 text-success' 
                          : project.status === 'completed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '已归档'}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FolderKanban className="h-10 w-10 text-muted-foreground mb-3" />
                  <h4 className="font-medium mb-1">暂无项目</h4>
                  <p className="text-sm text-muted-foreground mb-4">创建第一个项目来开始工作</p>
                  {isOwnerOrAdmin && (
                    <Button asChild size="sm">
                      <Link href={`/dashboard/projects/new?teamId=${teamId}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        新建项目
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Members section */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  成员
                </CardTitle>
                <CardDescription>{members?.length || 0} 位成员</CardDescription>
              </div>
              {isOwnerOrAdmin && (
                <InviteMemberDialog teamId={teamId} />
              )}
            </CardHeader>
            <CardContent>
              <TeamMembersList 
                members={members || []} 
                currentUserId={user.id}
                userRole={userRole}
                teamId={teamId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
