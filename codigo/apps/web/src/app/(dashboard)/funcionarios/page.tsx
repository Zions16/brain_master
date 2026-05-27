'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { Users, Plus, X, ChevronRight, Copy, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Funcionario, Obra, TipoPagamento } from '@brain-master/shared/tipos'

const TIPO_LABEL: Record<TipoPagamento, string> = {
  POR_PRODUCAO: 'Por produção',
  DIARIA: 'Diária',
  HORA: 'Por hora',
  MISTO: 'Misto',
}

const TIPOS: TipoPagamento[] = ['POR_PRODUCAO', 'DIARIA', 'HORA', 'MISTO']

const EMPTY_FORM = {
  nome: '',
  funcao: '',
  tipo_pagamento: 'POR_PRODUCAO' as TipoPagamento,
  valor_base: '',
  obra_id: '',
}

async function fetchFuncionarios(): Promise<Funcionario[]> {
  const { data } = await api.get('/api/v1/funcionarios')
  return data
}

async function fetchObras(): Promise<Obra[]> {
  const { data } = await api.get('/api/v1/obras')
  return data
}

async function criarFuncionario(payload: {
  nome: string
  funcao?: string
  tipo_pagamento: TipoPagamento
  valor_base?: number
  obra_id?: string
}): Promise<Funcionario> {
  const { data } = await api.post('/api/v1/funcionarios', payload)
  return data
}

function TokenCopiavel({ token }: { token?: string }) {
  const [copiado, setCopiado] = useState(false)
  if (!token) return <span className="text-slate-300 text-xs">—</span>

  function copiar() {
    navigator.clipboard.writeText(token!)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <button
      onClick={copiar}
      className="inline-flex items-center gap-1.5 font-mono text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
    >
      {token}
      {copiado ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} className="text-slate-400" />}
    </button>
  )
}

export default function FuncionariosPage() {
  const qc = useQueryClient()
  const perfil = useAuthStore((s) => s.usuario?.perfil)
  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [erroForm, setErroForm] = useState('')

  const { data: funcionarios, isLoading, isError } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: fetchFuncionarios,
  })

  const { data: obras } = useQuery({
    queryKey: ['obras'],
    queryFn: fetchObras,
    enabled: formAberto,
  })

  const { mutate: criar, isPending } = useMutation({
    mutationFn: () => {
      const payload: Parameters<typeof criarFuncionario>[0] = {
        nome: form.nome.trim(),
        tipo_pagamento: form.tipo_pagamento,
      }
      if (form.funcao.trim()) payload.funcao = form.funcao.trim()
      if (form.obra_id) payload.obra_id = form.obra_id
      if (form.valor_base && Number(form.valor_base) > 0) payload.valor_base = Number(form.valor_base)
      return criarFuncionario(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funcionarios'] })
      setForm(EMPTY_FORM)
      setFormAberto(false)
      setErroForm('')
    },
    onError: (err: any) => {
      setErroForm(err?.response?.data?.message ?? 'Erro ao cadastrar funcionário.')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErroForm('')
    if (!form.nome.trim()) return setErroForm('Nome é obrigatório.')
    criar()
  }

  function fecharForm() {
    setFormAberto(false)
    setErroForm('')
    setForm(EMPTY_FORM)
  }

  const precisaValorBase = form.tipo_pagamento !== 'POR_PRODUCAO'

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
      Erro ao carregar funcionários.
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Funcionários</h1>
            <p className="text-sm text-slate-400">
              {funcionarios?.length ?? 0} cadastrado{funcionarios?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Novo funcionário
          </button>
        )}
      </div>

      {formAberto && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Cadastrar funcionário</h2>
            <button
              onClick={fecharForm}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Função
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pedreiro, Eletricista"
                  value={form.funcao}
                  onChange={(e) => setForm((f) => ({ ...f, funcao: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Tipo de pagamento <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.tipo_pagamento}
                  onChange={(e) => setForm((f) => ({ ...f, tipo_pagamento: e.target.value as TipoPagamento, valor_base: '' }))}
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
                    value={form.valor_base}
                    onChange={(e) => setForm((f) => ({ ...f, valor_base: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className={precisaValorBase ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Vincular à obra
                </label>
                <select
                  value={form.obra_id}
                  onChange={(e) => setForm((f) => ({ ...f, obra_id: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Sem obra específica</option>
                  {obras?.map((o) => (
                    <option key={o.id} value={o.id}>{o.nome}</option>
                  ))}
                </select>
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
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {isPending ? 'Salvando...' : 'Salvar funcionário'}
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

      {!funcionarios?.length && !formAberto ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Users size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Nenhum funcionário cadastrado</p>
          <p className="text-slate-400 text-sm">Clique em "Novo funcionário" para adicionar o primeiro.</p>
        </div>
      ) : funcionarios && funcionarios.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Função</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Tipo de pagamento</th>
                {perfil === 'GESTOR' && (
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Token</th>
                )}
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {funcionarios.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{f.nome}</td>
                  <td className="px-5 py-4 text-slate-500">{f.funcao ?? '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{TIPO_LABEL[f.tipo_pagamento]}</td>
                  {perfil === 'GESTOR' && (
                    <td className="px-5 py-4"><TokenCopiavel token={f.token_acesso} /></td>
                  )}
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                      f.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {f.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/funcionarios/${f.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Ver detalhe
                      <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
