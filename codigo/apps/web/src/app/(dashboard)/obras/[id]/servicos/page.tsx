'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
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

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/obras" className="hover:text-slate-800">Obras</Link>
        <span className="mx-2">/</span>
        <Link href={`/obras/${id}`} className="hover:text-slate-800">Detalhe</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Serviços</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Serviços</h1>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Novo serviço
          </button>
        )}
      </div>

      {formAberto && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-5 mb-6"
        >
          <h2 className="font-semibold text-slate-900 mb-4">Cadastrar serviço</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input
                type="text"
                placeholder="Ex: Assentamento de piso"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
              <select
                value={form.unidade_medida}
                onChange={(e) => setForm((f) => ({ ...f, unidade_medida: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor por unidade (R$)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={form.valor_pagamento}
                onChange={(e) => setForm((f) => ({ ...f, valor_pagamento: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {erroForm && <p className="text-sm text-red-600 mb-3">{erroForm}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => { setFormAberto(false); setErroForm(''); setForm(EMPTY_FORM) }}
              className="text-slate-500 hover:text-slate-800 text-sm px-3 py-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isLoading && <LoadingSpinner />}
      {isError && <p className="text-red-600 text-sm">Erro ao carregar serviços.</p>}

      {servicos && servicos.length === 0 && !formAberto && (
        <p className="text-slate-500 text-sm">Nenhum serviço cadastrado. Clique em "Novo serviço" para começar.</p>
      )}

      {servicos && servicos.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Unidade</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Valor por unidade</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicos.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{s.unidade_medida}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {s.valor_pagamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        s.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
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
