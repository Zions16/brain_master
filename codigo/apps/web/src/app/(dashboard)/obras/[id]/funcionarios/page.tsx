'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronRight, Users, TrendingUp, Clock, ArrowRight, Banknote } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { FuncionarioResumoObra, TipoPagamento } from '@brain-master/shared/tipos'

const TIPO_LABEL: Record<TipoPagamento, string> = {
  POR_PRODUCAO: 'Por produção',
  DIARIA: 'Diária',
  HORA: 'Por hora',
  MISTO: 'Misto',
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function fetchResumoFuncionarios(obraId: string): Promise<FuncionarioResumoObra[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/funcionarios/resumo`)
  return data
}

export default function FuncionariosObraPage({ params }: { params: { id: string } }) {
  const { id } = params

  const { data: funcionarios, isLoading, isError } = useQuery({
    queryKey: ['obra-funcionarios-resumo', id],
    queryFn: () => fetchResumoFuncionarios(id),
    staleTime: 30_000,
  })

  const lista = funcionarios ?? []
  const totalProduzido = lista.reduce((s, f) => s + f.total_produzido, 0)
  const totalPendente = lista.reduce((s, f) => s + f.total_pendente, 0)
  const totalMedicoes = lista.reduce((s, f) => s + f.total_medicoes, 0)

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <Link href={`/obras/${id}`} className="hover:text-slate-700 transition-colors">Detalhe</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Funcionários</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
          <Users size={18} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Funcionários da obra</h1>
          {!isLoading && (
            <p className="text-sm text-slate-400">
              {lista.length} funcionário{lista.length !== 1 ? 's' : ''} com produção registrada
            </p>
          )}
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Erro ao carregar funcionários.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* KPIs */}
          {lista.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <Users size={16} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-0.5">{lista.length}</p>
                <p className="text-xs font-semibold text-slate-700">Funcionários</p>
                <p className="text-xs text-slate-400 mt-0.5">com medições ativas</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  <TrendingUp size={16} className="text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-0.5">{totalMedicoes}</p>
                <p className="text-xs font-semibold text-slate-700">Medições ativas</p>
                <p className="text-xs text-slate-400 mt-0.5">total na obra</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                  <Banknote size={16} className="text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-emerald-700 mb-0.5">{brl(totalProduzido)}</p>
                <p className="text-xs font-semibold text-slate-700">Total produzido</p>
                <p className="text-xs text-slate-400 mt-0.5">custo mão de obra</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                  <Clock size={16} className="text-amber-500" />
                </div>
                <p className="text-xl font-bold text-amber-700 mb-0.5">{brl(totalPendente)}</p>
                <p className="text-xs font-semibold text-slate-700">A receber</p>
                <p className="text-xs text-slate-400 mt-0.5">pagamentos pendentes</p>
              </div>
            </div>
          )}

          {/* Tabela */}
          {lista.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Users size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">Nenhum funcionário com produção</p>
              <p className="text-slate-400 text-sm">Registre medições ativas para ver o resumo aqui.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Funcionário</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Tipo pag.</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Medições</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Total produzido</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">A receber</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Última medição</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lista.map((f) => (
                    <tr key={f.funcionario_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">
                              {f.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{f.nome}</p>
                            {f.funcao && <p className="text-xs text-slate-400">{f.funcao}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden sm:table-cell">
                        {TIPO_LABEL[f.tipo_pagamento]}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-slate-800">{f.total_medicoes}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-emerald-700">{brl(f.total_produzido)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {f.total_pendente > 0 ? (
                          <span className="font-semibold text-amber-700">{brl(f.total_pendente)}</span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-500 hidden md:table-cell">
                        {f.ultima_medicao
                          ? new Date(f.ultima_medicao + 'T00:00:00').toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/funcionarios/${f.funcionario_id}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          Ver histórico <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
