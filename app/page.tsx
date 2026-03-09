import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckSquare, Users, FolderKanban, BarChart3, Zap, Shield, ArrowRight } from 'lucide-react'

export default function HomePage() {
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
            <Button variant="ghost" asChild>
              <Link href="/auth/login">登录</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">免费开始</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            DevOps 全流程管理平台
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            让团队协作更高效
            <br />
            <span className="text-primary">任务管理更简单</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            TaskFlow Pro 是一款现代化的项目管理工具，帮助团队轻松追踪任务进度、协同工作，提升整体生产力。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                免费开始使用
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">已有账户？登录</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              强大的功能，简洁的体验
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TaskFlow Pro 提供您团队所需的一切工具
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FolderKanban className="w-6 h-6" />}
              title="看板管理"
              description="可视化任务流程，拖拽式操作，轻松管理任务状态和优先级"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="团队协作"
              description="创建团队、邀请成员、分配角色，让协作更加顺畅"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="数据仪表盘"
              description="实时追踪项目进度，可视化数据分析，洞察团队效率"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="实时更新"
              description="任务状态实时同步，评论通知即时推送"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="安全可靠"
              description="企业级数据安全，行级权限控制，保护您的数据"
            />
            <FeatureCard
              icon={<CheckSquare className="w-6 h-6" />}
              title="简洁易用"
              description="清晰的界面设计，零学习成本，快速上手使用"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            准备好提升您的团队效率了吗？
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            立即注册，免费体验 TaskFlow Pro 的全部功能
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              免费开始
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
          <p>&copy; 2024 TaskFlow Pro. 保留所有权利。</p>
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
