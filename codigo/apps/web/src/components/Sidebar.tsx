'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

const NAV = [
  { href: '/obras', label: 'Obras' },
  { href: '/funcionarios', label: 'Funcionários' },
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
    <aside className="w-56 min-h-screen bg-slate-900 flex flex-col">
      <div className="p-5 border-b border-slate-700">
        <span className="text-white font-bold text-lg tracking-tight">Brain Master</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-slate-400 text-xs truncate mb-2">{usuario?.nome ?? '—'}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-slate-400 hover:text-white text-xs transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
