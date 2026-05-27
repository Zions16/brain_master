'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Building2, Users, CheckCircle2, PauseCircle,
  XCircle, ArrowRight, TrendingUp, LayoutDashboard,
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Funcionario, Obra, StatusObra } from '@brain-master/shared/tipos'

const STATUS_LABEL: Record<StatusObra, string> = {
  ativa: 'Ativa',
  pausada: 'Pausada',
  encerrada: 'Encerrada',
}

const STATUS_BADGE: Record<StatusObra, string> = {
  ativa: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  pausada: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  encerrada: 'bg-slate-100 text-slate-500',
}

const STATUS_DOT: Record<StatusObra, string> = {
  ativa: 'bg-emerald-500',
  pausada: 'bg-amber-400',
  encerrada: 'bg-slate-300',
}

async function fetchObras(): Promise<Obra[]> {
  const { data } = await api.get('/api/v1/obras')
  return data
}

async function fetchFuncionarios(): Promise<Funcionario[]> {
  const { data } = await api.get('/api/v1/funcionarios')
  return data
}

function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataHoje() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function ObrasPage() {
  const { usuario } = useAuthStore()

  const { data: obras, isLoading: loadingObras } = useQuery({
    queryKey: ['obras'],
    queryFn: fetchObras,
  })

  const { data: funcionarios, isLoading: loadingFunc } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: fetchFuncionarios,
  })

  if (loadingObras || loadingFunc) return <LoadingSpinner />

  const ativas = obras?.filter((o) => o.status === 'ativa').length ?? 0
  const pausadas = obras?.filter((o) => o.status === 'pausada').length ?? 0
  const encerradas = obras?.filter((o) => o.status === 'encerrada').length ?? 0
  const totalObras = obras?.length ?? 0
  const totalFunc = funcionarios?.length ?? 0

  const kpis = [
    {
      label: 'Total de obras',
      value: totalObras,
      icon: Building2,
      iconClass: 'bg-indigo-50 text-indigo-600',
      sub: `${ativas} ativa${ativas !== 1 ? 's' : ''}`,
    },
    {
      label: 'Obras ativas',
      value: ativas,
      icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-600',
      sub: 'em andamento',
    },
    {
      label: 'Pausadas',
      value: pausadas,
      icon: PauseCircle,
      iconClass: 'bg-amber-50 text-amber-600',
      sub: 'aguardando retomada',
    },
    {
      label: 'Funcionários',
      value: totalFunc,
      icon: Users,
      iconClass: 'bg-blue-50 text-blue-600',
      sub: 'cadastrados',
    },
  ]

  return (
    <div className="fade-in">
      {/* Header de saudação */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-slate-400 text-sm mb-0.5 capitalize">{dataHoje()}</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {saudacao()}, {usuario?.nome?.split(' ')[0] ?? 'Gestor'}.
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {ativas > 0
              ? `Você tem ${ativas} obra${ativas !== 1 ? 's' : ''} ativa${ativas !== 1 ? 's' : ''} em andamento.`
              : 'Nenhuma obra ativa no momento.'}
          </p>
        </div>
        <Link
          href="/obras/nova"
          className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Building2 size={15} />
          Nova obra
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {kpis.map(({ label, value, icon: Icon, iconClass, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
                <Icon size={18} />
              </div>
              <TrendingUp size={13} className="text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-0.5">{value}</p>
            <p className="text-xs font-semibold text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabela de obras */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Obras cadastradas</h2>
            <p className="text-xs text-slate-400 mt-0.5">{totalObras} no total</p>
          </div>
          <LayoutDashboard size={16} className="text-slate-300" />
        </div>

        {!obras?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Building2 size={22} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium mb-1">Nenhuma obra cadastrada</p>
            <p className="text-slate-400 text-sm">Cadastre a primeira obra para começar.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Obra</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Cliente</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Início</th>
                <th className="text-center px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {obras.map((obra) => (
                <tr key={obra.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Building2 size={15} className="text-indigo-600" />
                      </div>
                      <span className="font-semibold text-slate-900">{obra.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                    {obra.cliente ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500 hidden lg:table-cell">
                    {obra.data_inicio
                      ? new Date(obra.data_inicio).toLocaleDateString('pt-BR')
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[obra.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[obra.status]}`} />
                      {STATUS_LABEL[obra.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/obras/${obra.id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Abrir <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Resumo por status no footer */}
        {!!obras?.length && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {ativas} ativa{ativas !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {pausadas} pausada{pausadas !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              {encerradas} encerrada{encerradas !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
