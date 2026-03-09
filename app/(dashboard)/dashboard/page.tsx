import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FolderKanban, CheckCircle2, Clock, AlertCircle, Plus, Users, ArrowRight } from 'lucide-react'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/types'
import type { Task, Project, Team } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user's teams
  const { data: teamMemberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)

  const teamIds = teamMemberships?.map(m => m.team_id) || []

  // Get projects from user's teams
  const { data: projects } = teamIds.length > 0 
    ? await supabase
        .from('projects')
        .select('*')
        .in('team_id', teamIds)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(5)
    : { data: [] }

  // Get tasks assigned to user or created by user
  const { data: myTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name)
    `)
    .or(`assignee_id.eq.${user.id},created_by.eq.${user.id}`)
    .neq('status', 'done')
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(10)

  // Calculate stats
  const totalTasks = myTasks?.length || 0
  const inProgressTasks = myTasks?.filter(t => t.status === 'in_progress').length || 0
  const urgentTasks = myTasks?.filter(t => t.priority === 'urgent' || t.priority === 'high').length || 0
  const dueSoonTasks = myTasks?.filter(t => {
    if (!t.due_date) return false
    const dueDate = new Date(t.due_date)
    const now = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }).length || 0

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">欢迎回来</h1>
        <p className="text-muted-foreground">以下是您的任务和项目概览</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="待完成任务"
          value={totalTasks}
          icon={<FolderKanban className="h-4 w-4" />}
          description="所有未完成的任务"
        />
        <StatCard
          title="进行中"
          value={inProgressTasks}
          icon={<Clock className="h-4 w-4" />}
          description="正在处理的任务"
        />
        <StatCard
          title="高优先级"
          value={urgentTasks}
          icon={<AlertCircle className="h-4 w-4" />}
          description="需要优先处理"
          variant="warning"
        />
        <StatCard
          title="即将到期"
          value={dueSoonTasks}
          icon={<CheckCircle2 className="h-4 w-4" />}
          description="3天内到期"
          variant="danger"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>我的任务</CardTitle>
              <CardDescription>分配给您的待完成任务</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/projects">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myTasks && myTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {myTasks.slice(0, 5).map((task: Task & { project: { id: string; name: string } | null }) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CheckCircle2 className="h-8 w-8" />}
                title="暂无任务"
                description="您还没有任何待完成的任务"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>活跃项目</CardTitle>
              <CardDescription>您参与的项目</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/projects">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="flex flex-col gap-3">
                {projects.map((project: Project) => (
                  <ProjectItem key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FolderKanban className="h-8 w-8" />}
                title="暂无项目"
                description="创建或加入一个团队来开始项目"
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/teams/new">
                      <Plus className="mr-2 h-4 w-4" />
                      创建团队
                    </Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      {teamIds.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">开始使用 TaskFlow Pro</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              创建您的第一个团队，邀请成员，开始高效协作
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

function StatCard({ 
  title, 
  value, 
  icon, 
  description,
  variant = 'default'
}: { 
  title: string
  value: number
  icon: React.ReactNode
  description: string
  variant?: 'default' | 'warning' | 'danger'
}) {
  const variantStyles = {
    default: 'text-muted-foreground',
    warning: 'text-warning-foreground',
    danger: 'text-destructive',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={variantStyles[variant]}>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function TaskItem({ task }: { task: Task & { project: { id: string; name: string } | null } }) {
  const statusConfig = TASK_STATUS_CONFIG[task.status]
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority]

  return (
    <Link 
      href={task.project ? `/dashboard/projects/${task.project.id}` : '#'}
      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-medium text-sm truncate">{task.title}</span>
        {task.project && (
          <span className="text-xs text-muted-foreground">{task.project.name}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig.color}`}>
          {priorityConfig.label}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>
    </Link>
  )
}

function ProjectItem({ project }: { project: Project }) {
  return (
    <Link 
      href={`/dashboard/projects/${project.id}`}
      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold">
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{project.name}</span>
          {project.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">{project.description}</span>
          )}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}

function EmptyState({ 
  icon, 
  title, 
  description,
  action 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-muted-foreground mb-3">{icon}</div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  )
}
