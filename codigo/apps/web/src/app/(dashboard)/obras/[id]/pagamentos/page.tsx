'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Banknote, CheckCircle, X } from 'lucide-react'
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

const FORMAS_PAGAMENTO = ['PIX', 'Dinheiro', 'Transferência', 'Cheque']

interface RealizarBody {
  forma_pagamento: string
  data_pagamento?: string
  observacao?: string
}

async function fetchPagamentos(obraId: string): Promise<Pagamento[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos`)
  return data
}

async function realizarPagamento(obraId: string, pagamentoId: string, body: RealizarBody) {
  const { data } = await api.patch(`/api/v1/obras/${obraId}/pagamentos/${pagamentoId}/realizar`, body)
  return data
}

export default function PagamentosPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const [realizandoId, setRealizandoId] = useState<string | null>(null)
  const [forma, setForma] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erroForma, setErroForma] = useState(false)

  const { data: pagamentos, isLoading, isError } = useQuery({
    queryKey: ['pagamentos', id],
    queryFn: () => fetchPagamentos(id),
  })

  const { mutate: realizar, isPending: confirmando } = useMutation({
    mutationFn: () => realizarPagamento(id, realizandoId!, {
      forma_pagamento: forma,
      data_pagamento: dataPagamento || undefined,
      observacao: observacao || undefined,
    }),
    onSuccess: () => {
      fecharPainel()
      qc.invalidateQueries({ queryKey: ['pagamentos', id] })
    },
  })

  function abrirPainel(pagamentoId: string) {
    setRealizandoId(pagamentoId)
    setForma('')
    setDataPagamento(new Date().toISOString().split('T')[0])
    setObservacao('')
    setErroForma(false)
  }

  function fecharPainel() {
    setRealizandoId(null)
    setForma('')
    setDataPagamento('')
    setObservacao('')
    setErroForma(false)
  }

  function handleConfirmar() {
    if (!forma) { setErroForma(true); return }
    realizar()
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Erro ao carregar pagamentos.
    </div>
  )

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <Link href={`/obras/${id}`} className="hover:text-slate-700 transition-colors">Detalhe</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Pagamentos</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Banknote size={18} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pagamentos</h1>
            {pagamentos && (
              <p className="text-sm text-slate-400">{pagamentos.length} registro{pagamentos.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        <Link
          href={`/obras/${id}/pagamentos/calcular`}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Banknote size={15} />
          Calcular pagamentos
        </Link>
      </div>

      {!pagamentos?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Banknote size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Nenhum pagamento registrado</p>
          <p className="text-slate-400 text-sm">Clique em "Calcular pagamentos" para gerar o primeiro.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Funcionário</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Período</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor total</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Forma / Data</th>
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagamentos.map((p) => (
                <>
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${realizandoId === p.id ? 'bg-green-50/40' : ''}`}>
                    <td className="px-5 py-4 font-medium text-slate-900">{p.funcionario?.nome ?? p.funcionario_id}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {new Date(p.periodo_inicio).toLocaleDateString('pt-BR')} — {new Date(p.periodo_fim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900">
                      {p.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {p.status === 'realizado' ? (
                        <div>
                          <span className="font-medium text-slate-700">{p.forma_pagamento}</span>
                          {p.data_pagamento && (
                            <span className="block text-slate-400">
                              {new Date(p.data_pagamento).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CLASS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {p.status === 'pendente' && (
                        <button
                          onClick={() => realizandoId === p.id ? fecharPainel() : abrirPainel(p.id)}
                          className="inline-flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle size={13} />
                          Realizar
                        </button>
                      )}
                    </td>
                  </tr>

                  {realizandoId === p.id && (
                    <tr key={`${p.id}-painel`}>
                      <td colSpan={6} className="px-5 py-4 bg-green-50 border-t border-green-200">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">
                            Confirmar pagamento — {p.funcionario?.nome ?? ''}
                          </p>
                          <button onClick={fecharPainel} className="text-slate-400 hover:text-slate-600">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Forma de pagamento <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={forma}
                              onChange={(e) => { setForma(e.target.value); setErroForma(false) }}
                              className={`w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white ${erroForma ? 'border-red-400' : 'border-slate-300'}`}
                            >
                              <option value="">Selecionar...</option>
                              {FORMAS_PAGAMENTO.map((f) => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                            {erroForma && <p className="text-xs text-red-500 mt-0.5">Obrigatório</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Data do pagamento</label>
                            <input
                              type="date"
                              value={dataPagamento}
                              onChange={(e) => setDataPagamento(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Observação</label>
                            <input
                              type="text"
                              value={observacao}
                              onChange={(e) => setObservacao(e.target.value)}
                              placeholder="Opcional"
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleConfirmar}
                            disabled={confirmando}
                            className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors"
                          >
                            {confirmando ? 'Confirmando...' : 'Confirmar pagamento'}
                          </button>
                          <button
                            onClick={fecharPainel}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Cancelar
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
