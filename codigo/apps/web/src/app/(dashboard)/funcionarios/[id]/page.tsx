'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronRight, Users, Pencil, X, BarChart2, Search,
  Briefcase, Banknote, CheckCircle,
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Funcionario, Obra, TipoPagamento } from '@brain-master/shared/tipos'
import type { ProducaoResult } from '@/types/producao'

const TIPO_LABEL: Record<TipoPagamento, string> = {
  POR_PRODUCAO: 'Por produção',
  DIARIA: 'Diária',
  HORA: 'Por hora',
  MISTO: 'Misto',
}

const TIPOS: TipoPagamento[] = ['POR_PRODUCAO', 'DIARIA', 'HORA', 'MISTO']

async function fetchFuncionario(id: string): Promise<Funcionario> {
  const { data } = await api.get(`/api/v1/funcionarios/${id}`)
  return data.data
}

async function fetchObras(): Promise<Obra[]> {
  const { data } = await api.get('/api/v1/obras')
  return data
}

async function editarFuncionario(id: string, payload: Partial<Funcionario>): Promise<Funcionario> {
  const { data } = await api.patch(`/api/v1/funcionarios/${id}`, payload)
  return data.data
}

async function fetchProducao(id: string, inicio: string, fim: string): Promise<ProducaoResult> {
  const { data } = await api.get(`/api/v1/funcionarios/${id}/producao`, { params: { inicio, fim } })
  return data.data
}

export default function FuncionarioDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()

  const { data: funcionario, isLoading, isError } = useQuery({
    queryKey: ['funcionario', id],
    queryFn: () => fetchFuncionario(id),
  })

  // --- Estado do form de edição ---
  const [editAberto, setEditAberto] = useState(false)
  const [editForm, setEditForm] = useState<{
    nome: string
    funcao: string
    tipo_pagamento: TipoPagamento
    valor_base: string
    obra_id: string
    ativo: boolean
  } | null>(null)
  const [erroEdit, setErroEdit] = useState('')

  function abrirEdit() {
    if (!funcionario) return
    setEditForm({
      nome: funcionario.nome,
      funcao: funcionario.funcao ?? '',
      tipo_pagamento: funcionario.tipo_pagamento,
      valor_base: funcionario.valor_base?.toString() ?? '',
      obra_id: funcionario.obra_id ?? '',
      ativo: funcionario.ativo,
    })
    setEditAberto(true)
    setErroEdit('')
  }

  function fecharEdit() {
    setEditAberto(false)
    setEditForm(null)
    setErroEdit('')
  }

  const { data: obras } = useQuery({
    queryKey: ['obras'],
    queryFn: fetchObras,
    enabled: editAberto,
  })

  const { mutate: salvarEdicao, isPending: salvando } = useMutation({
    mutationFn: () => {
      if (!editForm) throw new Error()
      const payload: Record<string, unknown> = {
        nome: editForm.nome.trim(),
        tipo_pagamento: editForm.tipo_pagamento,
        ativo: editForm.ativo,
      }
      if (editForm.funcao.trim()) payload.funcao = editForm.funcao.trim()
      if (editForm.obra_id) payload.obra_id = editForm.obra_id
      if (editForm.valor_base && Number(editForm.valor_base) > 0) payload.valor_base = Number(editForm.valor_base)
      return editarFuncionario(id, payload as Partial<Funcionario>)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funcionario', id] })
      qc.invalidateQueries({ queryKey: ['funcionarios'] })
      fecharEdit()
    },
    onError: (err: any) => {
      setErroEdit(err?.response?.data?.message ?? 'Erro ao salvar alterações.')
    },
  })

  function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault()
    setErroEdit('')
    if (!editForm?.nome.trim()) return setErroEdit('Nome é obrigatório.')
    salvarEdicao()
  }

  // --- Estado da consulta de produção ---
  const hoje = new Date().toISOString().split('T')[0]
  const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [periodo, setPeriodo] = useState({ inicio: primeiroDiaMes, fim: hoje })
  const [consultarAtivado, setConsultarAtivado] = useState(false)

  const {
    data: producao,
    isFetching: carregandoProducao,
    isError: erroProducao,
    refetch: refetchProducao,
  } = useQuery({
    queryKey: ['producao', id, periodo.inicio, periodo.fim],
    queryFn: () => fetchProducao(id, periodo.inicio, periodo.fim),
    enabled: consultarAtivado,
  })

  function handleConsultar(e: React.FormEvent) {
    e.preventDefault()
    if (!consultarAtivado) {
      setConsultarAtivado(true)
    } else {
      refetchProducao()
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (isError || !funcionario) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Funcionário não encontrado.
    </div>
  )

  const precisaValorBase = editForm?.tipo_pagamento !== 'POR_PRODUCAO'

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Link href="/funcionarios" className="hover:text-slate-700 transition-colors">Funcionários</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">{funcionario.nome}</span>
      </nav>

      {/* Header do funcionário */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold text-lg">
                {funcionario.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{funcionario.nome}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  funcionario.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {funcionario.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {funcionario.funcao && (
                <p className="text-slate-500 text-sm mt-0.5">{funcionario.funcao}</p>
              )}
            </div>
          </div>

          {!editAberto && (
            <button
              onClick={abrirEdit}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <Pencil size={14} />
              Editar dados
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <Banknote size={15} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Tipo de pagamento</p>
              <p className="text-sm font-medium text-slate-800">{TIPO_LABEL[funcionario.tipo_pagamento]}</p>
            </div>
          </div>
          {funcionario.valor_base != null && (
            <div className="flex items-start gap-2">
              <Briefcase size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Valor base</p>
                <p className="text-sm font-medium text-slate-800">
                  {funcionario.valor_base.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Users size={15} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Empresa</p>
              <p className="text-sm font-medium text-slate-800">Vinculado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form de edição expansível */}
      {editAberto && editForm && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Editar dados</h2>
            <button
              onClick={fecharEdit}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmitEdit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm((f) => f && ({ ...f, nome: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Função
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pedreiro"
                  value={editForm.funcao}
                  onChange={(e) => setEditForm((f) => f && ({ ...f, funcao: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Tipo de pagamento
                </label>
                <select
                  value={editForm.tipo_pagamento}
                  onChange={(e) => setEditForm((f) => f && ({ ...f, tipo_pagamento: e.target.value as TipoPagamento, valor_base: '' }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{TIPO_LABEL[t]}</option>
                  ))}
                </select>
              </div>

              {precisaValorBase && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Valor base (R$)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={editForm.valor_base}
                    onChange={(e) => setEditForm((f) => f && ({ ...f, valor_base: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Obra vinculada
                </label>
                <select
                  value={editForm.obra_id}
                  onChange={(e) => setEditForm((f) => f && ({ ...f, obra_id: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Sem obra específica</option>
                  {obras?.map((o) => (
                    <option key={o.id} value={o.id}>{o.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editForm.ativo}
                    onChange={(e) => setEditForm((f) => f && ({ ...f, ativo: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">Funcionário ativo</span>
                </label>
              </div>
            </div>

            {erroEdit && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                <p className="text-sm text-red-600">{erroEdit}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <CheckCircle size={14} />
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button
                type="button"
                onClick={fecharEdit}
                className="text-slate-500 hover:text-slate-800 text-sm px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Consulta de produção */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <BarChart2 size={18} className="text-green-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Produção por período</h2>
        </div>

        <form onSubmit={handleConsultar} className="flex flex-wrap items-end gap-3 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Data início
            </label>
            <input
              type="date"
              value={periodo.inicio}
              onChange={(e) => { setPeriodo((p) => ({ ...p, inicio: e.target.value })); setConsultarAtivado(false) }}
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Data fim
            </label>
            <input
              type="date"
              value={periodo.fim}
              onChange={(e) => { setPeriodo((p) => ({ ...p, fim: e.target.value })); setConsultarAtivado(false) }}
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={carregandoProducao}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Search size={14} />
            {carregandoProducao ? 'Consultando...' : 'Consultar'}
          </button>
        </form>

        {erroProducao && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            <p className="text-sm text-red-600">Erro ao consultar produção. Verifique o período.</p>
          </div>
        )}

        {producao && !carregandoProducao && (
          <div>
            {/* Cards de totais */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Valor total</p>
                <p className="text-2xl font-bold text-green-700">
                  {producao.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Medições</p>
                <p className="text-2xl font-bold text-blue-700">{producao.total_medicoes}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Período</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(producao.periodo_inicio).toLocaleDateString('pt-BR')} —{' '}
                  {new Date(producao.periodo_fim).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Breakdown por serviço */}
            {producao.por_servico.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Detalhamento por serviço</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Serviço</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Quantidade</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {producao.por_servico.map((s) => (
                        <tr key={s.servico_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-900">{s.servico_nome}</td>
                          <td className="px-5 py-4 text-right text-slate-600">
                            {s.quantidade_total} <span className="text-slate-400 text-xs">{s.unidade_medida}</span>
                          </td>
                          <td className="px-5 py-4 text-right font-bold text-slate-900">
                            {s.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-slate-500 font-medium mb-1">Nenhuma produção registrada</p>
                <p className="text-slate-400 text-sm">Sem medições ativas para este funcionário no período.</p>
              </div>
            )}
          </div>
        )}

        {!producao && !carregandoProducao && !erroProducao && (
          <p className="text-slate-400 text-sm text-center py-6">
            Selecione o período e clique em Consultar para ver a produção.
          </p>
        )}
      </div>
    </div>
  )
}
