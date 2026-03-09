'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, UserPlus } from 'lucide-react'
import type { TeamRole } from '@/lib/types'

interface InviteMemberDialogProps {
  teamId: string
}

export function InviteMemberDialog({ teamId }: InviteMemberDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('member')

  async function handleInvite() {
    if (!email.trim()) {
      setError('请输入邮箱地址')
      return
    }

    setIsPending(true)
    setError(null)

    const supabase = createClient()

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (profileError || !profile) {
      setError('未找到该邮箱对应的用户，请确认用户已注册')
      setIsPending(false)
      return
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', profile.id)
      .single()

    if (existingMember) {
      setError('该用户已经是团队成员')
      setIsPending(false)
      return
    }

    // Add as member
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: profile.id,
        role,
      })

    if (insertError) {
      setError(insertError.message)
      setIsPending(false)
      return
    }

    // Success
    setOpen(false)
    setEmail('')
    setRole('member')
    router.refresh()
    setIsPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          邀请
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            邀请成员
          </DialogTitle>
          <DialogDescription>
            通过邮箱地址邀请新成员加入团队
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label>角色</Label>
            <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex flex-col">
                    <span>成员</span>
                    <span className="text-xs text-muted-foreground">可以查看和编辑任务</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span>管理员</span>
                    <span className="text-xs text-muted-foreground">可以管理成员和项目</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            取消
          </Button>
          <Button onClick={handleInvite} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                邀请中...
              </>
            ) : (
              '发送邀请'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
