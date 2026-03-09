'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Profile } from '@/lib/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  teamMembers: Profile[]
  projectId: string
}

export function KanbanColumn({ id, title, tasks, teamMembers, projectId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div className="flex flex-col w-72 min-w-72 shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-32 p-2 rounded-lg transition-colors',
          isOver ? 'bg-accent/50' : 'bg-muted/30'
        )}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            拖拽任务到此处
          </div>
        )}
      </div>
    </div>
  )
}
