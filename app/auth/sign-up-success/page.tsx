'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, Mail } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function SignUpSuccessPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <CheckSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskFlow Pro</span>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-success" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.signUpSuccess.title')}</CardTitle>
          <CardDescription className="text-base">
            {t('auth.signUpSuccess.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild variant="outline">
            <Link href="/auth/login">{t('auth.signUpSuccess.backToLogin')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
