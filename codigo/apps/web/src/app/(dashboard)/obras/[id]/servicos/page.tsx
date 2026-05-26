'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Wrench, Plus, X } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Servico } from '@brain-master/shared/tipos'

const UNIDADES = ['M2', 'ML', 'M3', 'UN', 'KG', 'HORA', 'PECA'] as const

async function fetchServicos(obraId: string): Promise<Servico[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/servicos`)
  return data
}

async function criarServico(
  obraId: string,
  payload: { nome: string; unidade_medida: string; valor_pagamento: number },
): Promise<Servico> {
  const { data } = await api.post(`/api/v1/obras/${obraId}/servicos`, payload)
  return data
}

const EMPTY_FORM = { nome: '', unidade_medida: 'M2', valor_pagamento: '' }

export default function ServicosPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()

  const { data: servicos, isLoading, isError } = useQuery({
    queryKey: ['servicos', id],
    queryFn: () => fetchServicos(id),
  })

  const [form, setForm] = useState(EMPTY_FORM)
  const [formAberto, setFormAberto] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const { mutate: criar, isPending } = useMutation({
    mutationFn: () =>
      criarServico(id, {
        nome: form.nome.trim(),
        unidade_medida: form.unidade_medida,
        valor_pagamento: Number(form.valor_pagamento),
      }),
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
    const valor = Number(form.valor_pagamento)
    if (!valor || valor <= 0) return setErroForm('Valor deve ser maior que zero.')
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Unidade</label>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Valor por unidade (R$)
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
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Unidade</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor por unidade</th>
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicos.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{s.nome}</td>
                  <td className="px-5 py-4">
                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded">
                      {s.unidade_medida}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900">
                    {s.valor_pagamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                      s.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
