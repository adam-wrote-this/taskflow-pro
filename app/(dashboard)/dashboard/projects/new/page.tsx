'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowLeft, Loader2, FolderKanban } from 'lucide-react'
import Link from 'next/link'
import type { Team } from '@/lib/types'

export default function NewProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTeamId = searchParams.get('teamId')
  
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>(preselectedTeamId || '')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTeams() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get teams where user is owner or admin
      const { data: memberships } = await supabase
        .from('team_members')
        .select(`
          team:teams(*)
        `)
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin'])

      const userTeams = (memberships || [])
        .flatMap((m) => {
          if (Array.isArray(m.team)) return m.team
          return m.team ? [m.team] : []
        })
        .filter((team): team is Team => Boolean(team))
      setTeams(userTeams)
      
      if (preselectedTeamId && userTeams.some(t => t.id === preselectedTeamId)) {
        setSelectedTeam(preselectedTeamId)
      } else if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0].id)
      }
      
      setIsLoading(false)
    }

    loadTeams()
  }, [preselectedTeamId, router, selectedTeam])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!selectedTeam) {
      setError('请选择一个团队')
      return
    }

    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('请先登录')
      setIsPending(false)
      return
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name,
        description: description || null,
        team_id: selectedTeam,
        created_by: user.id,
        status: 'active',
      })
      .select()
      .single()

    if (projectError) {
      setError(projectError.message)
      setIsPending(false)
      return
    }

    router.push(`/dashboard/projects/${project.id}`)
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">新建项目</h1>
            <p className="text-muted-foreground">在团队中创建新项目</p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">需要先创建团队</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              您需要是团队的所有者或管理员才能创建项目
            </p>
            <Button asChild>
              <Link href="/dashboard/teams/new">创建团队</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">新建项目</h1>
          <p className="text-muted-foreground">在团队中创建新项目</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>项目信息</CardTitle>
              <CardDescription>填写基本信息来创建项目</CardDescription>
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
              <Label htmlFor="team">所属团队 *</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="选择团队" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">项目名称 *</Label>
              <Input
                id="name"
                name="name"
                placeholder="例如：网站重构项目"
                required
                maxLength={100}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">项目描述</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="描述一下这个项目的目标和范围..."
                rows={3}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">可选，最多 1000 个字符</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/projects">取消</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  '创建项目'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
