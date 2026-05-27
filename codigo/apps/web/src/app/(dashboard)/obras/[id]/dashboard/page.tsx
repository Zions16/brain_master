'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  ChevronRight, LayoutDashboard, TrendingUp, Banknote,
  Clock, Users, Search,
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Pagamento } from '@brain-master/shared/tipos'
import type { CalculoPagamento } from '@/types/calculo'

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPagamentos(obraId: string): Promise<Pagamento[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos`)
  return data
}

async function fetchCalculo(obraId: string, inicio: string, fim: string): Promise<CalculoPagamento[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos/calcular`, {
    params: { inicio, fim },
  })
  return data.data
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mesLabel(dataStr: string) {
  const d = new Date(dataStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function brl(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function agruparPorMes(pagamentos: Pagamento[]) {
  const mapa = new Map<string, { pago: number; pendente: number }>()

  for (const p of pagamentos) {
    const chave = mesLabel(p.periodo_fim)
    const atual = mapa.get(chave) ?? { pago: 0, pendente: 0 }
    if (p.status === 'realizado') atual.pago += p.valor_total
    else atual.pendente += p.valor_total
    mapa.set(chave, atual)
  }

  return Array.from(mapa.entries()).map(([mes, vals]) => ({ mes, ...vals }))
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────

function TooltipBRL({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}:</span>
          <span className="font-semibold">{brl(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DashboardPage({ params }: { params: { id: string } }) {
  const { id } = params

  // Período padrão: últimos 90 dias
  const hoje = new Date().toISOString().split('T')[0]
  const noventa = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [periodo, setPeriodo] = useState({ inicio: noventa, fim: hoje })
  const [filtroPeriodo, setFiltroPeriodo] = useState({ inicio: noventa, fim: hoje })

  // Todos os pagamentos da obra (para linha temporal — sem filtro de período)
  const { data: pagamentos, isLoading: loadingPag } = useQuery({
    queryKey: ['pagamentos', id],
    queryFn: () => fetchPagamentos(id),
  })

  // Cálculo de produção no período filtrado (para comparativo de funcionários)
  const { data: calculo, isLoading: loadingCalculo, refetch, isFetching } = useQuery({
    queryKey: ['calculo-dashboard', id, filtroPeriodo.inicio, filtroPeriodo.fim],
    queryFn: () => fetchCalculo(id, filtroPeriodo.inicio, filtroPeriodo.fim),
  })

  function aplicarFiltro(e: React.FormEvent) {
    e.preventDefault()
    setFiltroPeriodo({ ...periodo })
  }

  if (loadingPag) return <LoadingSpinner />

  // ── Derivações ───────────────────────────────────────────────────────────────

  const allPag = pagamentos ?? []

  const totalPago = allPag.filter((p) => p.status === 'realizado').reduce((s, p) => s + p.valor_total, 0)
  const totalPendente = allPag.filter((p) => p.status === 'pendente').reduce((s, p) => s + p.valor_total, 0)
  const totalMedicoesPeriodo = calculo?.reduce((s, c) => s + c.total_medicoes, 0) ?? 0
  const totalFuncionarios = calculo?.length ?? 0

  const dadosLinha = agruparPorMes(allPag)

  const dadosBarras = (calculo ?? [])
    .map((c) => ({
      nome: c.funcionario_nome.split(' ')[0], // primeiro nome para caber no eixo
      nomeCompleto: c.funcionario_nome,
      produzido: c.valor_total,
      medicoes: c.total_medicoes,
    }))
    .sort((a, b) => b.produzido - a.produzido)

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <Link href={`/obras/${id}`} className="hover:text-slate-700 transition-colors">Detalhe</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Dashboard</span>
      </nav>

      {/* Header + filtro */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-400">Produção e pagamentos da obra</p>
          </div>
        </div>

        <form onSubmit={aplicarFiltro} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Início</label>
            <input
              type="date"
              value={periodo.inicio}
              onChange={(e) => setPeriodo((p) => ({ ...p, inicio: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Fim</label>
            <input
              type="date"
              value={periodo.fim}
              onChange={(e) => setPeriodo((p) => ({ ...p, fim: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Search size={14} />
            {isFetching ? 'Carregando...' : 'Aplicar'}
          </button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-stagger">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Banknote size={15} className="text-green-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total pago</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{brl(totalPago)}</p>
          <p className="text-xs text-slate-400 mt-1">{allPag.filter((p) => p.status === 'realizado').length} pagamento(s)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={15} className="text-yellow-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{brl(totalPendente)}</p>
          <p className="text-xs text-slate-400 mt-1">{allPag.filter((p) => p.status === 'pendente').length} pagamento(s)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-blue-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Medições</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loadingCalculo ? '—' : totalMedicoesPeriodo}</p>
          <p className="text-xs text-slate-400 mt-1">no período selecionado</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={15} className="text-indigo-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Funcionários</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loadingCalculo ? '—' : totalFuncionarios}</p>
          <p className="text-xs text-slate-400 mt-1">com produção no período</p>
        </div>
      </div>

      {/* Gráfico de linha — evolução de pagamentos */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Evolução de pagamentos por mês</h2>
        {dadosLinha.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">Nenhum pagamento registrado.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dadosLinha} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBRL />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line
                type="monotone"
                dataKey="pago"
                name="Pago"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#22c55e' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="pendente"
                name="Pendente"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="5 3"
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gráfico de barras — produção por funcionário */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Produção por funcionário</h2>
        <p className="text-xs text-slate-400 mb-5">
          {new Date(filtroPeriodo.inicio + 'T00:00:00').toLocaleDateString('pt-BR')} —{' '}
          {new Date(filtroPeriodo.fim + 'T00:00:00').toLocaleDateString('pt-BR')}
        </p>

        {loadingCalculo || isFetching ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : dadosBarras.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">
            Nenhuma produção registrada no período.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, dadosBarras.length * 52)}>
            <BarChart
              data={dadosBarras}
              layout="vertical"
              margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="nome"
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<TooltipBRL />} />
              <Bar dataKey="produzido" name="Produzido (R$)" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabela comparativa */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Comparativo de funcionários</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Período:{' '}
            {new Date(filtroPeriodo.inicio + 'T00:00:00').toLocaleDateString('pt-BR')} —{' '}
            {new Date(filtroPeriodo.fim + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>
        </div>

        {loadingCalculo || isFetching ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : !calculo?.length ? (
          <p className="text-slate-400 text-sm text-center py-10">
            Nenhuma produção no período.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">#</th>
                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Funcionário</th>
                <th className="text-right px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Medições</th>
                <th className="text-right px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor produzido</th>
                <th className="text-right px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">% do total</th>
                <th className="text-center px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Serviços</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...calculo]
                .sort((a, b) => b.valor_total - a.valor_total)
                .map((c, i) => {
                  const totalGeral = calculo.reduce((s, x) => s + x.valor_total, 0)
                  const pct = totalGeral > 0 ? ((c.valor_total / totalGeral) * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={c.funcionario_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-medium text-xs">{i + 1}º</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                            <span className="text-indigo-600 font-semibold text-xs">
                              {c.funcionario_nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">{c.funcionario_nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">{c.total_medicoes}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{brl(c.valor_total)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 text-xs">
                        {c.por_servico.length} tipo{c.por_servico.length !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={2} className="px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Total
                </td>
                <td className="px-6 py-3.5 text-right text-xs font-semibold text-slate-700">
                  {calculo.reduce((s, c) => s + c.total_medicoes, 0)}
                </td>
                <td className="px-6 py-3.5 text-right text-sm font-bold text-slate-900">
                  {brl(calculo.reduce((s, c) => s + c.valor_total, 0))}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
