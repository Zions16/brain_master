'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Building2, CheckCircle2, PauseCircle, XCircle,
  Banknote, Clock, TrendingUp, TrendingDown, Users,
  ArrowRight, LayoutDashboard, AlertCircle, DollarSign,
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { ObraResumo, StatusObra } from '@brain-master/shared/tipos'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function pct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

const STATUS_LABEL: Record<StatusObra, string> = {
  ativa: 'Ativa',
  pausada: 'Pausada',
  encerrada: 'Encerrada',
}

const STATUS_COLOR: Record<StatusObra, string> = {
  ativa: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  pausada: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  encerrada: 'bg-slate-100 text-slate-500',
}

const STATUS_DOT: Record<StatusObra, string> = {
  ativa: 'bg-emerald-500',
  pausada: 'bg-amber-400',
  encerrada: 'bg-slate-300',
}

function ProgressBar({ pct, status }: { pct: number | null; status: StatusObra }) {
  if (pct === null) return null
  const color =
    status === 'ativa' ? 'bg-indigo-500' : status === 'pausada' ? 'bg-amber-400' : 'bg-slate-300'
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-400">Progresso temporal</span>
        <span className="text-xs font-bold text-slate-700">{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchResumo(): Promise<ObraResumo[]> {
  const { data } = await api.get('/api/v1/obras/resumo')
  return data
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DashboardGeralPage() {
  const { data: obras, isLoading } = useQuery({
    queryKey: ['obras-resumo'],
    queryFn: fetchResumo,
    staleTime: 30_000,
  })
  const [filtroStatus, setFiltroStatus] = useState<'todas' | StatusObra>('todas')

  if (isLoading) return <LoadingSpinner />

  const lista = obras ?? []
  const listaFiltrada = filtroStatus === 'todas' ? lista : lista.filter((o) => o.status === filtroStatus)
  const contagem = {
    todas: lista.length,
    ativa: lista.filter((o) => o.status === 'ativa').length,
    pausada: lista.filter((o) => o.status === 'pausada').length,
    encerrada: lista.filter((o) => o.status === 'encerrada').length,
  }
  const obrasAlerta = lista.filter((o) => {
    const orcamentoCritico = o.valor_contrato && o.total_custo_producao / o.valor_contrato > 0.8
    const pagamentoPendente = o.total_pendente > 0
    return orcamentoCritico || pagamentoPendente
  })

  const totalPago = lista.reduce((s, o) => s + o.total_pago, 0)
  const totalPendente = lista.reduce((s, o) => s + o.total_pendente, 0)
  const totalFuncionarios = lista.reduce((s, o) => s + o.total_funcionarios, 0)
  const totalCobranca = lista.reduce((s, o) => s + o.total_cobranca_producao, 0)
  const totalCusto = lista.reduce((s, o) => s + o.total_custo_producao, 0)
  const totalMargem = totalCobranca - totalCusto
  const margemPctGeral = totalCobranca > 0 ? (totalMargem / totalCobranca) * 100 : 0
  const ativas = lista.filter((o) => o.status === 'ativa').length

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Geral</h1>
            <p className="text-slate-400 text-sm mt-0.5">Visão consolidada de todas as obras</p>
          </div>
        </div>
        <Link
          href="/obras"
          className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
        >
          <Building2 size={14} />
          Ver todas as obras
        </Link>
      </div>

      {/* KPIs globais — linha 1: pagamentos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 stagger-children">
        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-slate-400">{ativas} ativas</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-0.5">{lista.length}</p>
          <p className="text-xs font-semibold text-slate-700">Total de obras</p>
          <p className="text-xs text-slate-400 mt-0.5">no portfólio</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Banknote size={18} className="text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">pago</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-0.5">{brl(totalPago)}</p>
          <p className="text-xs font-semibold text-slate-700">Total pago M.O.</p>
          <p className="text-xs text-slate-400 mt-0.5">em todas as obras</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">pendente</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-0.5">{brl(totalPendente)}</p>
          <p className="text-xs font-semibold text-slate-700">Total pendente</p>
          <p className="text-xs text-slate-400 mt-0.5">aguardando pagamento</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-0.5">{totalFuncionarios}</p>
          <p className="text-xs font-semibold text-slate-700">Funcionários ativos</p>
          <p className="text-xs text-slate-400 mt-0.5">com medições registradas</p>
        </div>
      </div>

      {/* KPIs globais — linha 2: lucratividade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign size={18} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-slate-400">cobrança ao cliente</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-0.5">{brl(totalCobranca)}</p>
          <p className="text-xs font-semibold text-slate-700">Receita bruta total</p>
          <p className="text-xs text-slate-400 mt-0.5">todas as medições ativas</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Banknote size={18} className="text-slate-500" />
            </div>
            <span className="text-xs font-medium text-slate-400">custo M.O.</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-0.5">{brl(totalCusto)}</p>
          <p className="text-xs font-semibold text-slate-700">Custo mão de obra total</p>
          <p className="text-xs text-slate-400 mt-0.5">pagamento aos funcionários</p>
        </div>

        <div className={`rounded-xl p-5 card-hover border ${
          totalMargem >= 0
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              totalMargem >= 0 ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {totalMargem >= 0
                ? <TrendingUp size={18} className="text-emerald-600" />
                : <TrendingDown size={18} className="text-red-500" />
              }
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              totalMargem >= 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {pct(margemPctGeral)}
            </span>
          </div>
          <p className={`text-2xl font-bold mb-0.5 ${
            totalMargem >= 0 ? 'text-emerald-700' : 'text-red-600'
          }`}>
            {brl(totalMargem)}
          </p>
          <p className={`text-xs font-semibold ${
            totalMargem >= 0 ? 'text-emerald-800' : 'text-red-700'
          }`}>
            {totalMargem >= 0 ? 'Margem positiva' : 'Margem negativa'}
          </p>
          <p className={`text-xs mt-0.5 ${
            totalMargem >= 0 ? 'text-emerald-600' : 'text-red-500'
          }`}>receita − custo M.O.</p>
        </div>
      </div>

      {/* Painel de alertas */}
      {obrasAlerta.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-800">
              {obrasAlerta.length} obra{obrasAlerta.length !== 1 ? 's' : ''} com atenção necessária
            </span>
          </div>
          <div className="space-y-2">
            {obrasAlerta.map((o) => {
              const orcamentoPct = o.valor_contrato
                ? Math.round((o.total_custo_producao / o.valor_contrato) * 100)
                : null
              return (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2.5 border border-amber-100"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[o.status]}`}
                    />
                    <span className="text-sm font-medium text-slate-800 truncate">{o.nome}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    {orcamentoPct !== null && orcamentoPct > 80 && (
                      <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                        Orçamento {orcamentoPct}%
                      </span>
                    )}
                    {o.total_pendente > 0 && (
                      <span className="text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                        {brl(o.total_pendente)} pendente
                      </span>
                    )}
                    <Link
                      href={`/obras/${o.id}/dashboard`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                    >
                      Ver <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs de filtro */}
      <div className="flex items-center gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
        {(
          [
            { key: 'todas', label: 'Todas', icon: Building2 },
            { key: 'ativa', label: 'Ativas', icon: CheckCircle2 },
            { key: 'pausada', label: 'Pausadas', icon: PauseCircle },
            { key: 'encerrada', label: 'Encerradas', icon: XCircle },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFiltroStatus(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filtroStatus === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={13} />
            {label}
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                filtroStatus === key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {contagem[key === 'todas' ? 'todas' : key]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards por obra */}
      {listaFiltrada.length === 0 ? (
        lista.length === 0 ? (
          /* Onboarding — plataforma sem obras */
          <div className="max-w-lg mx-auto mt-8 mb-16">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                <Building2 size={22} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Bem-vindo ao Brain Master</h2>
              <p className="text-slate-500 text-sm mb-6">Siga estes passos para começar a usar a plataforma:</p>

              <ol className="space-y-3 mb-8">
                {[
                  { n: 1, label: 'Cadastre a primeira obra', href: '/obras/nova', done: false },
                  { n: 2, label: 'Adicione um engenheiro/supervisor', href: '/engenheiros', done: false },
                  { n: 3, label: 'Cadastre os funcionários da obra', href: '/funcionarios', done: false },
                  { n: 4, label: 'Cadastre os serviços (ex: alvenaria, piso)', href: null, done: false },
                  { n: 5, label: 'Registre a primeira medição', href: null, done: false },
                ].map((step) => (
                  <li key={step.n} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.n}
                    </span>
                    {step.href ? (
                      <Link href={step.href} className="text-sm text-indigo-600 hover:underline font-medium">
                        {step.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-600">{step.label}</span>
                    )}
                  </li>
                ))}
              </ol>

              <Link
                href="/obras/nova"
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Cadastrar primeira obra
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          /* Empty state — filtro sem resultado */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium mb-1">Nenhuma obra nesta categoria</p>
            <p className="text-slate-400 text-sm">Selecione outra aba para ver as obras.</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {listaFiltrada.map((obra) => {
            const margem = obra.total_cobranca_producao - obra.total_custo_producao
            const margemPctObra =
              obra.total_cobranca_producao > 0
                ? (margem / obra.total_cobranca_producao) * 100
                : 0
            const lucrativa = margem >= 0

            return (
              <div
                key={obra.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden card-hover flex flex-col"
              >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Building2 size={16} className="text-indigo-600" />
                      </div>
                      <h2 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                        {obra.nome}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[obra.status]}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[obra.status]}`} />
                      {STATUS_LABEL[obra.status]}
                    </span>
                  </div>
                  {obra.cliente && (
                    <p className="text-xs text-slate-400 ml-11 truncate">{obra.cliente}</p>
                  )}
                  {obra.data_inicio && (
                    <p className="text-xs text-slate-400 ml-11 mt-0.5">
                      {new Date(obra.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                      {obra.data_prev_fim && (
                        <> → {new Date(obra.data_prev_fim + 'T00:00:00').toLocaleDateString('pt-BR')}</>
                      )}
                    </p>
                  )}
                </div>

                {/* KPIs */}
                <div className="px-5 py-4 flex-1 space-y-4">
                  {/* Pagamentos */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Pago</p>
                      <p className="font-bold text-emerald-700 text-sm">{brl(obra.total_pago)}</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Pendente</p>
                      <p className="font-bold text-amber-600 text-sm">{brl(obra.total_pendente)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Medições</p>
                      <p className="font-bold text-slate-900 text-sm">{obra.total_medicoes}</p>
                    </div>
                  </div>

                  {/* Lucratividade */}
                  <div className={`rounded-lg px-3 py-2.5 ${lucrativa ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600">Lucratividade</span>
                      <div className="flex items-center gap-1">
                        {lucrativa
                          ? <TrendingUp size={12} className="text-emerald-600" />
                          : <TrendingDown size={12} className="text-red-500" />
                        }
                        <span className={`text-xs font-bold ${lucrativa ? 'text-emerald-700' : 'text-red-600'}`}>
                          {pct(margemPctObra)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-3">
                        <span className="text-slate-400">Receita: <span className="text-blue-700 font-semibold">{brl(obra.total_cobranca_producao)}</span></span>
                        <span className="text-slate-400">Custo: <span className="text-slate-700 font-semibold">{brl(obra.total_custo_producao)}</span></span>
                      </div>
                    </div>
                    <p className={`text-sm font-bold mt-1 ${lucrativa ? 'text-emerald-700' : 'text-red-600'}`}>
                      {lucrativa ? '+' : ''}{brl(margem)} de margem
                    </p>
                  </div>

                  <ProgressBar pct={obra.progresso_pct} status={obra.status} />
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={12} className="text-slate-400" />
                    {obra.total_funcionarios} funcionário{obra.total_funcionarios !== 1 ? 's' : ''}
                  </div>
                  <Link
                    href={`/obras/${obra.id}/dashboard`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs transition-colors"
                  >
                    Ver dashboard <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
