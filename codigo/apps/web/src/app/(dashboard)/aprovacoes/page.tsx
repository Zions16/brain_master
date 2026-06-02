'use client'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ClipboardCheck, CheckCircle, XCircle, Building2, Info, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Medicao } from '@brain-master/shared/tipos'

type MedicaoPendente = Medicao & {
  obra: { id: string; nome: string }
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function fetchPendentes(): Promise<MedicaoPendente[]> {
  const { data } = await api.get('/api/v1/medicoes/pendentes')
  return data
}

async function aprovarMedicao(obraId: string, medicaoId: string, observacaoGestor?: string): Promise<Medicao> {
  const { data } = await api.patch(`/api/v1/obras/${obraId}/medicoes/${medicaoId}/aprovar`, {
    observacao_gestor: observacaoGestor || undefined,
  })
  return data
}

async function rejeitarMedicao(obraId: string, medicaoId: string, motivo: string): Promise<Medicao> {
  const { data } = await api.patch(`/api/v1/obras/${obraId}/medicoes/${medicaoId}/rejeitar`, { motivo })
  return data
}

export default function AprovacoesPage() {
  const qc = useQueryClient()
  const { data: pendentes, isLoading } = useQuery({
    queryKey: ['medicoes-pendentes'],
    queryFn: fetchPendentes,
    staleTime: 15_000,
  })

  const [aprovandoId, setAprovandoId] = useState<MedicaoPendente | null>(null)
  const [obsGestor, setObsGestor] = useState('')
  const [rejeitandoId, setRejeitandoId] = useState<MedicaoPendente | null>(null)
  const [motivoRejeitar, setMotivoRejeitar] = useState('')

  const { mutate: aprovar, isPending: aprovando } = useMutation({
    mutationFn: ({ m }: { m: MedicaoPendente }) =>
      aprovarMedicao(m.obra.id, m.id, obsGestor || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicoes-pendentes'] })
      setAprovandoId(null)
      setObsGestor('')
    },
  })

  const { mutate: rejeitar, isPending: rejeitando } = useMutation({
    mutationFn: ({ m }: { m: MedicaoPendente }) =>
      rejeitarMedicao(m.obra.id, m.id, motivoRejeitar),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicoes-pendentes'] })
      setRejeitandoId(null)
      setMotivoRejeitar('')
    },
  })

  const lista = pendentes ?? []

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
          <ClipboardCheck size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fila de Aprovações</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isLoading ? 'Carregando...' : `${lista.length} medição${lista.length !== 1 ? 'ões' : ''} aguardando aprovação`}
          </p>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && lista.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle size={26} className="text-emerald-500" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Tudo em dia</p>
          <p className="text-slate-400 text-sm">Nenhuma medição aguardando aprovação.</p>
        </div>
      )}

      {lista.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Data</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Obra</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Funcionário</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Serviço</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Qtd.</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((m) => (
                <>
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors bg-amber-50/30">
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(m.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <Link
                          href={`/obras/${m.obra.id}/medicoes`}
                          className="font-medium text-slate-800 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                        >
                          {m.obra.nome}
                          <ArrowRight size={11} className="text-slate-400" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {(m.funcionario as any)?.nome ?? m.funcionario_id}
                    </td>
                    <td className="px-5 py-4 text-slate-600 hidden md:table-cell">
                      {(m.servico as any)?.nome ?? m.servico_id}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-700">
                      {m.quantidade}{' '}
                      <span className="text-slate-400 text-xs">{(m.servico as any)?.unidade_medida ?? ''}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {brl(m.valor_calculado)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setAprovandoId(m); setObsGestor('') }}
                          className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <CheckCircle size={12} />
                          Aprovar
                        </button>
                        <button
                          onClick={() => { setRejeitandoId(m); setMotivoRejeitar('') }}
                          className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <XCircle size={12} />
                          Rejeitar
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Painel de aprovação inline */}
                  {aprovandoId?.id === m.id && (
                    <tr key={`aprovar-${m.id}`}>
                      <td colSpan={7} className="px-5 py-4 bg-emerald-50 border-t border-emerald-200">
                        <div className="space-y-3 max-w-xl">
                          {m.observacao && (
                            <div className="flex gap-2.5 bg-emerald-100 border border-emerald-200 rounded-lg px-3.5 py-3">
                              <Info size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-0.5">Observação do engenheiro</p>
                                <p className="text-sm text-emerald-900">{m.observacao}</p>
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                              Observação (opcional)
                            </label>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Ex: Aprovado após verificação no canteiro"
                              value={obsGestor}
                              onChange={(e) => setObsGestor(e.target.value)}
                              className="w-full border border-emerald-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={aprovando}
                              onClick={() => aprovar({ m })}
                              className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3.5 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle size={12} />
                              {aprovando ? 'Aprovando...' : 'Confirmar aprovação'}
                            </button>
                            <button
                              onClick={() => { setAprovandoId(null); setObsGestor('') }}
                              className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Painel de rejeição inline */}
                  {rejeitandoId?.id === m.id && (
                    <tr key={`rejeitar-${m.id}`}>
                      <td colSpan={7} className="px-5 py-3 bg-orange-50 border-t border-orange-100">
                        <div className="flex items-center gap-3 max-w-xl">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Motivo da rejeição (mínimo 10 caracteres)"
                            value={motivoRejeitar}
                            onChange={(e) => setMotivoRejeitar(e.target.value)}
                            className="flex-1 border border-orange-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                          <button
                            disabled={motivoRejeitar.length < 10 || rejeitando}
                            onClick={() => rejeitar({ m })}
                            className="text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Confirmar rejeição
                          </button>
                          <button
                            onClick={() => setRejeitandoId(null)}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5"
                          >
                            Voltar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
