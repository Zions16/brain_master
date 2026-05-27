'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { HardHat, Plus, X, Copy, Check, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface Engenheiro {
  id: string
  nome: string
  token_acesso: string | null
  created_at: string
}

async function fetchEngenheiros(): Promise<Engenheiro[]> {
  const { data } = await api.get('/api/v1/engenheiros')
  return data
}

async function criarEngenheiro(nome: string): Promise<Engenheiro> {
  const { data } = await api.post('/api/v1/engenheiros', { nome })
  return data
}

async function regenerarToken(id: string): Promise<Engenheiro> {
  const { data } = await api.post(`/api/v1/engenheiros/${id}/regenerar-token`)
  return data
}

function TokenCopiavel({ token }: { token: string | null }) {
  const [copiado, setCopiado] = useState(false)
  if (!token) return <span className="text-slate-300 text-xs">—</span>

  function copiar() {
    navigator.clipboard.writeText(token!)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <button
      onClick={copiar}
      className="inline-flex items-center gap-1.5 font-mono text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md transition-colors"
    >
      {token}
      {copiado ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} className="text-blue-400" />}
    </button>
  )
}

export default function EngenheirosPage() {
  const qc = useQueryClient()
  const [formAberto, setFormAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [regenerandoId, setRegenerandoId] = useState<string | null>(null)

  const { data: engenheiros, isLoading, isError } = useQuery({
    queryKey: ['engenheiros'],
    queryFn: fetchEngenheiros,
  })

  const { mutate: criar, isPending } = useMutation({
    mutationFn: () => criarEngenheiro(nome.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['engenheiros'] })
      setNome('')
      setFormAberto(false)
      setErroForm('')
    },
    onError: (err: any) => {
      setErroForm(err?.response?.data?.message ?? 'Erro ao cadastrar engenheiro.')
    },
  })

  const { mutate: regenerar } = useMutation({
    mutationFn: (id: string) => regenerarToken(id),
    onMutate: (id) => setRegenerandoId(id),
    onSettled: () => setRegenerandoId(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['engenheiros'] }),
    onError: (err: any) => alert(err?.response?.data?.message ?? 'Erro ao regenerar token.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErroForm('')
    if (!nome.trim()) return setErroForm('Nome é obrigatório.')
    criar()
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Erro ao carregar engenheiros.
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <HardHat size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Engenheiros</h1>
            <p className="text-sm text-slate-400">
              {engenheiros?.length ?? 0} cadastrado{engenheiros?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Novo engenheiro
          </button>
        )}
      </div>

      {/* Explicação sobre tokens */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <p className="font-semibold mb-1">Como funciona o acesso</p>
        <p className="text-blue-600 text-xs leading-relaxed">
          Cada engenheiro recebe um token <span className="font-mono bg-white/60 px-1 rounded">ENG-XXXXX</span>.
          Copie e envie para ele — o engenheiro seleciona "Engenheiro" na tela de login e digita o token.
          Sem email ou senha. Use "Gerar novo token" para revogar o acesso e emitir um novo.
        </p>
      </div>

      {/* Formulário de cadastro */}
      {formAberto && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Cadastrar engenheiro</h2>
            <button
              onClick={() => { setFormAberto(false); setErroForm(''); setNome('') }}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Oliveira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                O token de acesso será gerado automaticamente.
              </p>
            </div>

            {erroForm && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                <p className="text-sm text-red-600">{erroForm}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {isPending ? 'Cadastrando...' : 'Cadastrar engenheiro'}
              </button>
              <button
                type="button"
                onClick={() => { setFormAberto(false); setErroForm(''); setNome('') }}
                className="text-slate-500 hover:text-slate-800 text-sm px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {!engenheiros?.length && !formAberto ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <HardHat size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Nenhum engenheiro cadastrado</p>
          <p className="text-slate-400 text-sm">Clique em "Novo engenheiro" para adicionar o primeiro.</p>
        </div>
      ) : engenheiros && engenheiros.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Token de acesso</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Cadastrado em</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {engenheiros.map((eng) => (
                <tr key={eng.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {eng.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900">{eng.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <TokenCopiavel token={eng.token_acesso} />
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs hidden md:table-cell">
                    {new Date(eng.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => regenerar(eng.id)}
                      disabled={regenerandoId === eng.id}
                      title="Gerar novo token (revoga o anterior)"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <RefreshCw size={11} className={regenerandoId === eng.id ? 'animate-spin' : ''} />
                      Novo token
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
