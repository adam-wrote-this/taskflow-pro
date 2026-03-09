'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, TeamRole } from '@/lib/types'
import { TEAM_ROLE_CONFIG } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Crown, Shield, User, MoreHorizontal, UserMinus, ShieldCheck } from 'lucide-react'

interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  joined_at: string
  profile: Profile | null
}

interface TeamMembersListProps {
  members: TeamMember[]
  currentUserId: string
  userRole: TeamRole
  teamId: string
}

export function TeamMembersList({ members, currentUserId, userRole, teamId }: TeamMembersListProps) {
  const router = useRouter()
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'

  async function handleRemoveMember() {
    if (!removingMember) return
    
    setIsRemoving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', removingMember.id)

    if (!error) {
      router.refresh()
    }
    
    setIsRemoving(false)
    setRemovingMember(null)
  }

  async function handleUpdateRole(memberId: string, newRole: TeamRole) {
    const supabase = createClient()

    const { error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('id', memberId)

    if (!error) {
      router.refresh()
    }
  }

  const RoleIcon = ({ role }: { role: TeamRole }) => {
    if (role === 'owner') return <Crown className="h-4 w-4 text-yellow-500" />
    if (role === 'admin') return <Shield className="h-4 w-4 text-primary" />
    return <User className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId
          const canManage = isOwnerOrAdmin && !isCurrentUser && member.role !== 'owner'
          const roleConfig = TEAM_ROLE_CONFIG[member.role]

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-sm font-medium">
                  {member.profile?.full_name?.charAt(0).toUpperCase() || 
                   member.profile?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {member.profile?.full_name || '未命名用户'}
                    {isCurrentUser && <span className="text-muted-foreground ml-1">(你)</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{member.profile?.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <RoleIcon role={member.role} />
                  <span className="text-muted-foreground">{roleConfig.label}</span>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role !== 'admin' && (
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          设为管理员
                        </DropdownMenuItem>
                      )}
                      {member.role === 'admin' && (
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'member')}>
                          <User className="mr-2 h-4 w-4" />
                          设为成员
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => setRemovingMember(member)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        移除成员
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除成员</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将 {removingMember?.profile?.full_name || '该用户'} 从团队中移除吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? '移除中...' : '确认移除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
