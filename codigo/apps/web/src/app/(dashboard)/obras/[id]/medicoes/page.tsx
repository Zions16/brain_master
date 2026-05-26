'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronRight, Ruler } from 'lucide-react'
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
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Erro ao carregar medições.
    </div>
  )

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <Link href={`/obras/${id}`} className="hover:text-slate-700 transition-colors">Detalhe</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Medições</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
          <Ruler size={18} className="text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Medições</h1>
        {medicoes && (
          <span className="text-sm text-slate-400">{medicoes.length} registro{medicoes.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {!medicoes?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Ruler size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Nenhuma medição registrada</p>
          <p className="text-slate-400 text-sm">As medições desta obra aparecerão aqui.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Data</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Funcionário</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Serviço</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Qtd.</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor</th>
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicoes.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-600">
                    {new Date(m.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{m.funcionario?.nome ?? m.funcionario_id}</td>
                  <td className="px-5 py-4 text-slate-600">{m.servico?.nome ?? m.servico_id}</td>
                  <td className="px-5 py-4 text-right text-slate-700">
                    {m.quantidade} {m.servico?.unidade_medida ?? ''}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {m.valor_calculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CLASS[m.status]}`}>
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
