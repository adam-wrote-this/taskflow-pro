// Database types for TaskFlow Pro

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ProjectStatus = 'active' | 'completed' | 'archived'
export type TeamRole = 'owner' | 'admin' | 'member'
export type NotificationType = 'task_assigned' | 'task_updated' | 'comment_added' | 'team_invited' | 'project_created'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  joined_at: string
  // Joined data
  profile?: Profile
  team?: Team
}

export interface Project {
  id: string
  team_id: string
  name: string
  description: string | null
  status: ProjectStatus
  created_by: string
  created_at: string
  updated_at: string
  // Joined data
  team?: Team
  created_by_profile?: Profile
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  created_by: string
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
  // Joined data
  project?: Project
  assignee?: Profile
  created_by_profile?: Profile
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  // Joined data
  user?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  content: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

// Helper types for UI
export interface TaskColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: '待办池', color: 'bg-muted text-muted-foreground' },
  todo: { label: '待处理', color: 'bg-secondary text-secondary-foreground' },
  in_progress: { label: '进行中', color: 'bg-primary/10 text-primary' },
  review: { label: '审核中', color: 'bg-warning/10 text-warning-foreground' },
  done: { label: '已完成', color: 'bg-success/10 text-success' },
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: '低', color: 'bg-muted text-muted-foreground' },
  medium: { label: '中', color: 'bg-secondary text-secondary-foreground' },
  high: { label: '高', color: 'bg-warning/10 text-warning-foreground' },
  urgent: { label: '紧急', color: 'bg-destructive/10 text-destructive' },
}

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: '进行中', color: 'bg-success/10 text-success' },
  completed: { label: '已完成', color: 'bg-primary/10 text-primary' },
  archived: { label: '已归档', color: 'bg-muted text-muted-foreground' },
}

export const TEAM_ROLE_CONFIG: Record<TeamRole, { label: string; description: string }> = {
  owner: { label: '所有者', description: '完全控制权限，可以删除团队' },
  admin: { label: '管理员', description: '可以管理成员和项目' },
  member: { label: '成员', description: '可以查看和编辑任务' },
}
