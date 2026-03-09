'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { User, Shield, Loader2, Check } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  // Profile form state
  const [fullName, setFullName] = useState('')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleSaveProfile() {
    if (!profile) return
    
    setIsSaving(true)
    setSaveSuccess(false)

    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      router.refresh()
    }

    setIsSaving(false)
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('新密码至少需要 6 个字符')
      return
    }

    setIsChangingPassword(true)
    setPasswordError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setPasswordError(error.message)
    } else {
      setShowPasswordDialog(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setIsChangingPassword(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">设置</h1>
        <p className="text-muted-foreground">管理您的账户和偏好设置</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            安全设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>更新您的个人信息</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-bold">
                  {fullName?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">{fullName || '未设置姓名'}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">姓名</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="您的姓名"
                  maxLength={50}
                />
              </div>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">邮箱地址</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">邮箱地址无法修改</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      已保存
                    </>
                  ) : (
                    '保存更改'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>管理您的账户安全</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Password */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">密码</p>
                  <p className="text-sm text-muted-foreground">修改您的登录密码</p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                  修改密码
                </Button>
              </div>

              <Separator />

              {/* Account created */}
              <div>
                <p className="font-medium">账户信息</p>
                <p className="text-sm text-muted-foreground mt-1">
                  账户创建于：{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('zh-CN') : '未知'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>修改密码</AlertDialogTitle>
            <AlertDialogDescription>
              请输入新密码。密码修改后需要重新登录。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {passwordError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少 6 个字符"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingPassword}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? '修改中...' : '确认修改'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
