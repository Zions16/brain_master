'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Ruler, Banknote, Wrench, ChevronRight, MapPin, User, Calendar, LayoutDashboard } from 'lucide-react'
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

async function fetchObra(id: string): Promise<Obra> {
  const { data } = await api.get(`/api/v1/obras/${id}`)
  return data
}

const SECTIONS = [
  {
    href: (id: string) => `/obras/${id}/dashboard`,
    label: 'Dashboard',
    description: 'Produção, gastos e comparativo de funcionários',
    icon: LayoutDashboard,
    color: 'bg-indigo-50 text-indigo-600',
    border: 'hover:border-indigo-300',
  },
  {
    href: (id: string) => `/obras/${id}/servicos`,
    label: 'Serviços',
    description: 'Gerenciar serviços e valores por unidade',
    icon: Wrench,
    color: 'bg-violet-50 text-violet-600',
    border: 'hover:border-violet-300',
  },
  {
    href: (id: string) => `/obras/${id}/medicoes`,
    label: 'Medições',
    description: 'Ver registros de produção desta obra',
    icon: Ruler,
    color: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-300',
  },
  {
    href: (id: string) => `/obras/${id}/pagamentos`,
    label: 'Pagamentos',
    description: 'Calcular e registrar pagamentos por produção',
    icon: Banknote,
    color: 'bg-green-50 text-green-600',
    border: 'hover:border-green-300',
  },
]

export default function ObraDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: obra, isLoading, isError } = useQuery({
    queryKey: ['obra', id],
    queryFn: () => fetchObra(id),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !obra) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Obra não encontrada.
    </div>
  )

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">{obra.nome}</span>
      </nav>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{obra.nome}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CLASS[obra.status]}`}>
                {STATUS_LABEL[obra.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {obra.cliente && (
            <div className="flex items-start gap-2">
              <User size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Cliente</p>
                <p className="text-sm font-medium text-slate-800">{obra.cliente}</p>
              </div>
            </div>
          )}
          {obra.endereco && (
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Endereço</p>
                <p className="text-sm font-medium text-slate-800">{obra.endereco}</p>
              </div>
            </div>
          )}
          {obra.data_inicio && (
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Início</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
          {obra.data_prev_fim && (
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Previsão de fim</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(obra.data_prev_fim).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map(({ href, label, description, icon: Icon, color, border }) => (
          <Link
            key={label}
            href={href(id)}
            className={`group bg-white border border-slate-200 ${border} rounded-xl p-5 hover:shadow-md transition-all block`}
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <h2 className="font-semibold text-slate-900 mb-1">{label}</h2>
            <p className="text-slate-500 text-sm leading-snug">{description}</p>
            <div className="flex items-center justify-end mt-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={15} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
