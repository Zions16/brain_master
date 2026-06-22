'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronRight, Ruler, Plus, X, Users, Info, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/auth'
import type { Funcionario, Medicao, Servico, StatusMedicao } from '@brain-master/shared/tipos'

const STATUS_LABEL: Record<StatusMedicao, string> = {
  pendente: 'Pendente',
  ativa: 'Ativa',
  corrigida: 'Corrigida',
  cancelada: 'Cancelada',
  pendente_aprovacao: 'Aguard. aprovação',
}

const STATUS_CLASS: Record<StatusMedicao, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  ativa: 'bg-green-100 text-green-700',
  corrigida: 'bg-blue-100 text-blue-700',
  cancelada: 'bg-red-100 text-red-700',
  pendente_aprovacao: 'bg-orange-100 text-orange-700',
}

async function fetchMedicoes(obraId: string): Promise<Medicao[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/medicoes`)
  return data
}

async function fetchServicos(obraId: string): Promise<Servico[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/servicos`)
  return data
}

async function fetchFuncionarios(obraId: string): Promise<Funcionario[]> {
  const { data } = await api.get('/api/v1/funcionarios', { params: { obra_id: obraId } })
  return data
}

async function criarMedicao(
  obraId: string,
  payload: { funcionario_id: string; servico_id: string; quantidade: number; data: string; observacao?: string; emergencia?: boolean },
): Promise<Medicao> {
  const { data } = await api.post(`/api/v1/obras/${obraId}/medicoes`, payload)
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

async function cancelarMedicao(obraId: string, medicaoId: string, motivo: string): Promise<Medicao> {
  const { data } = await api.patch(`/api/v1/obras/${obraId}/medicoes/${medicaoId}/cancelar`, { motivo })
  return data
}

const hoje = new Date().toISOString().split('T')[0]

const EMPTY_FORM = {
  funcionario_id: '',
  servico_id: '',
  quantidade: '',
  data: hoje,
  observacao: '',
}

export default function MedicoesPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const searchParams = useSearchParams()
  const usuario = useAuthStore((s) => s.usuario)
  const isGestor = usuario?.perfil === 'GESTOR'
  const isEngenheiro = usuario?.perfil === 'ENGENHEIRO'

  // Abre o form automaticamente quando vem de ?nova=1 (botão "Registrar medição" do engenheiro)
  useEffect(() => {
    if (searchParams.get('nova') === '1') setFormAberto(true)
  }, [searchParams])

  const { data: medicoes, isLoading, isError } = useQuery({
    queryKey: ['medicoes', id],
    queryFn: () => fetchMedicoes(id),
  })

  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [modoGrupo, setModoGrupo] = useState(false)
  const [grupoSelecionados, setGrupoSelecionados] = useState<string[]>([])
  const [erroForm, setErroForm] = useState('')
  const [grupoResultado, setGrupoResultado] = useState<{ total: number; falhas: number } | null>(null)

  // Cancelar inline
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [motivoCancel, setMotivoCancel] = useState('')

  // Aprovar inline
  const [aprovandoId, setAprovandoId] = useState<Medicao | null>(null)
  const [obsGestor, setObsGestor] = useState('')

  // Rejeitar inline
  const [rejeitandoId, setRejeitandoId] = useState<string | null>(null)
  const [motivoRejeitar, setMotivoRejeitar] = useState('')

  const { mutate: aprovar, isPending: aprovando } = useMutation({
    mutationFn: ({ medicaoId, observacaoGestor }: { medicaoId: string; observacaoGestor?: string }) =>
      aprovarMedicao(id, medicaoId, observacaoGestor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicoes', id] })
      setAprovandoId(null)
      setObsGestor('')
    },
  })

  const { mutate: rejeitar, isPending: rejeitando } = useMutation({
    mutationFn: ({ medicaoId, motivo }: { medicaoId: string; motivo: string }) =>
      rejeitarMedicao(id, medicaoId, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicoes', id] })
      setRejeitandoId(null)
      setMotivoRejeitar('')
    },
  })

  const { mutate: cancelar, isPending: cancelaEm } = useMutation({
    mutationFn: ({ medicaoId, motivo }: { medicaoId: string; motivo: string }) =>
      cancelarMedicao(id, medicaoId, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicoes', id] })
      setCancelando(null)
      setMotivoCancel('')
    },
  })

  const { data: servicos } = useQuery({
    queryKey: ['servicos', id],
    queryFn: () => fetchServicos(id),
    enabled: formAberto,
  })

  const { data: funcionarios } = useQuery({
    queryKey: ['funcionarios', id],
    queryFn: () => fetchFuncionarios(id),
    enabled: formAberto,
  })

  const funcionariosAtivos = funcionarios?.filter((f) => f.ativo) ?? []
  const servicosAtivos = servicos?.filter((s) => s.ativo) ?? []
  const servicoSelecionado = servicosAtivos.find((s) => s.id === form.servico_id)
  const isDiaria = servicoSelecionado?.tipo_cobranca === 'diaria'

  function toggleGrupo(fid: string) {
    setGrupoSelecionados((prev) =>
      prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid],
    )
  }

  const { mutate: criar, isPending } = useMutation({
    mutationFn: async () => {
      const quantidade = Number(form.quantidade)
      const payload = { servico_id: form.servico_id, quantidade, data: form.data, observacao: form.observacao || undefined }

      if (modoGrupo) {
        const results = await Promise.allSettled(
          grupoSelecionados.map((fid) => criarMedicao(id, { ...payload, funcionario_id: fid })),
        )
        const falhas = results.filter((r) => r.status === 'rejected').length
        setGrupoResultado({ total: grupoSelecionados.length, falhas })
        return results
      }

      return criarMedicao(id, { ...payload, funcionario_id: form.funcionario_id })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicoes', id] })
      setForm({ ...EMPTY_FORM, data: hoje })
      setGrupoSelecionados([])
      if (!grupoResultado?.falhas) {
        setFormAberto(false)
        setErroForm('')
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- erro do axios/react-query (boundary externo)
    onError: (err: any) => {
      setErroForm(err?.response?.data?.message ?? 'Erro ao registrar medição.')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErroForm('')
    setGrupoResultado(null)

    if (!form.servico_id) return setErroForm('Selecione um serviço.')
    const quantidade = Number(form.quantidade)
    if (!quantidade || quantidade <= 0) return setErroForm(isDiaria ? 'Informe os dias trabalhados.' : 'Quantidade deve ser maior que zero.')
    if (!form.data) return setErroForm('Informe a data.')

    if (modoGrupo) {
      if (grupoSelecionados.length === 0) return setErroForm('Selecione pelo menos um funcionário.')
    } else {
      if (!form.funcionario_id) return setErroForm('Selecione um funcionário.')
    }

    criar()
  }

  function fecharForm() {
    setFormAberto(false)
    setErroForm('')
    setGrupoResultado(null)
    setForm({ ...EMPTY_FORM, data: hoje })
    setGrupoSelecionados([])
    setModoGrupo(false)
  }

  function fecharAprovar() {
    setAprovandoId(null)
    setObsGestor('')
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        {isEngenheiro ? (
          <>
            <Link href="/engenheiro" className="hover:text-slate-700 transition-colors">Início</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800 font-medium">Medições</span>
          </>
        ) : (
          <>
            <Link href="/obras" className="hover:text-slate-700 transition-colors">Obras</Link>
            <ChevronRight size={14} />
            <Link href={`/obras/${id}`} className="hover:text-slate-700 transition-colors">Detalhe</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800 font-medium">Medições</span>
          </>
        )}
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Ruler size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Medições</h1>
            {medicoes && (
              <p className="text-sm text-slate-400">{medicoes.length} registro{medicoes.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        {!formAberto && (
          <button
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nova medição
          </button>
        )}
      </div>

      {formAberto && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Registrar medição</h2>
            <button
              onClick={fecharForm}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Toggle individual / grupo */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 mb-5 w-fit">
            <button
              type="button"
              onClick={() => { setModoGrupo(false); setGrupoSelecionados([]) }}
              className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                !modoGrupo ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => { setModoGrupo(true); setForm((f) => ({ ...f, funcionario_id: '' })) }}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                modoGrupo ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={13} />
              Grupo
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Serviço + Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Serviço <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.servico_id}
                  onChange={(e) => setForm((f) => ({ ...f, servico_id: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione...</option>
                  {servicosAtivos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({s.tipo_cobranca === 'diaria' ? 'Diária' : s.unidade_medida})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Funcionário (individual) + Quantidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {!modoGrupo && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Funcionário <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.funcionario_id}
                    onChange={(e) => setForm((f) => ({ ...f, funcionario_id: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Selecione...</option>
                    {funcionariosAtivos.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}{f.funcao ? ` — ${f.funcao}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  {isDiaria
                    ? 'Dias trabalhados'
                    : `Quantidade${servicoSelecionado ? ` (${servicoSelecionado.unidade_medida})` : ''}`}
                  {' '}<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={isDiaria ? 'Ex: 2' : 'Ex: 25.5'}
                  value={form.quantidade}
                  onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {servicoSelecionado && !isEngenheiro && (
                  <p className="text-xs text-slate-400 mt-1">
                    {isDiaria
                      ? `R$ ${servicoSelecionado.valor_pagamento.toFixed(2)}/dia por funcionário`
                      : `R$ ${servicoSelecionado.valor_pagamento.toFixed(2)} por ${servicoSelecionado.unidade_medida}`}
                  </p>
                )}
              </div>
            </div>

            {/* Grupo: checkboxes de funcionários */}
            {modoGrupo && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Funcionários <span className="text-red-500">*</span>
                  {grupoSelecionados.length > 0 && (
                    <span className="ml-2 text-blue-600 normal-case font-normal">
                      {grupoSelecionados.length} selecionado{grupoSelecionados.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {funcionariosAtivos.length === 0 && (
                    <p className="text-sm text-slate-400 col-span-2">Nenhum funcionário ativo encontrado.</p>
                  )}
                  {funcionariosAtivos.map((f) => (
                    <label key={f.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 rounded-md px-2 py-1.5 transition-colors">
                      <input
                        type="checkbox"
                        checked={grupoSelecionados.includes(f.id)}
                        onChange={() => toggleGrupo(f.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-800">
                        {f.nome}
                        {f.funcao && <span className="text-slate-400 ml-1 text-xs">({f.funcao})</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Observação */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Observação (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Produção referente ao bloco B"
                value={form.observacao}
                onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {isEngenheiro && (
              <div className="mb-4 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-3">
                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Sua medição será enviada para <span className="font-semibold">aprovação do gestor</span> antes de entrar no cálculo de pagamento.
                </p>
              </div>
            )}

            {erroForm && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                <p className="text-sm text-red-600">{erroForm}</p>
              </div>
            )}

            {grupoResultado && (
              <div className={`rounded-lg px-3 py-2.5 mb-4 border ${grupoResultado.falhas > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                <p className="text-sm font-medium">
                  {grupoResultado.falhas === 0
                    ? `${grupoResultado.total} medições registradas com sucesso.`
                    : `${grupoResultado.total - grupoResultado.falhas} de ${grupoResultado.total} registradas. ${grupoResultado.falhas} com erro.`}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {isPending
                  ? 'Registrando...'
                  : modoGrupo && grupoSelecionados.length > 1
                    ? `Registrar para ${grupoSelecionados.length} funcionários`
                    : 'Registrar medição'}
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
          Erro ao carregar medições.
        </div>
      )}

      {!medicoes?.length && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Ruler size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Nenhuma medição registrada</p>
          <p className="text-slate-400 text-sm">Clique em "Nova medição" para registrar a primeira.</p>
        </div>
      ) : medicoes && medicoes.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Data</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Funcionário</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Serviço</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Qtd.</th>
                {!isEngenheiro && <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Valor</th>}
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                {isGestor && <th className="px-5 py-3.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicoes.map((m) => (
                <>
                  <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${m.status === 'pendente_aprovacao' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(m.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">{m.funcionario?.nome ?? m.funcionario_id}</td>
                    <td className="px-5 py-4 text-slate-600 hidden sm:table-cell">{m.servico?.nome ?? m.servico_id}</td>
                    <td className="px-5 py-4 text-right text-slate-700">
                      {m.quantidade} <span className="text-slate-400 text-xs">{m.servico?.unidade_medida ?? ''}</span>
                    </td>
                    {!isEngenheiro && (
                      <td className="px-5 py-4 text-right font-semibold text-slate-900">
                        {m.valor_calculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    )}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CLASS[m.status]}`}>
                        {STATUS_LABEL[m.status]}
                      </span>
                    </td>
                    {isGestor && (
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(m.status === 'pendente_aprovacao' || m.status === 'pendente') && (
                            <button
                              onClick={() => { setAprovandoId(m); setObsGestor('') }}
                              disabled={aprovando}
                              className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={12} />
                              Aprovar
                            </button>
                          )}
                          {m.status === 'pendente_aprovacao' && (
                            <button
                              onClick={() => { setRejeitandoId(m.id); setMotivoRejeitar('') }}
                              className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <XCircle size={12} />
                              Rejeitar
                            </button>
                          )}
                          {m.status !== 'cancelada' && m.status !== 'pendente_aprovacao' && (
                            <button
                              onClick={() => { setCancelando(m.id); setMotivoCancel('') }}
                              className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <XCircle size={12} />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {/* Painel de aprovação inline */}
                  {aprovandoId?.id === m.id && (
                    <tr key={`aprovar-${m.id}`}>
                      <td colSpan={isGestor ? 7 : isEngenheiro ? 5 : 6} className="px-5 py-4 bg-emerald-50 border-t border-emerald-200">
                        <div className="space-y-3">
                          {aprovandoId.observacao && (
                            <div className="flex gap-2.5 bg-emerald-100 border border-emerald-200 rounded-lg px-3.5 py-3">
                              <Info size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-0.5">Observação do engenheiro</p>
                                <p className="text-sm text-emerald-900">{aprovandoId.observacao}</p>
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                              Observação do gestor (opcional)
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
                              onClick={() => aprovar({ medicaoId: m.id, observacaoGestor: obsGestor || undefined })}
                              className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3.5 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle size={12} />
                              {aprovando ? 'Aprovando...' : 'Confirmar aprovação'}
                            </button>
                            <button
                              onClick={fecharAprovar}
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
                  {rejeitandoId === m.id && (
                    <tr key={`rejeitar-${m.id}`}>
                      <td colSpan={isGestor ? 7 : isEngenheiro ? 5 : 6} className="px-5 py-3 bg-orange-50 border-t border-orange-100">
                        <div className="flex items-center gap-3">
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
                            onClick={() => rejeitar({ medicaoId: m.id, motivo: motivoRejeitar })}
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
                  {/* Painel de cancelamento inline */}
                  {cancelando === m.id && (
                    <tr key={`cancel-${m.id}`}>
                      <td colSpan={isGestor ? 7 : isEngenheiro ? 5 : 6} className="px-5 py-3 bg-red-50 border-t border-red-100">
                        <div className="flex items-center gap-3">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Motivo do cancelamento (mínimo 10 caracteres)"
                            value={motivoCancel}
                            onChange={(e) => setMotivoCancel(e.target.value)}
                            className="flex-1 border border-red-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          />
                          <button
                            disabled={motivoCancel.length < 10 || cancelaEm}
                            onClick={() => cancelar({ medicaoId: m.id, motivo: motivoCancel })}
                            className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setCancelando(null)}
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
      ) : null}
    </div>
  )
}
