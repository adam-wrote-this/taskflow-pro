'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Task, Profile, TaskStatus, TaskPriority } from '@/lib/types'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2, Calendar, User } from 'lucide-react'

interface TaskDetailDialogProps {
  task: Task & {
    assignee?: Profile | null
    created_by_profile?: Profile | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: Profile[]
}

export function TaskDetailDialog({ task, open, onOpenChange, teamMembers }: TaskDetailDialogProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [assigneeId, setAssigneeId] = useState<string | null>(task.assignee_id)
  const [dueDate, setDueDate] = useState<string>(
    task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
  )

  async function handleSave() {
    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('tasks')
      .update({
        title,
        description: description || null,
        status,
        priority,
        assignee_id: assigneeId,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      })
      .eq('id', task.id)

    if (!error) {
      router.refresh()
      onOpenChange(false)
    }

    setIsSaving(false)
  }

  async function handleDelete() {
    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)

    if (!error) {
      router.refresh()
      onOpenChange(false)
    }

    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">任务标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="任务标题"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="添加任务描述..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label>状态</Label>
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
                <Label className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  负责人
                </Label>
                <Select 
                  value={assigneeId || 'unassigned'} 
                  onValueChange={(v) => setAssigneeId(v === 'unassigned' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择负责人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">未分配</SelectItem>
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
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  截止日期
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Meta info */}
            <div className="pt-4 border-t border-border text-xs text-muted-foreground">
              <p>创建者：{task.created_by_profile?.full_name || '未知'}</p>
              <p>创建时间：{new Date(task.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存更改'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除任务</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除任务「{task.title}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
