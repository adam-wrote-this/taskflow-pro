'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    
    const result = await signUp(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <CheckSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskFlow Pro</span>
          </div>
          <CardTitle className="text-2xl">创建账户</CardTitle>
          <CardDescription>开始使用 TaskFlow Pro 管理您的任务</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">姓名</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="张三"
                required
                autoComplete="name"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">密码至少需要 6 个字符</p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建账户'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            已有账户？{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
