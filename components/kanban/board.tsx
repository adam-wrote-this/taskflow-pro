'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus, Profile } from '@/lib/types'
import { TASK_STATUS_CONFIG } from '@/lib/types'
import { KanbanColumn } from './column'
import { TaskCard } from './task-card'

interface KanbanBoardProps {
  projectId: string
  initialColumns: Record<TaskStatus, Task[]>
  teamMembers: Profile[]
}

export function KanbanBoard({ projectId, initialColumns, teamMembers }: KanbanBoardProps) {
  const router = useRouter()
  const [columns, setColumns] = useState(initialColumns)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function findColumn(taskId: string): TaskStatus | null {
    for (const [status, tasks] of Object.entries(columns)) {
      if (tasks.some(t => t.id === taskId)) {
        return status as TaskStatus
      }
    }
    return null
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const column = findColumn(active.id as string)
    if (column) {
      const task = columns[column].find(t => t.id === active.id)
      if (task) {
        setActiveTask(task)
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumn(activeId)
    let overColumn = findColumn(overId)
    
    // If over is a column id
    if (!overColumn && Object.keys(TASK_STATUS_CONFIG).includes(overId)) {
      overColumn = overId as TaskStatus
    }

    if (!activeColumn || !overColumn || activeColumn === overColumn) return

    setColumns(prev => {
      const activeItems = [...prev[activeColumn]]
      const overItems = [...prev[overColumn]]
      
      const activeIndex = activeItems.findIndex(t => t.id === activeId)
      const [movedTask] = activeItems.splice(activeIndex, 1)
      
      // Find the index to insert at
      const overIndex = overItems.findIndex(t => t.id === overId)
      const insertIndex = overIndex >= 0 ? overIndex : overItems.length

      overItems.splice(insertIndex, 0, { ...movedTask, status: overColumn })

      return {
        ...prev,
        [activeColumn]: activeItems,
        [overColumn]: overItems,
      }
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumn(activeId)
    let overColumn = findColumn(overId)

    // If over is a column id
    if (!overColumn && Object.keys(TASK_STATUS_CONFIG).includes(overId)) {
      overColumn = overId as TaskStatus
    }

    if (!activeColumn || !overColumn) return

    const supabase = createClient()

    if (activeColumn === overColumn) {
      // Reorder within the same column
      const columnTasks = columns[activeColumn]
      const oldIndex = columnTasks.findIndex(t => t.id === activeId)
      const newIndex = columnTasks.findIndex(t => t.id === overId)

      if (oldIndex !== newIndex) {
        const newTasks = arrayMove(columnTasks, oldIndex, newIndex)
        setColumns(prev => ({
          ...prev,
          [activeColumn]: newTasks,
        }))

        // Update positions in database
        const updates = newTasks.map((task, index) => ({
          id: task.id,
          position: index,
        }))

        for (const update of updates) {
          await supabase
            .from('tasks')
            .update({ position: update.position })
            .eq('id', update.id)
        }
      }
    } else {
      // Move to a different column (status already updated in dragOver)
      const task = columns[overColumn].find(t => t.id === activeId)
      if (task) {
        // Update task status and position in database
        await supabase
          .from('tasks')
          .update({ 
            status: overColumn,
            position: columns[overColumn].findIndex(t => t.id === activeId),
          })
          .eq('id', activeId)

        // Update positions for all tasks in both columns
        for (const col of [activeColumn, overColumn]) {
          const colTasks = columns[col]
          for (let i = 0; i < colTasks.length; i++) {
            await supabase
              .from('tasks')
              .update({ position: i })
              .eq('id', colTasks[i].id)
          }
        }
      }
    }

    router.refresh()
  }

  const columnOrder: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done']

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        加载看板中...
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columnOrder.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={TASK_STATUS_CONFIG[status].label}
            tasks={columns[status]}
            teamMembers={teamMembers}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} teamMembers={teamMembers} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
