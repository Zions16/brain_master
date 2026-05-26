'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Pagamento, StatusPagamento } from '@brain-master/shared/tipos'

const STATUS_LABEL: Record<StatusPagamento, string> = {
  pendente: 'Pendente',
  realizado: 'Realizado',
}

const STATUS_CLASS: Record<StatusPagamento, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  realizado: 'bg-green-100 text-green-700',
}

async function fetchPagamentos(obraId: string): Promise<Pagamento[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos`)
  return data
}

async function realizarPagamento(obraId: string, pagamentoId: string) {
  const { data } = await api.patch(`/api/v1/obras/${obraId}/pagamentos/${pagamentoId}/realizar`)
  return data
}

export default function PagamentosPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const [realizando, setRealizando] = useState<string | null>(null)

  const { data: pagamentos, isLoading, isError } = useQuery({
    queryKey: ['pagamentos', id],
    queryFn: () => fetchPagamentos(id),
  })

  const { mutate: realizar } = useMutation({
    mutationFn: (pagamentoId: string) => {
      setRealizando(pagamentoId)
      return realizarPagamento(id, pagamentoId)
    },
    onSettled: () => {
      setRealizando(null)
      qc.invalidateQueries({ queryKey: ['pagamentos', id] })
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <p className="text-red-600">Erro ao carregar pagamentos.</p>

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/obras" className="hover:text-slate-800">Obras</Link>
        <span className="mx-2">/</span>
        <Link href={`/obras/${id}`} className="hover:text-slate-800">Detalhe</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Pagamentos</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pagamentos</h1>
        <Link
          href={`/obras/${id}/pagamentos/calcular`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Calcular pagamentos
        </Link>
      </div>

      {!pagamentos?.length ? (
        <p className="text-slate-500">Nenhum pagamento registrado.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Funcionário</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Período</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Valor total</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagamentos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.funcionario?.nome ?? p.funcionario_id}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(p.periodo_inicio).toLocaleDateString('pt-BR')} —{' '}
                    {new Date(p.periodo_fim).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {p.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.status === 'pendente' && (
                      <button
                        onClick={() => realizar(p.id)}
                        disabled={realizando === p.id}
                        className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-1 rounded-md transition-colors"
                      >
                        {realizando === p.id ? 'Realizando...' : 'Realizar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
