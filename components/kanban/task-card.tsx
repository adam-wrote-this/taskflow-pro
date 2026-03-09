'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, Profile } from '@/lib/types'
import { TASK_PRIORITY_CONFIG } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar, MessageSquare, GripVertical } from 'lucide-react'
import { TaskDetailDialog } from './task-detail-dialog'

interface TaskCardProps {
  task: Task & {
    assignee?: Profile | null
    created_by_profile?: Profile | null
  }
  teamMembers: Profile[]
  isDragging?: boolean
}

export function TaskCard({ task, teamMembers, isDragging }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority]

  // Format due date
  const formatDueDate = (date: string | null) => {
    if (!date) return null
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: '已过期', isOverdue: true }
    if (diffDays === 0) return { text: '今天', isOverdue: false }
    if (diffDays === 1) return { text: '明天', isOverdue: false }
    if (diffDays <= 7) return { text: `${diffDays}天后`, isOverdue: false }
    return { text: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }), isOverdue: false }
  }

  const dueDateInfo = formatDueDate(task.due_date)

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group bg-card border border-border rounded-lg p-3 shadow-sm cursor-pointer',
          'hover:shadow-md hover:border-primary/30 transition-all',
          (isDragging || isSortableDragging) && 'opacity-50 shadow-lg rotate-2',
        )}
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 p-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
              {task.title}
            </h4>

            {/* Meta info */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority badge */}
              <span className={cn('text-xs px-1.5 py-0.5 rounded', priorityConfig.color)}>
                {priorityConfig.label}
              </span>

              {/* Due date */}
              {dueDateInfo && (
                <span className={cn(
                  'flex items-center gap-1 text-xs',
                  dueDateInfo.isOverdue ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  <Calendar className="h-3 w-3" />
                  {dueDateInfo.text}
                </span>
              )}
            </div>

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                  {task.assignee.full_name?.charAt(0).toUpperCase() || 
                   task.assignee.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {task.assignee.full_name || task.assignee.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskDetailDialog
        task={task}
        open={showDetail}
        onOpenChange={setShowDetail}
        teamMembers={teamMembers}
      />
    </>
  )
}
