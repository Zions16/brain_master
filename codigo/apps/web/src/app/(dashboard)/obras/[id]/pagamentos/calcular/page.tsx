'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface CalculoItem {
  funcionario_id: string
  funcionario_nome: string
  total_medicoes: number
  valor_total: number
  por_servico: Array<{
    servico_id: string
    servico_nome: string
    unidade_medida: string
    quantidade_total: number
    valor_total: number
  }>
}

async function calcularPagamentos(obraId: string, periodoInicio: string, periodoFim: string): Promise<CalculoItem[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos/calcular`, {
    params: { inicio: periodoInicio, fim: periodoFim },
  })
  return data
}

async function gerarPagamentos(obraId: string, itens: CalculoItem[], periodoInicio: string, periodoFim: string) {
  const requests = itens.map((item) =>
    api.post(`/api/v1/obras/${obraId}/pagamentos`, {
      funcionario_id: item.funcionario_id,
      periodo_inicio: periodoInicio,
      periodo_fim: periodoFim,
    })
  )
  return Promise.all(requests)
}

export default function CalcularPagamentosPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const qc = useQueryClient()

  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.slice(0, 8) + '01'

  const [periodoInicio, setPeriodoInicio] = useState(firstOfMonth)
  const [periodoFim, setPeriodoFim] = useState(today)
  const [calculo, setCalculo] = useState<CalculoItem[] | null>(null)
  const [loadingCalculo, setLoadingCalculo] = useState(false)
  const [erroCalculo, setErroCalculo] = useState('')

  const { mutate: gerar, isPending: gerando } = useMutation({
    mutationFn: () => gerarPagamentos(id, calculo!, periodoInicio, periodoFim),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagamentos', id] })
      router.push(`/obras/${id}/pagamentos`)
    },
  })

  async function handleCalcular() {
    setErroCalculo('')
    setCalculo(null)
    setLoadingCalculo(true)
    try {
      const result = await calcularPagamentos(id, periodoInicio, periodoFim)
      setCalculo(result)
    } catch {
      setErroCalculo('Erro ao calcular. Verifique o período.')
    } finally {
      setLoadingCalculo(false)
    }
  }

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/obras" className="hover:text-slate-800">Obras</Link>
        <span className="mx-2">/</span>
        <Link href={`/obras/${id}`} className="hover:text-slate-800">Detalhe</Link>
        <span className="mx-2">/</span>
        <Link href={`/obras/${id}/pagamentos`} className="hover:text-slate-800">Pagamentos</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Calcular</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Calcular Pagamentos</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Período início</label>
            <input
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Período fim</label>
            <input
              type="date"
              value={periodoFim}
              onChange={(e) => setPeriodoFim(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {erroCalculo && (
          <p className="text-sm text-red-600 mb-3">{erroCalculo}</p>
        )}

        <button
          onClick={handleCalcular}
          disabled={loadingCalculo}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loadingCalculo ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {loadingCalculo && <LoadingSpinner />}

      {calculo && calculo.length === 0 && (
        <p className="text-slate-500">Nenhuma medição ativa no período.</p>
      )}

      {calculo && calculo.length > 0 && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Funcionário</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Medições</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Valor total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calculo.map((item) => (
                  <tr key={item.funcionario_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.funcionario_nome}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.total_medicoes}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => gerar()}
            disabled={gerando}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {gerando ? 'Gerando...' : 'Gerar pagamentos'}
          </button>
        </>
      )}
    </div>
  )
}
