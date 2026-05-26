'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Obra, StatusObra } from '@brain-master/shared/tipos'

const STATUS_LABEL: Record<StatusObra, string> = {
  ativa: 'Ativa',
  pausada: 'Pausada',
  encerrada: 'Encerrada',
}

const STATUS_CLASS: Record<StatusObra, string> = {
  ativa: 'bg-green-100 text-green-700',
  pausada: 'bg-yellow-100 text-yellow-700',
  encerrada: 'bg-slate-100 text-slate-600',
}

async function fetchObra(id: string): Promise<Obra> {
  const { data } = await api.get(`/api/v1/obras/${id}`)
  return data
}

export default function ObraDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: obra, isLoading, isError } = useQuery({
    queryKey: ['obra', id],
    queryFn: () => fetchObra(id),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !obra) return <p className="text-red-600">Obra não encontrada.</p>

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/obras" className="hover:text-slate-800">Obras</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{obra.nome}</span>
      </nav>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-slate-900">{obra.nome}</h1>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_CLASS[obra.status]}`}>
            {STATUS_LABEL[obra.status]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
          {obra.cliente && <div><span className="font-medium">Cliente:</span> {obra.cliente}</div>}
          {obra.endereco && <div><span className="font-medium">Endereço:</span> {obra.endereco}</div>}
          {obra.data_inicio && (
            <div>
              <span className="font-medium">Início:</span>{' '}
              {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
            </div>
          )}
          {obra.data_prev_fim && (
            <div>
              <span className="font-medium">Previsão de fim:</span>{' '}
              {new Date(obra.data_prev_fim).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/obras/${id}/servicos`}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow block"
        >
          <h2 className="font-semibold text-slate-900 mb-1">Serviços</h2>
          <p className="text-slate-500 text-sm">Gerenciar serviços e valores por unidade</p>
        </Link>

        <Link
          href={`/obras/${id}/medicoes`}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow block"
        >
          <h2 className="font-semibold text-slate-900 mb-1">Medições</h2>
          <p className="text-slate-500 text-sm">Ver registros de produção desta obra</p>
        </Link>

        <Link
          href={`/obras/${id}/pagamentos`}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow block"
        >
          <h2 className="font-semibold text-slate-900 mb-1">Pagamentos</h2>
          <p className="text-slate-500 text-sm">Calcular e registrar pagamentos por produção</p>
        </Link>
      </div>
    </div>
  )
}
