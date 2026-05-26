'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Users, LogOut, HardHat } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const NAV = [
  { href: '/obras', label: 'Obras', icon: Building2 },
  { href: '/funcionarios', label: 'Funcionários', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { usuario, clearAuth } = useAuthStore()

  function handleLogout() {
    document.cookie = 'bm_token=; path=/; max-age=0'
    clearAuth()
    router.push('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col border-r border-slate-800">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <HardHat size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight block">Brain Master</span>
            <span className="text-slate-500 text-xs">Gestão de Obras</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={17} className={active ? 'text-blue-100' : 'text-slate-500'} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
            <span className="text-slate-300 text-xs font-semibold">
              {usuario?.nome?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>
          <p className="text-slate-300 text-xs truncate">{usuario?.nome ?? '—'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 text-xs font-medium transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )
}
