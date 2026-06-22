'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { Ruler, Banknote, Wrench, ChevronRight, MapPin, User, Calendar, LayoutDashboard, HardHat, Plus, X, Trash2, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Obra, StatusObra } from '@brain-master/shared/tipos'

const STATUS_LABEL: Record<StatusObra, string> = {
  ativa: 'Ativa',
  pausada: 'Pausada',
  encerrada: 'Encerrada',
}

const STATUS_CLASS: Record<StatusObra, string> = {
  ativa: 'bg-green-100 text-green-700',
  pausada: 'bg-yellow-100 text-yellow-700',
  encerrada: 'bg-slate-100 text-slate-500',
}

interface MembroObra {
  id: string
  nome: string
  perfil: string
  token_acesso: string | null
}

interface Engenheiro {
  id: string
  nome: string
  token_acesso: string | null
}

async function fetchObra(id: string): Promise<Obra> {
  const { data } = await api.get(`/api/v1/obras/${id}`)
  return data
}

async function fetchMembros(obraId: string): Promise<MembroObra[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/membros`)
  return data
}

async function fetchEngenheiros(): Promise<Engenheiro[]> {
  const { data } = await api.get('/api/v1/engenheiros')
  return data
}

async function adicionarMembro(obraId: string, usuarioId: string): Promise<void> {
  await api.post(`/api/v1/obras/${obraId}/membros`, { usuario_id: usuarioId })
}

async function removerMembro(obraId: string, usuarioId: string): Promise<void> {
  await api.delete(`/api/v1/obras/${obraId}/membros/${usuarioId}`)
}

const SECTIONS = [
  {
    href: (id: string) => `/obras/${id}/dashboard`,
    label: 'Dashboard',
    description: 'Produção, gastos e comparativo de funcionários',
    icon: LayoutDashboard,
    color: 'bg-indigo-50 text-indigo-600',
    border: 'hover:border-indigo-300',
  },
  {
    href: (id: string) => `/obras/${id}/servicos`,
    label: 'Serviços',
    description: 'Gerenciar serviços e valores por unidade',
    icon: Wrench,
    color: 'bg-violet-50 text-violet-600',
    border: 'hover:border-violet-300',
  },
  {
    href: (id: string) => `/obras/${id}/medicoes`,
    label: 'Medições',
    description: 'Ver registros de produção desta obra',
    icon: Ruler,
    color: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-300',
  },
  {
    href: (id: string) => `/obras/${id}/pagamentos`,
    label: 'Pagamentos',
    description: 'Calcular e registrar pagamentos por produção',
    icon: Banknote,
    color: 'bg-green-50 text-green-600',
    border: 'hover:border-green-300',
  },
  {
    href: (id: string) => `/obras/${id}/funcionarios`,
    label: 'Funcionários',
    description: 'Produção e valor a receber por funcionário',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-300',
  },
]

export default function ObraDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const perfil = useAuthStore((s) => s.usuario?.perfil)
  const isGestor = perfil === 'GESTOR'

  const [formEquipeAberto, setFormEquipeAberto] = useState(false)
  const [engenheiroSelecionado, setEngenheiroSelecionado] = useState('')
  const [erroEquipe, setErroEquipe] = useState('')

  const { data: obra, isLoading, isError } = useQuery({
    queryKey: ['obra', id],
    queryFn: () => fetchObra(id),
  })

  const { data: membros, isLoading: carregandoMembros } = useQuery({
    queryKey: ['obra-membros', id],
    queryFn: () => fetchMembros(id),
    enabled: isGestor,
  })

  const { data: todosEngenheiros } = useQuery({
    queryKey: ['engenheiros'],
    queryFn: fetchEngenheiros,
    enabled: isGestor && formEquipeAberto,
  })

  // Engenheiros que ainda não estão vinculados a esta obra
  const membroIds = new Set((membros ?? []).map((m) => m.id))
  const engenheirosdisponiveis = (todosEngenheiros ?? []).filter((e) => !membroIds.has(e.id))

  const { mutate: adicionar, isPending: adicionando } = useMutation({
    mutationFn: () => adicionarMembro(id, engenheiroSelecionado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['obra-membros', id] })
      setEngenheiroSelecionado('')
      setFormEquipeAberto(false)
      setErroEquipe('')
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- erro do axios/react-query (boundary externo)
    onError: (err: any) => {
      setErroEquipe(err?.response?.data?.message ?? 'Erro ao vincular engenheiro.')
    },
  })

  const { mutate: remover } = useMutation({
    mutationFn: (usuarioId: string) => removerMembro(id, usuarioId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['obra-membros', id] }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- erro do axios/react-query (boundary externo)
    onError: (err: any) => alert(err?.response?.data?.message ?? 'Erro ao remover engenheiro.'),
  })

  function handleAdicionarSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErroEquipe('')
    if (!engenheiroSelecionado) return setErroEquipe('Selecione um engenheiro.')
    adicionar()
  }

  if (isLoading) return <LoadingSpinner />
  if (isError || !obra) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Obra não encontrada.
    </div>
  )

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">{obra.nome}</span>
      </nav>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{obra.nome}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CLASS[obra.status]}`}>
                {STATUS_LABEL[obra.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {obra.cliente && (
            <div className="flex items-start gap-2">
              <User size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Cliente</p>
                <p className="text-sm font-medium text-slate-800">{obra.cliente}</p>
              </div>
            </div>
          )}
          {obra.endereco && (
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Endereço</p>
                <p className="text-sm font-medium text-slate-800">{obra.endereco}</p>
              </div>
            </div>
          )}
          {obra.data_inicio && (
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Início</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
          {obra.data_prev_fim && (
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Previsão de fim</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(obra.data_prev_fim).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger mb-8">
        {SECTIONS.map(({ href, label, description, icon: Icon, color, border }) => (
          <Link
            key={label}
            href={href(id)}
            className={`group bg-white border border-slate-200 ${border} rounded-xl p-5 hover:shadow-md transition-all block`}
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <h2 className="font-semibold text-slate-900 mb-1">{label}</h2>
            <p className="text-slate-500 text-sm leading-snug">{description}</p>
            <div className="flex items-center justify-end mt-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={15} />
            </div>
          </Link>
        ))}
      </div>

      {/* Seção Equipe — visível apenas para GESTOR */}
      {isGestor && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <HardHat size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Equipe de engenheiros</h2>
                <p className="text-xs text-slate-400">
                  {carregandoMembros ? '...' : `${membros?.length ?? 0} vinculado${membros?.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            {!formEquipeAberto && (
              <button
                onClick={() => setFormEquipeAberto(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Plus size={14} />
                Vincular engenheiro
              </button>
            )}
          </div>

          {/* Formulário de vínculo */}
          {formEquipeAberto && (
            <form onSubmit={handleAdicionarSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Vincular engenheiro a esta obra</p>
                <button
                  type="button"
                  onClick={() => { setFormEquipeAberto(false); setErroEquipe(''); setEngenheiroSelecionado('') }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={engenheiroSelecionado}
                  onChange={(e) => setEngenheiroSelecionado(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione um engenheiro...</option>
                  {engenheirosdisponiveis.map((eng) => (
                    <option key={eng.id} value={eng.id}>{eng.nome}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={adicionando || !engenheiroSelecionado}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {adicionando ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
              {engenheirosdisponiveis.length === 0 && todosEngenheiros && (
                <p className="text-xs text-slate-400 mt-2">
                  Todos os engenheiros já estão vinculados a esta obra.
                </p>
              )}
              {erroEquipe && (
                <p className="text-xs text-red-600 mt-2">{erroEquipe}</p>
              )}
            </form>
          )}

          {/* Lista de membros */}
          {carregandoMembros && <LoadingSpinner />}

          {!carregandoMembros && membros?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HardHat size={24} className="text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">Nenhum engenheiro vinculado.</p>
              <p className="text-xs text-slate-400 mt-1">
                Clique em "Vincular engenheiro" para dar acesso a esta obra.
              </p>
            </div>
          )}

          {membros && membros.length > 0 && (
            <div className="divide-y divide-slate-100">
              {membros.map((membro) => (
                <div key={membro.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-600">
                        {membro.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{membro.nome}</p>
                      {membro.token_acesso && (
                        <p className="text-xs font-mono text-slate-400">{membro.token_acesso}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => remover(membro.id)}
                    title="Remover da obra"
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={11} />
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
