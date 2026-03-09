import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Settings, Plus } from 'lucide-react'
import { KanbanBoard } from '@/components/kanban/board'
import { CreateTaskDialog } from '@/components/kanban/create-task-dialog'
import type { Task, TaskStatus } from '@/lib/types'

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get project with team info
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Check if user is a member of the team
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', project.team_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  const userRole = membership.role
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'

  // Get all tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
      created_by_profile:profiles!tasks_created_by_fkey(id, full_name, email)
    `)
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  // Get team members for assignment
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select(`
      user_id,
      profile:profiles(id, full_name, email, avatar_url)
    `)
    .eq('team_id', project.team_id)

  // Group tasks by status
  const columns: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  }

  tasks?.forEach((task) => {
    if (columns[task.status as TaskStatus]) {
      columns[task.status as TaskStatus].push(task)
    }
  })

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary text-xl font-bold">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.team?.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CreateTaskDialog 
            projectId={projectId} 
            teamMembers={teamMembers?.map(m => m.profile).filter(Boolean) || []}
          />
          {isOwnerOrAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/projects/${projectId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                设置
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <KanbanBoard 
          projectId={projectId}
          initialColumns={columns}
          teamMembers={teamMembers?.map(m => m.profile).filter(Boolean) || []}
        />
      </div>
    </div>
  )
}
