'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { redirect } from 'next/navigation'
import { Home, Calendar, GraduationCap, Trophy, Bot, Bell, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-DEFAULT">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    redirect('/login')
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Calendar, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: GraduationCap, label: 'Grades', href: '/dashboard/grades' },
    { icon: Trophy, label: 'Achievements', href: '/dashboard/achievements' },
    { icon: Bot, label: 'AI Buddy', href: '/dashboard/ai-buddy' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background-DEFAULT">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold gradient-text cursor-pointer">
                Student Companion
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                      isActive(item.href)
                        ? 'bg-neon-purple text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full" />
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 glass-card p-4 z-50">
                      <div className="mb-4 pb-4 border-b border-white/10">
                        <p className="font-semibold">{user.email}</p>
                        <p className="text-sm text-text-secondary">Student</p>
                      </div>
                      <div className="space-y-2">
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 p-2 hover:bg-status-danger/20 text-status-danger rounded-lg transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 z-40 safe-area-inset">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px]',
                  active
                    ? 'text-neon-purple'
                    : 'text-text-secondary'
                )}
              >
                <Icon className={cn('w-6 h-6', active && 'scale-110')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
