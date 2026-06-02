'use client'
import { useState } from 'react'
import { FileText, Search, TrendingUp, Clock, CheckCircle, AlertCircle, Building2 } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { RelatorioFuncionarioFechamento } from '@brain-master/shared/tipos'

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function fetchFechamento(inicio: string, fim: string): Promise<RelatorioFuncionarioFechamento[]> {
  const { data } = await api.get('/api/v1/relatorios/fechamento', { params: { inicio, fim } })
  return data
}

export default function FechamentoPage() {
  const hoje = new Date().toISOString().split('T')[0]
  const primeiroDiaMes = hoje.slice(0, 8) + '01'

  const [inicio, setInicio] = useState(primeiroDiaMes)
  const [fim, setFim] = useState(hoje)
  const [relatorio, setRelatorio] = useState<RelatorioFuncionarioFechamento[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleConsultar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setRelatorio(null)
    setLoading(true)
    try {
      const data = await fetchFechamento(inicio, fim)
      setRelatorio(data)
    } catch {
      setErro('Erro ao gerar relatório. Verifique o período.')
    } finally {
      setLoading(false)
    }
  }

  const lista = relatorio ?? []
  const totalProduzido = lista.reduce((s, f) => s + f.total_produzido, 0)
  const totalPendente = lista.reduce((s, f) => s + f.total_pendente, 0)
  const totalPago = lista.reduce((s, f) => s + f.total_pago, 0)
  const totalSaldo = lista.reduce((s, f) => s + f.saldo_a_gerar, 0)
  const comSaldo = lista.filter((f) => f.saldo_a_gerar > 0).length

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
          <FileText size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fechamento de Período</h1>
          <p className="text-slate-400 text-sm mt-0.5">Resumo de produção e pagamentos por funcionário</p>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <form onSubmit={handleConsultar} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Período início
            </label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Período fim
            </label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Search size={14} />
            {loading ? 'Gerando...' : 'Gerar relatório'}
          </button>
        </form>

        {erro && (
          <p className="mt-3 text-sm text-red-600">{erro}</p>
        )}
      </div>

      {loading && <LoadingSpinner />}

      {relatorio !== null && !loading && (
        <>
          {/* KPIs */}
          {lista.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  <TrendingUp size={16} className="text-indigo-600" />
                </div>
                <p className="text-xl font-bold text-indigo-700 mb-0.5">{brl(totalProduzido)}</p>
                <p className="text-xs font-semibold text-slate-700">Total produzido</p>
                <p className="text-xs text-slate-400 mt-0.5">medições ativas no período</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                  <Clock size={16} className="text-amber-500" />
                </div>
                <p className="text-xl font-bold text-amber-700 mb-0.5">{brl(totalPendente)}</p>
                <p className="text-xs font-semibold text-slate-700">Em pagamentos pendentes</p>
                <p className="text-xs text-slate-400 mt-0.5">registrado, aguardando pagamento</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-emerald-700 mb-0.5">{brl(totalPago)}</p>
                <p className="text-xs font-semibold text-slate-700">Já pago</p>
                <p className="text-xs text-slate-400 mt-0.5">pagamentos realizados</p>
              </div>

              <div className={`rounded-xl p-5 border ${
                totalSaldo > 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  totalSaldo > 0 ? 'bg-red-100' : 'bg-emerald-100'
                }`}>
                  <AlertCircle size={16} className={totalSaldo > 0 ? 'text-red-600' : 'text-emerald-600'} />
                </div>
                <p className={`text-xl font-bold mb-0.5 ${totalSaldo > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {brl(totalSaldo)}
                </p>
                <p className={`text-xs font-semibold ${totalSaldo > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                  Saldo a gerar
                </p>
                <p className={`text-xs mt-0.5 ${totalSaldo > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {totalSaldo > 0 ? `${comSaldo} funcionário${comSaldo !== 1 ? 's' : ''} sem pagamento` : 'Tudo registrado'}
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {lista.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">Nenhuma produção no período</p>
              <p className="text-slate-400 text-sm">Sem medições ativas ou pagamentos para as datas informadas.</p>
            </div>
          )}

          {/* Tabela */}
          {lista.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Funcionário</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Med.</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Produzido</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Pendente</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Pago</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Saldo a gerar</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Obras</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lista.map((f) => (
                    <tr
                      key={f.funcionario_id}
                      className={`transition-colors ${
                        f.saldo_a_gerar > 0 ? 'hover:bg-red-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            f.saldo_a_gerar > 0 ? 'bg-red-100' : 'bg-slate-100'
                          }`}>
                            <span className={`text-xs font-bold ${f.saldo_a_gerar > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                              {f.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{f.nome}</p>
                            {f.funcao && <p className="text-xs text-slate-400">{f.funcao}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-500 hidden sm:table-cell">
                        {f.total_medicoes}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-indigo-700">
                        {brl(f.total_produzido)}
                      </td>
                      <td className="px-5 py-4 text-right hidden md:table-cell">
                        {f.total_pendente > 0
                          ? <span className="text-amber-700 font-medium">{brl(f.total_pendente)}</span>
                          : <span className="text-slate-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-right hidden md:table-cell">
                        {f.total_pago > 0
                          ? <span className="text-emerald-700 font-medium">{brl(f.total_pago)}</span>
                          : <span className="text-slate-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-right">
                        {f.saldo_a_gerar > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
                            {brl(f.saldo_a_gerar)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <CheckCircle size={11} />
                            Ok
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {f.obras.map((obra) => (
                            <span
                              key={obra}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                            >
                              <Building2 size={10} className="text-slate-400" />
                              {obra}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Total ({lista.length} funcionário{lista.length !== 1 ? 's' : ''})
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 text-sm hidden sm:table-cell">
                      {lista.reduce((s, f) => s + f.total_medicoes, 0)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-indigo-700">
                      {brl(totalProduzido)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-amber-700 hidden md:table-cell">
                      {totalPendente > 0 ? brl(totalPendente) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700 hidden md:table-cell">
                      {totalPago > 0 ? brl(totalPago) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-bold text-sm ${totalSaldo > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {brl(totalSaldo)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
