'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CheckSquare, Users, FolderKanban, BarChart3, Zap, Shield, ArrowRight } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function HomePage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">TaskFlow Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/auth/login">{t('landing.login')}</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">{t('landing.cta')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            DevOps SaaS Platform
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            {t('landing.title')}
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            {t('landing.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                {t('landing.cta')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">{t('landing.login')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('landing.features.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FolderKanban className="w-6 h-6" />}
              title={t('landing.features.kanban.title')}
              description={t('landing.features.kanban.description')}
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title={t('landing.features.team.title')}
              description={t('landing.features.team.description')}
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title={t('landing.features.analytics.title')}
              description={t('landing.features.analytics.description')}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title={t('landing.features.realtime.title')}
              description={t('landing.features.realtime.description')}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title={t('landing.features.security.title')}
              description={t('landing.features.security.description')}
            />
            <FeatureCard
              icon={<CheckSquare className="w-6 h-6" />}
              title={t('landing.features.simple.title')}
              description={t('landing.features.simple.description')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            {t('landing.cta2.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('landing.cta2.subtitle')}
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              {t('landing.cta')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary">
              <CheckSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">TaskFlow Pro</span>
          </div>
          <p>&copy; 2024 TaskFlow Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
