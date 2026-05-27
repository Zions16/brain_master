'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, HardHat, User } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { AuthResponse } from '@brain-master/shared/tipos'

type TipoPerfil = 'GESTOR' | 'ENGENHEIRO' | 'FUNCIONARIO'

const PERFIS: { tipo: TipoPerfil; label: string; desc: string; prefixo: string; icon: React.ElementType; cor: string; iconCor: string }[] = [
  {
    tipo: 'GESTOR',
    label: 'Gestor',
    desc: 'Acesso completo — obras, equipe e financeiro',
    prefixo: '',
    icon: Building2,
    cor: 'border-indigo-400 bg-indigo-50 hover:bg-indigo-100',
    iconCor: 'text-indigo-600',
  },
  {
    tipo: 'ENGENHEIRO',
    label: 'Engenheiro',
    desc: 'Obras e medições — acesso por token',
    prefixo: 'ENG-',
    icon: HardHat,
    cor: 'border-blue-400 bg-blue-50 hover:bg-blue-100',
    iconCor: 'text-blue-600',
  },
  {
    tipo: 'FUNCIONARIO',
    label: 'Funcionário',
    desc: 'Minha produção — acesso por token',
    prefixo: 'FUN-',
    icon: User,
    cor: 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100',
    iconCor: 'text-emerald-600',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [perfil, setPerfil] = useState<TipoPerfil | null>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [token, setToken] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function voltar() {
    setPerfil(null)
    setErro('')
    setToken('')
    setEmail('')
    setSenha('')
  }

  async function handleLoginEmail(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/api/v1/auth/login', { email, senha })
      document.cookie = `bm_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`
      setAuth(data.usuario)
      const destino = data.usuario.perfil === 'ENGENHEIRO' ? '/engenheiro' : '/dashboard'
      router.push(destino)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Credenciais inválidas'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleLoginToken(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/api/v1/auth/token-login', { token: token.toUpperCase() })
      document.cookie = `bm_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`
      setAuth(data.usuario)
      const destino = data.usuario.perfil === 'ENGENHEIRO' ? '/engenheiro' : '/minha-producao'
      router.push(destino)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Token inválido'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Brain Master</h1>
        <p className="text-slate-500 text-sm mb-6">Gestão de obras</p>

        {!perfil && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Como você vai entrar?</p>
            <div className="space-y-3">
              {PERFIS.map(({ tipo, label, desc, icon: Icon, cor, iconCor }) => (
                <button
                  key={tipo}
                  onClick={() => setPerfil(tipo)}
                  className={`w-full flex items-center gap-3 border-2 rounded-xl p-4 text-left transition-all ${cor}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon size={18} className={iconCor} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(perfil === 'FUNCIONARIO' || perfil === 'ENGENHEIRO') && (
          <form onSubmit={handleLoginToken} className="space-y-4">
            <button type="button" onClick={voltar}
              className="text-xs text-slate-400 hover:text-slate-700 mb-1 flex items-center gap-1 transition-colors">
              ← Voltar
            </button>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Token de acesso</label>
              <input
                type="text"
                placeholder={perfil === 'ENGENHEIRO' ? 'ENG-XXXXX' : 'FUN-XXXXX'}
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                maxLength={9}
                autoFocus
                required
                className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 uppercase ${
                  perfil === 'ENGENHEIRO' ? 'focus:ring-blue-500' : 'focus:ring-emerald-500'
                }`}
              />
              <p className="text-xs text-slate-400 mt-1.5">Solicite seu token ao responsável</p>
            </div>

            {erro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading || token.replace(/-/g, '').length < 8}
              className={`w-full disabled:opacity-60 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors ${
                perfil === 'ENGENHEIRO'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? 'Verificando...' : 'Entrar com token'}
            </button>
          </form>
        )}

        {perfil === 'GESTOR' && (
          <form onSubmit={handleLoginEmail} className="space-y-4">
            <button type="button" onClick={voltar}
              className="text-xs text-slate-400 hover:text-slate-700 mb-1 flex items-center gap-1 transition-colors">
              ← Voltar
            </button>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {erro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
