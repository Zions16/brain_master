'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Wrench, Plus, X, TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Servico, TipoCobranca } from '@brain-master/shared/tipos'

const UNIDADES = ['M2', 'ML', 'M3', 'UN', 'KG', 'HORA', 'PECA'] as const

const TIPO_COBRANCA_LABEL: Record<TipoCobranca, string> = {
  empreitada: 'Empreitada',
  diaria: 'Diária',
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function fetchServicos(obraId: string): Promise<Servico[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/servicos`)
  return data
}

async function criarServico(
  obraId: string,
  payload: { nome: string; unidade_medida: string; tipo_cobranca: TipoCobranca; valor_pagamento: number; valor_cobranca?: number },
): Promise<Servico> {
  const { data } = await api.post(`/api/v1/obras/${obraId}/servicos`, payload)
  return data
}

const EMPTY_FORM = { nome: '', unidade_medida: 'M2', tipo_cobranca: 'empreitada' as TipoCobranca, valor_pagamento: '', valor_cobranca: '' }

export default function ServicosPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const perfil = useAuthStore((s) => s.usuario?.perfil)
  const verFinanceiro = perfil === 'GESTOR' || perfil === 'FINANCEIRO'

  const { data: servicos, isLoading, isError } = useQuery({
    queryKey: ['servicos', id],
    queryFn: () => fetchServicos(id),
  })

  const [form, setForm] = useState(EMPTY_FORM)
  const [formAberto, setFormAberto] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const { mutate: criar, isPending } = useMutation({
    mutationFn: () => {
      const payload: { nome: string; unidade_medida: string; tipo_cobranca: TipoCobranca; valor_pagamento: number; valor_cobranca?: number } = {
        nome: form.nome.trim(),
        unidade_medida: form.unidade_medida,
        tipo_cobranca: form.tipo_cobranca,
        valor_pagamento: Number(form.valor_pagamento),
      }
      if (form.valor_cobranca !== '') {
        payload.valor_cobranca = Number(form.valor_cobranca)
      }
      return criarServico(id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servicos', id] })
      setForm(EMPTY_FORM)
      setFormAberto(false)
      setErroForm('')
    },
    onError: (err: any) => {
      setErroForm(err?.response?.data?.message ?? 'Erro ao cadastrar serviço.')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErroForm('')
    if (!form.nome.trim()) return setErroForm('Nome é obrigatório.')
    const pagamento = Number(form.valor_pagamento)
    if (!pagamento || pagamento <= 0) return setErroForm('Valor de pagamento deve ser maior que zero.')
    if (form.valor_cobranca !== '') {
      const cobranca = Number(form.valor_cobranca)
      if (!cobranca || cobranca <= 0) return setErroForm('Valor de cobrança deve ser maior que zero.')
    }
    criar()
  }

  function fecharForm() {
    setFormAberto(false)
    setErroForm('')
    setForm(EMPTY_FORM)
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <Link href={`/obras/${id}`} className="hover:text-slate-700 transition-colors">Detalhe</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Serviços</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
            <Wrench size={18} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Serviços</h1>
            {servicos && (
              <p className="text-sm text-slate-400">{servicos.length} serviço{servicos.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Novo serviço
          </button>
        )}
      </div>

      {formAberto && (
        <div className="bg-white border border-violet-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Cadastrar serviço</h2>
            <button
              onClick={fecharForm}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Linha 1: Nome + Unidade + Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Assentamento de piso"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Unidade de medida</label>
                <select
                  value={form.unidade_medida}
                  onChange={(e) => setForm((f) => ({ ...f, unidade_medida: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tipo de cobrança</label>
                <select
                  value={form.tipo_cobranca}
                  onChange={(e) => setForm((f) => ({ ...f, tipo_cobranca: e.target.value as TipoCobranca }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                >
                  <option value="empreitada">Empreitada (por produção)</option>
                  <option value="diaria">Diária (por dia)</option>
                </select>
              </div>
            </div>

            {/* Linha 2: Preços */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Valor pago ao funcionário (R$)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={form.valor_pagamento}
                  onChange={(e) => setForm((f) => ({ ...f, valor_pagamento: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Custo por unidade produzida</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Valor cobrado do cliente (R$)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00 (opcional)"
                  value={form.valor_cobranca}
                  onChange={(e) => setForm((f) => ({ ...f, valor_cobranca: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Receita por unidade produzida</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Margem por unidade
                </label>
                <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 min-h-[42px] flex items-center">
                  {form.valor_cobranca !== '' && form.valor_pagamento !== '' ? (
                    (() => {
                      const margem = Number(form.valor_cobranca) - Number(form.valor_pagamento)
                      return (
                        <span className={`font-bold ${margem >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {margem >= 0 ? '+' : ''}{brl(margem)}
                        </span>
                      )
                    })()
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Calculado automaticamente</p>
              </div>
            </div>

            {erroForm && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                <p className="text-sm text-red-600">{erroForm}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {isPending ? 'Salvando...' : 'Salvar serviço'}
              </button>
              <button
                type="button"
                onClick={fecharForm}
                className="text-slate-500 hover:text-slate-800 text-sm px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <LoadingSpinner />}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Erro ao carregar serviços.
        </div>
      )}

      {servicos && servicos.length === 0 && !formAberto && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Wrench size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Nenhum serviço cadastrado</p>
          <p className="text-slate-400 text-sm">Clique em "Novo serviço" para adicionar o primeiro.</p>
        </div>
      )}

      {servicos && servicos.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Serviço</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Tipo</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Unidade</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  <span className="flex items-center justify-end gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                    Pago ao func.
                  </span>
                </th>
                {verFinanceiro && (
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">
                    <span className="flex items-center justify-end gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      Cobrado do cliente
                    </span>
                  </th>
                )}
                {verFinanceiro && (
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Margem/unid.</th>
                )}
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicos.map((s) => {
                const margem =
                  s.valor_cobranca != null
                    ? s.valor_cobranca - s.valor_pagamento
                    : null
                const margemPct =
                  s.valor_cobranca != null && s.valor_cobranca > 0
                    ? ((s.valor_cobranca - s.valor_pagamento) / s.valor_cobranca) * 100
                    : null

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{s.nome}</td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        s.tipo_cobranca === 'diaria'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {TIPO_COBRANCA_LABEL[s.tipo_cobranca]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded">
                        {s.unidade_medida}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-700">
                      {brl(s.valor_pagamento)}
                    </td>
                    {verFinanceiro && (
                      <td className="px-5 py-4 text-right font-semibold text-blue-700 hidden sm:table-cell">
                        {s.valor_cobranca != null
                          ? brl(s.valor_cobranca)
                          : <span className="text-slate-300 font-normal">—</span>
                        }
                      </td>
                    )}
                    {verFinanceiro && <td className="px-5 py-4 text-right hidden md:table-cell">
                      {margem !== null ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {margem >= 0
                            ? <TrendingUp size={13} className="text-emerald-500" />
                            : <TrendingDown size={13} className="text-red-500" />
                          }
                          <span className={`font-bold ${margem >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {margem >= 0 ? '+' : ''}{brl(margem)}
                          </span>
                          {margemPct !== null && (
                            <span className={`text-xs ${margem >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                              ({margemPct.toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                        s.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Footer com totalizadores se houver valor_cobranca */}
            {servicos.some((s) => s.valor_cobranca != null) && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/80">
                  <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Média entre serviços ativos
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-slate-700">
                    {brl(
                      servicos.filter((s) => s.ativo).reduce((s, v) => s + v.valor_pagamento, 0) /
                        (servicos.filter((s) => s.ativo).length || 1)
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-blue-700 hidden sm:table-cell">
                    {(() => {
                      const comCobranca = servicos.filter((s) => s.ativo && s.valor_cobranca != null)
                      if (!comCobranca.length) return <span className="text-slate-300">—</span>
                      return brl(
                        comCobranca.reduce((s, v) => s + (v.valor_cobranca ?? 0), 0) / comCobranca.length
                      )
                    })()}
                  </td>
                  <td className="px-5 py-3 text-right hidden md:table-cell">
                    {(() => {
                      const comCobranca = servicos.filter((s) => s.ativo && s.valor_cobranca != null)
                      if (!comCobranca.length) return <span className="text-slate-300">—</span>
                      const mediaM = comCobranca.reduce(
                        (s, v) => s + ((v.valor_cobranca ?? 0) - v.valor_pagamento),
                        0
                      ) / comCobranca.length
                      return (
                        <span className={`font-bold text-xs ${mediaM >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {mediaM >= 0 ? '+' : ''}{brl(mediaM)}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="hidden md:table-cell" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}
