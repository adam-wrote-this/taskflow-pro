'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Profile, Team } from '@/lib/types'
import {
  CheckSquare,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useState } from 'react'

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
  teams: Team[]
}

const mainNavItems = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: '项目', icon: FolderKanban },
  { href: '/dashboard/teams', label: '团队', icon: Users },
  { href: '/dashboard/settings', label: '设置', icon: Settings },
]

export function DashboardSidebar({ profile, teams }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [teamsOpen, setTeamsOpen] = useState(true)

  return (
    <>
      {/* Mobile overlay */}
      <div className="hidden" />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
              <CheckSquare className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">TaskFlow Pro</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Teams Section */}
            <div className="mt-6">
              <Collapsible open={teamsOpen} onOpenChange={setTeamsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  我的团队
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    teamsOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-1 mt-1">
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <Link
                        key={team.id}
                        href={`/dashboard/teams/${team.id}`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === `/dashboard/teams/${team.id}`
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{team.name}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-xs text-sidebar-foreground/50">
                      还没有加入任何团队
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    asChild
                  >
                    <Link href="/dashboard/teams/new">
                      <Plus className="h-4 w-4" />
                      创建团队
                    </Link>
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
                {profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || '用户'}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
