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

async function fetchObras(): Promise<Obra[]> {
  const { data } = await api.get('/api/v1/obras')
  return data
}

export default function ObrasPage() {
  const { data: obras, isLoading, isError } = useQuery({ queryKey: ['obras'], queryFn: fetchObras })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <p className="text-red-600">Erro ao carregar obras.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Obras</h1>
      </div>

      {!obras?.length ? (
        <p className="text-slate-500">Nenhuma obra encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {obras.map((obra) => (
            <Link
              key={obra.id}
              href={`/obras/${obra.id}`}
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-slate-900 text-sm leading-tight">{obra.nome}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 shrink-0 ${STATUS_CLASS[obra.status]}`}>
                  {STATUS_LABEL[obra.status]}
                </span>
              </div>
              {obra.cliente && (
                <p className="text-slate-500 text-xs mt-1">Cliente: {obra.cliente}</p>
              )}
              {obra.data_inicio && (
                <p className="text-slate-400 text-xs mt-1">
                  Início: {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
