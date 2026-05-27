'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import {
  ChevronRight, LayoutDashboard, Banknote, Clock,
  Users, TrendingUp, TrendingDown, Award, Search, AlertCircle, Target,
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Obra, Pagamento } from '@brain-master/shared/tipos'
import type { CalculoPagamento } from '@/types/calculo'

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchObra(obraId: string): Promise<Obra> {
  const { data } = await api.get(`/api/v1/obras/${obraId}`)
  return data
}

async function fetchPagamentos(obraId: string): Promise<Pagamento[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos`)
  return data
}

async function fetchCalculo(obraId: string, inicio: string, fim: string): Promise<CalculoPagamento[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos/calcular`, {
    params: { inicio, fim },
  })
  return data
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function mesLabel(s: string) {
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function agruparPorMes(pags: Pagamento[]) {
  const m = new Map<string, { mes: string; pago: number; pendente: number }>()
  for (const p of pags) {
    const key = mesLabel(p.periodo_fim)
    const cur = m.get(key) ?? { mes: key, pago: 0, pendente: 0 }
    if (p.status === 'realizado') cur.pago += p.valor_total
    else cur.pendente += p.valor_total
    m.set(key, cur)
  }
  return Array.from(m.values())
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-slate-900 text-xs">{brl(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DashboardPage({ params }: { params: { id: string } }) {
  const { id } = params
  const perfil = useAuthStore((s) => s.usuario?.perfil)
  const verFinanceiro = perfil === 'GESTOR' || perfil === 'FINANCEIRO'

  const hoje = new Date().toISOString().split('T')[0]
  const trintaDias = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const noventaDias = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

  const [inicio, setInicio] = useState(trintaDias)
  const [fim, setFim] = useState(hoje)
  const [filtroAtivo, setFiltroAtivo] = useState({ inicio: trintaDias, fim: hoje })

  const { data: obra } = useQuery({
    queryKey: ['obra', id],
    queryFn: () => fetchObra(id),
    enabled: verFinanceiro,
  })

  const { data: pagamentos, isLoading: loadingPag } = useQuery({
    queryKey: ['pagamentos', id],
    queryFn: () => fetchPagamentos(id),
    enabled: verFinanceiro,
  })

  const { data: calculo, isLoading: loadingCalc, isFetching } = useQuery({
    queryKey: ['calculo-dash', id, filtroAtivo.inicio, filtroAtivo.fim],
    queryFn: () => fetchCalculo(id, filtroAtivo.inicio, filtroAtivo.fim),
    enabled: verFinanceiro,
  })

  if (verFinanceiro && loadingPag) return <LoadingSpinner />

  // ── Métricas ────────────────────────────────────────────────────────────────

  const allPag = pagamentos ?? []
  const totalPago = allPag.filter((p) => p.status === 'realizado').reduce((s, p) => s + p.valor_total, 0)
  const totalPendente = allPag.filter((p) => p.status === 'pendente').reduce((s, p) => s + p.valor_total, 0)
  const qtdPago = allPag.filter((p) => p.status === 'realizado').length
  const qtdPendente = allPag.filter((p) => p.status === 'pendente').length

  const dadosLinha = agruparPorMes(allPag)

  const orcamento = verFinanceiro && obra?.valor_contrato != null ? (() => {
    const contrato = obra.valor_contrato as number
    const lucroEsperado = obra.lucro_esperado ?? 0
    const orcamentoCustos = Math.max(0, contrato - lucroEsperado)
    const gastoTotal = totalPago + totalPendente
    const saldo = orcamentoCustos - gastoTotal
    const pct = orcamentoCustos > 0 ? Math.min(100, (gastoTotal / orcamentoCustos) * 100) : 0
    return { contrato, lucroEsperado, orcamentoCustos, gastoTotal, saldo, pct, alerta: pct >= 80 }
  })() : null

  const calcOrdenado = [...(calculo ?? [])].sort((a, b) => b.valor_total - a.valor_total)
  const topFuncionario = calcOrdenado[0]
  const totalProducao = calcOrdenado.reduce((s, c) => s + c.valor_total, 0)
  const totalCobranca = calcOrdenado.reduce((s, c) => s + (c.valor_cobranca_total ?? 0), 0)
  const totalMedicoes = calcOrdenado.reduce((s, c) => s + c.total_medicoes, 0)
  const mediaProducao = calcOrdenado.length > 0 ? totalProducao / calcOrdenado.length : 0
  const margem = totalCobranca - totalProducao
  const margemPct = totalCobranca > 0 ? (margem / totalCobranca) * 100 : 0
  const lucrativa = margem >= 0

  // Dados para o gráfico de barras
  const dadosBarras = calcOrdenado.slice(0, 8).map((c, i) => ({
    nome: c.funcionario_nome.split(' ')[0],
    nomeCompleto: c.funcionario_nome,
    valor: c.valor_total,
    medicoes: c.total_medicoes,
    cor: i === 0 ? '#4f46e5' : '#94a3b8',
  }))

  const INDIGO = '#4f46e5'
  const SLATE = '#cbd5e1'

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <Link href={`/obras/${id}`} className="hover:text-slate-700 transition-colors">Detalhe</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Dashboard</span>
      </nav>

      {/* Header + filtro */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard da obra</h1>
            <p className="text-slate-400 text-sm">Produção, pagamentos e desempenho de equipe</p>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setFiltroAtivo({ inicio, fim }) }}
          className="flex flex-wrap items-end gap-2"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">De</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Até</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={isFetching}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Search size={14} />
            {isFetching ? 'Carregando...' : 'Aplicar'}
          </button>
        </form>
      </div>

      {/* Painel de orçamento — visível apenas para GESTOR/FINANCEIRO quando valor_contrato definido */}
      {orcamento && (
        <div className={`rounded-xl p-5 mb-5 border ${orcamento.alerta ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={16} className={orcamento.alerta ? 'text-amber-600' : 'text-indigo-600'} />
              <h2 className="font-semibold text-slate-900">Orçamento da obra</h2>
            </div>
            {orcamento.alerta && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-1 rounded-full">
                <AlertCircle size={11} />
                {orcamento.pct >= 100 ? 'Orçamento esgotado' : `${orcamento.pct.toFixed(0)}% do orçamento utilizado`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Valor do contrato</p>
              <p className="text-lg font-bold text-slate-900">{brl(orcamento.contrato)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Orçamento para custos</p>
              <p className="text-lg font-bold text-indigo-700">{brl(orcamento.orcamentoCustos)}</p>
              {orcamento.lucroEsperado > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">lucro esperado: {brl(orcamento.lucroEsperado)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Gasto acumulado</p>
              <p className={`text-lg font-bold ${orcamento.alerta ? 'text-amber-700' : 'text-slate-900'}`}>
                {brl(orcamento.gastoTotal)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{orcamento.pct.toFixed(1)}% do orçamento</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Saldo restante</p>
              <p className={`text-lg font-bold ${orcamento.saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {brl(orcamento.saldo)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{brl(orcamento.gastoTotal)} gasto</span>
              <span>{brl(orcamento.orcamentoCustos)} disponível</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  orcamento.pct >= 100 ? 'bg-red-500' : orcamento.alerta ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${orcamento.pct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI row — totais históricos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 stagger-children">
        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Banknote size={18} className="text-emerald-600" />
            </div>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">pago</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{brl(totalPago)}</p>
          <p className="text-xs text-slate-400 mt-1">{qtdPago} pagamento{qtdPago !== 1 ? 's' : ''} realizado{qtdPago !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">pendente</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{brl(totalPendente)}</p>
          <p className="text-xs text-slate-400 mt-1">{qtdPendente} aguardando pagamento</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">período</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loadingCalc ? '—' : brl(totalProducao)}</p>
          <p className="text-xs text-slate-400 mt-1">{loadingCalc ? '—' : totalMedicoes} medições no período</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">média/func.</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loadingCalc ? '—' : brl(mediaProducao)}</p>
          <p className="text-xs text-slate-400 mt-1">{loadingCalc ? '—' : calcOrdenado.length} funcionário{calcOrdenado.length !== 1 ? 's' : ''} com produção</p>
        </div>
      </div>

      {/* Lucratividade no período — visível apenas para GESTOR/FINANCEIRO */}
      {verFinanceiro && calcOrdenado.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Lucratividade no período</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(filtroAtivo.inicio + 'T00:00:00').toLocaleDateString('pt-BR')} — {new Date(filtroAtivo.fim + 'T00:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg ${
              lucrativa ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>
              {lucrativa
                ? <TrendingUp size={15} />
                : <TrendingDown size={15} />
              }
              {lucrativa ? 'Positiva' : 'Negativa'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Receita bruta</p>
              <p className="text-xl font-bold text-blue-700">{brl(totalCobranca)}</p>
              <p className="text-xs text-slate-400 mt-0.5">cobrança ao cliente</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Custo M.O.</p>
              <p className="text-xl font-bold text-slate-700">{brl(totalProducao)}</p>
              <p className="text-xs text-slate-400 mt-0.5">pagamento aos funcionários</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Margem bruta</p>
              <p className={`text-xl font-bold ${lucrativa ? 'text-emerald-700' : 'text-red-600'}`}>
                {lucrativa ? '+' : ''}{brl(margem)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">receita − custo M.O.</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Margem %</p>
              <p className={`text-xl font-bold ${lucrativa ? 'text-emerald-700' : 'text-red-600'}`}>
                {margemPct >= 0 ? '+' : ''}{margemPct.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">sobre receita bruta</p>
            </div>
          </div>
          {/* Barra visual receita vs custo */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Receita</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" /> Custo M.O.</span>
            </div>
            <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-blue-400 rounded-full" style={{ width: '100%' }} />
              <div
                className="absolute left-0 top-0 h-full bg-slate-400 rounded-full"
                style={{ width: totalCobranca > 0 ? `${Math.min(100, (totalProducao / totalCobranca) * 100)}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Linha temporal + destaque top performer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Gráfico de linha — histórico completo */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-900">Histórico de pagamentos</h2>
              <p className="text-xs text-slate-400 mt-0.5">Valores realizados vs. pendentes por mês</p>
            </div>
          </div>

          {dadosLinha.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle size={28} className="text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">Nenhum pagamento registrado ainda.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dadosLinha} margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="pago" name="Pago" stroke="#10b981" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pendente" name="Pendente" stroke="#f59e0b" strokeWidth={2}
                  strokeDasharray="5 3" dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top performer */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-900 text-sm">Maior produtor</h2>
            <span className="text-xs text-slate-400 ml-auto">no período</span>
          </div>

          {loadingCalc || isFetching ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="skeleton w-full h-32 rounded-xl" />
            </div>
          ) : !topFuncionario ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <Users size={28} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">Sem produção no período.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                  <span className="text-white font-bold text-lg">
                    {topFuncionario.funcionario_nome.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{topFuncionario.funcionario_nome}</p>
                  <p className="text-xs text-slate-400">{topFuncionario.total_medicoes} medições</p>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 mb-3">
                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-1">Produção total</p>
                <p className="text-2xl font-bold text-indigo-700">{brl(topFuncionario.valor_total)}</p>
              </div>

              <div className="space-y-2 mt-auto">
                {topFuncionario.por_servico.slice(0, 3).map((s) => (
                  <div key={s.servico_id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate">{s.servico_nome}</span>
                    <span className="font-semibold text-slate-700 ml-2 shrink-0">{brl(s.valor_total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de barras + tabela comparativa */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Barras horizontais */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Produção por funcionário</h2>
          <p className="text-xs text-slate-400 mb-5">
            {new Date(filtroAtivo.inicio + 'T00:00:00').toLocaleDateString('pt-BR')} — {new Date(filtroAtivo.fim + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>

          {loadingCalc || isFetching ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-7 rounded" />)}
            </div>
          ) : dadosBarras.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <TrendingUp size={24} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">Sem dados no período.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, dadosBarras.length * 44)}>
              <BarChart data={dadosBarras} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={false} tickLine={false} width={64} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" name="Produzido" radius={[0, 6, 6, 0]} barSize={20}>
                  {dadosBarras.map((d, i) => (
                    <Cell key={i} fill={i === 0 ? INDIGO : SLATE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tabela comparativa */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Ranking de equipe</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ordenado por produção no período</p>
          </div>

          {loadingCalc || isFetching ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
            </div>
          ) : calcOrdenado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={24} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">Sem produção no período selecionado.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">#</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Funcionário</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Medições</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Produção</th>
                  <th className="px-6 py-3 w-24 hidden md:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {calcOrdenado.map((c, i) => {
                  const pct = totalProducao > 0 ? (c.valor_total / totalProducao) * 100 : 0
                  return (
                    <tr key={c.funcionario_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        {i === 0
                          ? <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                          : <span className="text-slate-400 text-xs font-medium">{i + 1}º</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                            <span className={`text-xs font-semibold ${i === 0 ? 'text-indigo-600' : 'text-slate-500'}`}>
                              {c.funcionario_nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">{c.funcionario_nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 hidden sm:table-cell">{c.total_medicoes}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{brl(c.valor_total)}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className={`h-full rounded-full ${i === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-100 bg-slate-50/60">
                  <td colSpan={2} className="px-6 py-3 text-xs font-semibold text-slate-500">Total</td>
                  <td className="px-6 py-3 text-right text-xs font-semibold text-slate-700 hidden sm:table-cell">{totalMedicoes}</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">{brl(totalProducao)}</td>
                  <td className="hidden md:table-cell" />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
