'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, ChevronRight, X } from 'lucide-react'
import { api } from '@/lib/api'
import type { Obra } from '@brain-master/shared/tipos'

const EMPTY_FORM = {
  nome: '',
  cliente: '',
  endereco: '',
  data_inicio: '',
  data_prev_fim: '',
  valor_contrato: '',
  lucro_esperado: '',
}

async function criarObra(payload: Record<string, unknown>): Promise<Obra> {
  const { data } = await api.post('/api/v1/obras', payload)
  return data
}

export default function NovaObraPage() {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) return setErro('Nome da obra é obrigatório.')

    const payload: Record<string, unknown> = { nome: form.nome.trim() }
    if (form.cliente.trim()) payload.cliente = form.cliente.trim()
    if (form.endereco.trim()) payload.endereco = form.endereco.trim()
    if (form.data_inicio) payload.data_inicio = form.data_inicio
    if (form.data_prev_fim) payload.data_prev_fim = form.data_prev_fim
    if (form.valor_contrato && Number(form.valor_contrato) > 0)
      payload.valor_contrato = Number(form.valor_contrato)
    if (form.lucro_esperado && Number(form.lucro_esperado) > 0)
      payload.lucro_esperado = Number(form.lucro_esperado)

    setLoading(true)
    try {
      const obra = await criarObra(payload)
      router.push(`/obras/${obra.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao criar obra.'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
        <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Nova obra</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nova obra</h1>
          <p className="text-slate-400 text-sm">Preencha os dados para cadastrar</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Nome da obra <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Residência João Silva"
                value={form.nome}
                onChange={set('nome')}
                autoFocus
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Cliente
              </label>
              <input
                type="text"
                placeholder="Nome do contratante"
                value={form.cliente}
                onChange={set('cliente')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Endereço
              </label>
              <input
                type="text"
                placeholder="Rua, número, bairro"
                value={form.endereco}
                onChange={set('endereco')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Datas */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Data de início
              </label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={set('data_inicio')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Previsão de término
              </label>
              <input
                type="date"
                value={form.data_prev_fim}
                onChange={set('data_prev_fim')}
                min={form.data_inicio || undefined}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              />
            </div>

            {/* Orçamento */}
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 border-t border-slate-100 pt-4">
                Orçamento (opcional)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Valor do contrato (R$)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={form.valor_contrato}
                    onChange={set('valor_contrato')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1">Total recebido pelo cliente</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Lucro esperado (R$)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={form.lucro_esperado}
                    onChange={set('lucro_esperado')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Orçamento para custos:{' '}
                    {form.valor_contrato && form.lucro_esperado && Number(form.valor_contrato) > 0
                      ? (Number(form.valor_contrato) - Number(form.lucro_esperado)).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Criando...' : 'Criar obra'}
            </button>
            <Link
              href="/obras"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
