import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Settings, Plus } from 'lucide-react'
import { KanbanBoard } from '@/components/kanban/board'
import { CreateTaskDialog } from '@/components/kanban/create-task-dialog'
import type { Profile, Task, TaskStatus } from '@/lib/types'
import { normalizeTaskStatus } from '@/lib/task-logic'

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
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (tasksError) {
    console.error('Failed to load tasks for project:', tasksError)
  }

  const tasks = tasksData || []

  // Get team member ids for assignment list
  const { data: teamMemberRows, error: teamMembersError } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', project.team_id)

  if (teamMembersError) {
    console.error('Failed to load team members for project:', teamMembersError)
  }

  const teamMemberIds = (teamMemberRows || []).map((m) => m.user_id)

  // Fetch related profiles explicitly to avoid relying on implicit relation inference
  const profileIds = Array.from(
    new Set([
      ...teamMemberIds,
      ...tasks.map((t) => t.assignee_id).filter(Boolean),
      ...tasks.map((t) => t.created_by).filter(Boolean),
    ])
  )

  const { data: profiles } = profileIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', profileIds)
    : { data: [] }

  const profileById = new Map((profiles || []).map((p) => [p.id, p]))

  const tasksWithProfiles: Task[] = tasks.map((task) => ({
    ...task,
    assignee: task.assignee_id ? (profileById.get(task.assignee_id) as Profile | undefined) : undefined,
    created_by_profile: (profileById.get(task.created_by) as Profile | undefined),
  }))

  const teamMembers = teamMemberIds
    .map((id) => profileById.get(id))
    .filter(Boolean) as Profile[]

  // Group tasks by status
  const columns: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  }

  tasksWithProfiles.forEach((task) => {
    const normalizedStatus = normalizeTaskStatus(String(task.status))
    if (normalizedStatus) {
      columns[normalizedStatus].push({ ...task, status: normalizedStatus })
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
            teamMembers={teamMembers}
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
          teamMembers={teamMembers}
        />
      </div>
    </div>
  )
}
