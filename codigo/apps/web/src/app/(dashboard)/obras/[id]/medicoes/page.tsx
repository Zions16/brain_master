'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Medicao, StatusMedicao } from '@brain-master/shared/tipos'

const STATUS_LABEL: Record<StatusMedicao, string> = {
  pendente: 'Pendente',
  ativa: 'Ativa',
  corrigida: 'Corrigida',
  cancelada: 'Cancelada',
  pendente_aprovacao: 'Aguard. aprovação',
}

const STATUS_CLASS: Record<StatusMedicao, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  ativa: 'bg-green-100 text-green-700',
  corrigida: 'bg-blue-100 text-blue-700',
  cancelada: 'bg-red-100 text-red-700',
  pendente_aprovacao: 'bg-orange-100 text-orange-700',
}

async function fetchMedicoes(obraId: string): Promise<Medicao[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/medicoes`)
  return data
}

export default function MedicoesPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: medicoes, isLoading, isError } = useQuery({
    queryKey: ['medicoes', id],
    queryFn: () => fetchMedicoes(id),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <p className="text-red-600">Erro ao carregar medições.</p>

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/obras" className="hover:text-slate-800">Obras</Link>
        <span className="mx-2">/</span>
        <Link href={`/obras/${id}`} className="hover:text-slate-800">Detalhe</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Medições</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Medições</h1>

      {!medicoes?.length ? (
        <p className="text-slate-500">Nenhuma medição registrada.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Funcionário</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Serviço</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Quantidade</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Valor</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicoes.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(m.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">{m.funcionario?.nome ?? m.funcionario_id}</td>
                  <td className="px-4 py-3 text-slate-600">{m.servico?.nome ?? m.servico_id}</td>
                  <td className="px-4 py-3 text-right">
                    {m.quantidade} {m.servico?.unidade_medida ?? ''}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {m.valor_calculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[m.status]}`}>
                      {STATUS_LABEL[m.status]}
                    </span>
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
