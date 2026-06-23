'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard, CrosshairIcon, Wrench, Target, Archive,
  FileText, Bell, Search, LogOut, Shield, DollarSign, Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

const nav = [
  { href: '/dashboard',      label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/firearms',       label: 'My Firearms',  icon: CrosshairIcon },
  { href: '/maintenance',    label: 'Maintenance',  icon: Wrench },
  { href: '/range-sessions', label: 'Range Log',    icon: Target },
  { href: '/inventory',      label: 'Inventory',    icon: DollarSign },
  { href: '/documents',      label: 'Documents',    icon: Archive },
  { href: '/reports',        label: 'Reports',      icon: FileText },
  { href: '/reminders',      label: 'Reminders',    icon: Bell },
]

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen bg-surface-card border-r border-surface-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
        <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center border border-brand-500/30">
          <Shield className="w-4 h-4 text-brand-400" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">Holders</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-surface-muted'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-surface-border space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-slate-300 truncate">{userName || 'User'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-surface-muted transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
