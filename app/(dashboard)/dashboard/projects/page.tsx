import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FolderKanban, ArrowRight } from 'lucide-react'
import type { Project, Team } from '@/lib/types'
import { PROJECT_STATUS_CONFIG } from '@/lib/types'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user's teams
  const { data: teamMemberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)

  const teamIds = teamMemberships?.map(m => m.team_id) || []

  // Get all projects from user's teams
  const { data: projects } = teamIds.length > 0 
    ? await supabase
        .from('projects')
        .select(`
          *,
          team:teams(id, name)
        `)
        .in('team_id', teamIds)
        .order('updated_at', { ascending: false })
    : { data: [] }

  // Get task counts for each project
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (project) => {
      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
      
      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('status', 'done')

      return { 
        ...project, 
        totalTasks: totalTasks || 0, 
        completedTasks: completedTasks || 0 
      }
    })
  )

  // Check if user can create projects (is owner or admin of any team)
  const { data: adminMemberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])

  const canCreateProject = (adminMemberships?.length || 0) > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">项目</h1>
          <p className="text-muted-foreground">管理您的所有项目</p>
        </div>
        {canCreateProject && (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              新建项目
            </Link>
          </Button>
        )}
      </div>

      {projectsWithCounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithCounts.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : teamIds.length > 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">还没有项目</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              创建您的第一个项目来开始管理任务
            </p>
            {canCreateProject && (
              <Button asChild>
                <Link href="/dashboard/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  新建项目
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">先加入一个团队</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              您需要先创建或加入一个团队才能创建项目
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

function ProjectCard({ project }: { 
  project: Project & { 
    team: { id: string; name: string } | null
    totalTasks: number
    completedTasks: number
  } 
}) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const progress = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary text-xl font-bold">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{project.name}</CardTitle>
              {project.team && (
                <p className="text-xs text-muted-foreground">{project.team.name}</p>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
        )}
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">进度</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {project.completedTasks} / {project.totalTasks} 任务已完成
          </p>
        </div>

        <Button variant="ghost" size="sm" className="w-full justify-center" asChild>
          <Link href={`/dashboard/projects/${project.id}`}>
            查看项目
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
