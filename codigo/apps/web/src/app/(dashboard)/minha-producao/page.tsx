'use client'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { BarChart2, User, Banknote, CheckCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Funcionario, Medicao } from '@brain-master/shared/tipos'
import type { ProducaoResult } from '@/types/producao'

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  ativa: 'Ativa',
  corrigida: 'Corrigida',
  cancelada: 'Cancelada',
  pendente_aprovacao: 'Aguard. aprovação',
}
const STATUS_CLASS: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  ativa: 'bg-green-100 text-green-700',
  corrigida: 'bg-blue-100 text-blue-700',
  cancelada: 'bg-red-100 text-red-700',
  pendente_aprovacao: 'bg-orange-100 text-orange-700',
}

const hoje = new Date().toISOString().split('T')[0]
const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

async function fetchMeuPerfil(): Promise<Funcionario | null> {
  const { data } = await api.get('/api/v1/funcionarios/me')
  return data
}

async function fetchProducao(id: string, inicio: string, fim: string): Promise<ProducaoResult> {
  const { data } = await api.get(`/api/v1/funcionarios/${id}/producao`, { params: { inicio, fim } })
  return data
}

async function fetchMedicoes(id: string): Promise<(Medicao & { obra?: { id: string; nome: string } })[]> {
  const { data } = await api.get(`/api/v1/funcionarios/${id}/medicoes`)
  return data
}

export default function MinhaProducaoPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const [funcionarioId, setFuncionarioId] = useState<string | null>(null)

  // Persiste o vínculo no localStorage para não pedir toda vez
  useEffect(() => {
    const saved = localStorage.getItem('bm_meu_funcionario_id')
    if (saved) setFuncionarioId(saved)
  }, [])

  const { data: meuPerfil, isLoading: buscandoPerfil } = useQuery({
    queryKey: ['funcionario-me'],
    queryFn: fetchMeuPerfil,
    enabled: !funcionarioId,
    retry: false,
  })

  // Auto-vincula se encontrou por nome
  useEffect(() => {
    if (meuPerfil?.id && !funcionarioId) {
      setFuncionarioId(meuPerfil.id)
      localStorage.setItem('bm_meu_funcionario_id', meuPerfil.id)
    }
  }, [meuPerfil, funcionarioId])

  const fidFinal = funcionarioId ?? meuPerfil?.id ?? null

  const { data: producao, isLoading: carregandoProducao } = useQuery({
    queryKey: ['minha-producao', fidFinal, primeiroDiaMes, hoje],
    queryFn: () => fetchProducao(fidFinal!, primeiroDiaMes, hoje),
    enabled: !!fidFinal,
  })

  const { data: medicoes, isLoading: carregandoMedicoes } = useQuery({
    queryKey: ['minhas-medicoes', fidFinal],
    queryFn: () => fetchMedicoes(fidFinal!),
    enabled: !!fidFinal,
  })

  if (buscandoPerfil && !funcionarioId) return <LoadingSpinner />

  // Perfil não encontrado por nome — pedir que entre em contato com o gestor
  if (!buscandoPerfil && !fidFinal) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <User size={32} className="text-amber-400 mx-auto mb-3" />
          <h2 className="font-semibold text-amber-900 mb-2">Perfil de funcionário não encontrado</h2>
          <p className="text-sm text-amber-700">
            Seu nome de usuário (<strong>{usuario?.nome}</strong>) não corresponde a nenhum funcionário cadastrado.
            Peça ao gestor para cadastrar seu perfil com o mesmo nome.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minha Produção</h1>
        <p className="text-slate-500 text-sm mt-1">Mês atual — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* KPIs do mês */}
      {carregandoProducao && <LoadingSpinner />}

      {producao && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote size={15} className="text-green-500" />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">A receber</p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {producao.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={15} className="text-blue-500" />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Medições</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{producao.total_medicoes}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={15} className="text-indigo-500" />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Serviços</p>
            </div>
            <p className="text-2xl font-bold text-indigo-700">{producao.por_servico.length}</p>
          </div>
        </div>
      )}

      {/* Breakdown por serviço */}
      {producao && producao.por_servico.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Produção por serviço</h2>
          <div className="space-y-3">
            {producao.por_servico.map((s) => (
              <div key={s.servico_id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{s.servico_nome}</p>
                  <p className="text-xs text-slate-400">{s.quantidade_total} {s.unidade_medida}</p>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {s.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medições recentes */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Minhas medições</h2>

        {carregandoMedicoes && <LoadingSpinner />}

        {medicoes && medicoes.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-6">Nenhuma medição registrada ainda.</p>
        )}

        {medicoes && medicoes.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Obra</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Serviço</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Qtd.</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicoes.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{(m as any).obra?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{m.servico?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {m.quantidade} <span className="text-xs text-slate-400">{m.servico?.unidade_medida}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {m.valor_calculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[m.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {m.status === 'pendente_aprovacao' && <Clock size={10} />}
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
