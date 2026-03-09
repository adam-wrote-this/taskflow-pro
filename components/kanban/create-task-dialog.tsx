'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, TaskStatus, TaskPriority } from '@/lib/types'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'

interface CreateTaskDialogProps {
  projectId: string
  teamMembers: Profile[]
}

export function CreateTaskDialog({ projectId, teamMembers }: CreateTaskDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState('')

  function resetForm() {
    setTitle('')
    setDescription('')
    setStatus('todo')
    setPriority('medium')
    setAssigneeId(null)
    setDueDate('')
    setError(null)
  }

  async function handleCreate() {
    if (!title.trim()) {
      setError('请输入任务标题')
      return
    }

    setIsPending(true)
    setError(null)

    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('请先登录')
      setIsPending(false)
      return
    }

    // Get the max position for the status column
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('position')
      .eq('project_id', projectId)
      .eq('status', status)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = existingTasks && existingTasks.length > 0 
      ? existingTasks[0].position + 1 
      : 0

    const { error: insertError } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assignee_id: assigneeId,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        created_by: user.id,
        position: nextPosition,
      })

    if (insertError) {
      setError(insertError.message)
      setIsPending(false)
      return
    }

    resetForm()
    setOpen(false)
    router.refresh()
    setIsPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o)
      if (!o) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建任务
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>新建任务</DialogTitle>
          <DialogDescription>创建一个新任务并添加到看板中</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-title">任务标题 *</Label>
            <Input
              id="new-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-description">描述</Label>
            <Textarea
              id="new-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加任务描述..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="flex flex-col gap-2">
              <Label>初始状态</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2">
              <Label>优先级</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="flex flex-col gap-2">
              <Label>负责人</Label>
              <Select 
                value={assigneeId || 'unassigned'} 
                onValueChange={(v) => setAssigneeId(v === 'unassigned' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择负责人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">暂不分配</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <Label>截止日期</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                创建中...
              </>
            ) : (
              '创建任务'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
