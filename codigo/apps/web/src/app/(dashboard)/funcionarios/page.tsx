'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Funcionario, TipoPagamento } from '@brain-master/shared/tipos'

const TIPO_LABEL: Record<TipoPagamento, string> = {
  POR_PRODUCAO: 'Por produção',
  DIARIA: 'Diária',
  HORA: 'Por hora',
  MISTO: 'Misto',
}

async function fetchFuncionarios(): Promise<Funcionario[]> {
  const { data } = await api.get('/api/v1/funcionarios')
  return data
}

export default function FuncionariosPage() {
  const { data: funcionarios, isLoading, isError } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: fetchFuncionarios,
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <p className="text-red-600">Erro ao carregar funcionários.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Funcionários</h1>

      {!funcionarios?.length ? (
        <p className="text-slate-500">Nenhum funcionário cadastrado.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Função</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tipo de pagamento</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {funcionarios.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{f.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{f.funcao ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{TIPO_LABEL[f.tipo_pagamento]}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        f.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {f.ativo ? 'Ativo' : 'Inativo'}
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
