'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, Users } from 'lucide-react'
import Link from 'next/link'

function formatDbSetupError(error: { message: string; code?: string | null }) {
  const isSchemaCacheMissingTable =
    error.code === 'PGRST205' ||
    /schema cache/i.test(error.message) ||
    /Could not find the table 'public\./i.test(error.message)

  if (isSchemaCacheMissingTable) {
    return '数据库未初始化（缺少 teams/team_members 表）。请在 Supabase SQL Editor 按顺序执行 scripts/001 到 scripts/008 后重试。'
  }

  return error.message
}

export default function NewTeamPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('请先登录')
      setIsPending(false)
      return
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        description: description || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (teamError) {
      setError(formatDbSetupError(teamError))
      setIsPending(false)
      return
    }

    // Add creator as owner member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      setError(formatDbSetupError(memberError))
      setIsPending(false)
      return
    }

    router.push(`/dashboard/teams/${team.id}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/teams">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">创建团队</h1>
          <p className="text-muted-foreground">创建一个新团队来开始协作</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>团队信息</CardTitle>
              <CardDescription>填写基本信息来创建您的团队</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">团队名称 *</Label>
              <Input
                id="name"
                name="name"
                placeholder="例如：产品研发团队"
                required
                maxLength={50}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">团队描述</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="描述一下这个团队的目标和职责..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">可选，最多 500 个字符</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/teams">取消</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  '创建团队'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
