'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'
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
  encerrada: 'bg-slate-100 text-slate-500',
}

async function fetchObras(): Promise<Obra[]> {
  const { data } = await api.get('/api/v1/obras')
  return data
}

export default function ObrasPage() {
  const { data: obras, isLoading, isError } = useQuery({ queryKey: ['obras'], queryFn: fetchObras })

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Erro ao carregar obras. Tente recarregar a página.
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Obras</h1>
          <p className="text-slate-500 text-sm mt-0.5">{obras?.length ?? 0} obra{obras?.length !== 1 ? 's' : ''} cadastrada{obras?.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {!obras?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Building2 size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Nenhuma obra encontrada</p>
          <p className="text-slate-400 text-sm">As obras cadastradas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {obras.map((obra) => (
            <Link
              key={obra.id}
              href={`/obras/${obra.id}`}
              className="group bg-white border border-slate-200 rounded-xl p-5 card-hover hover:border-indigo-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-blue-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[obra.status]}`}>
                  {STATUS_LABEL[obra.status]}
                </span>
              </div>

              <h2 className="font-semibold text-slate-900 text-sm leading-snug mb-1">{obra.nome}</h2>

              {obra.cliente && (
                <p className="text-slate-500 text-xs">Cliente: {obra.cliente}</p>
              )}
              {obra.data_inicio && (
                <p className="text-slate-400 text-xs mt-0.5">
                  Início: {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              )}

              <div className="flex items-center justify-end mt-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium mr-1">Ver obra</span>
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
