'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Shield, Loader2, Check, Globe } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { locales, localeNames, type Locale } from '@/i18n/config'

export default function SettingsPage() {
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  // Profile form state
  const [fullName, setFullName] = useState('')

  // Password form state
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

  function handleLanguageChange(newLocale: Locale) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    router.refresh()
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setPasswordError(locale === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError(locale === 'zh' ? '新密码至少需要 6 个字符' : 'Password must be at least 6 characters')
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
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.account')}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('settings.profile')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('settings.appearance')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('settings.account')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.profile')}</CardTitle>
              <CardDescription>{t('settings.account')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-bold">
                  {fullName?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">{fullName || t('common.noData')}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">{t('settings.fullName')}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('settings.fullName')}
                  maxLength={50}
                />
              </div>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t('settings.email')}</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('settings.saved')}
                    </>
                  ) : (
                    t('settings.saveChanges')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance')}</CardTitle>
              <CardDescription>{t('settings.language')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Language */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.language')}</p>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'zh' ? '选择您偏好的语言' : 'Choose your preferred language'}
                  </p>
                </div>
                <Select value={locale} onValueChange={(value) => handleLanguageChange(value as Locale)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {localeNames[loc]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.account')}</CardTitle>
              <CardDescription>{t('settings.changePassword')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Password */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.changePassword')}</p>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'zh' ? '修改您的登录密码' : 'Change your login password'}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                  {t('settings.changePassword')}
                </Button>
              </div>

              <Separator />

              {/* Account created */}
              <div>
                <p className="font-medium">{t('settings.account')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {locale === 'zh' ? '账户创建于：' : 'Account created: '}
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US') : t('common.noData')}
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
            <AlertDialogTitle>{t('settings.changePassword')}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'zh' ? '请输入新密码。密码修改后需要重新登录。' : 'Please enter your new password. You will need to log in again after changing your password.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {passwordError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={locale === 'zh' ? '至少 6 个字符' : 'At least 6 characters'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={locale === 'zh' ? '再次输入新密码' : 'Re-enter new password'}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingPassword}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? t('common.loading') : t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
