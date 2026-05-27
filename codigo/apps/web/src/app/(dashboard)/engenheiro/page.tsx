'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Building2, Ruler, AlertTriangle, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Obra, StatusObra } from '@brain-master/shared/tipos'

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
  const { data } = await api.get('/api/v1/obras/minhas')
  return data
}

export default function EngenheiroDashboard() {
  const usuario = useAuthStore((s) => s.usuario)
  const { data: obras, isLoading } = useQuery({ queryKey: ['obras'], queryFn: fetchObras })

  const ativas = obras?.filter((o) => o.status === 'ativa') ?? []
  const pausadas = obras?.filter((o) => o.status === 'pausada') ?? []

  function saudacao() {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">
          {saudacao()}, {usuario?.nome?.split(' ')[0] ?? 'Engenheiro'} 👷
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPI rápido */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Obras ativas</p>
          <p className="text-3xl font-bold text-slate-900">{ativas.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Em pausa</p>
          <p className="text-3xl font-bold text-slate-900">{pausadas.length}</p>
        </div>
      </div>

      {/* Lista de obras */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Obras</h2>
        <Link href="/obras" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
      </div>

      {isLoading && <LoadingSpinner />}

      {obras && obras.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-500">Nenhuma obra cadastrada.</p>
        </div>
      )}

      <div className="space-y-3">
        {obras?.map((obra) => (
          <div key={obra.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_BADGE[obra.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[obra.status]}`} />
                    {obra.status === 'ativa' ? 'Ativa' : obra.status === 'pausada' ? 'Pausada' : 'Encerrada'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">{obra.nome}</h3>
                {obra.cliente && <p className="text-sm text-slate-400 mt-0.5">{obra.cliente}</p>}
              </div>
            </div>

            {/* Ações do engenheiro para esta obra */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <Link
                href={`/obras/${obra.id}/medicoes?nova=1`}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={12} />
                Registrar medição
              </Link>
              <Link
                href={`/obras/${obra.id}/medicoes`}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Ruler size={12} />
                Ver medições
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Aviso sobre emergências */}
      {obras && obras.length > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Medição de emergência</p>
            <p className="text-sm text-amber-600 mt-0.5">
              Acesse a obra → Medições → marque "Emergência" ao registrar. O gestor será notificado para aprovar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
