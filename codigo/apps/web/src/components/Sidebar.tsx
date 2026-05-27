'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Users, LogOut, HardHat, LayoutDashboard, BarChart2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import type { Perfil } from '@brain-master/shared/tipos'

type NavItem = { href: string; label: string; icon: React.ElementType }

const NAV_BY_PERFIL: Record<Perfil, NavItem[]> = {
  GESTOR: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/obras', label: 'Obras', icon: Building2 },
    { href: '/funcionarios', label: 'Funcionários', icon: Users },
    { href: '/engenheiros', label: 'Engenheiros', icon: HardHat },
  ],
  FINANCEIRO: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/obras', label: 'Obras', icon: Building2 },
  ],
  ENGENHEIRO: [
    { href: '/engenheiro', label: 'Início', icon: HardHat },
    { href: '/obras', label: 'Obras', icon: Building2 },
  ],
  FUNCIONARIO: [
    { href: '/minha-producao', label: 'Minha Produção', icon: BarChart2 },
  ],
  COMPRAS: [
    { href: '/obras', label: 'Obras', icon: Building2 },
  ],
}

const PERFIL_LABEL: Record<Perfil, string> = {
  GESTOR: 'Gestor',
  ENGENHEIRO: 'Engenheiro',
  FUNCIONARIO: 'Funcionário',
  FINANCEIRO: 'Financeiro',
  COMPRAS: 'Compras',
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { usuario, clearAuth } = useAuthStore()

  const perfil = (usuario?.perfil ?? 'GESTOR') as Perfil
  const nav = NAV_BY_PERFIL[perfil] ?? NAV_BY_PERFIL.GESTOR

  function handleLogout() {
    document.cookie = 'bm_token=; path=/; max-age=0'
    clearAuth()
    router.push('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-slate-950 flex flex-col border-r border-slate-800/60">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
            <HardHat size={15} className="text-white" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm tracking-tight block leading-tight">
              Brain Master
            </span>
            <span className="text-slate-500 text-[11px]">{PERFIL_LABEL[perfil]}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }
              `}
            >
              {/* Indicador lateral ativo */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <Icon
                size={16}
                className={active ? 'text-indigo-400' : 'text-slate-500'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <span className="text-slate-300 text-xs font-semibold">
              {usuario?.nome?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>
          <p className="text-slate-400 text-xs truncate flex-1">{usuario?.nome ?? '—'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500
            hover:bg-slate-900 hover:text-slate-200 text-xs font-medium
            transition-all duration-200"
        >
          <LogOut size={13} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
