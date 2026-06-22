'use client'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CreditCard, CheckCircle2, AlertTriangle, Clock, XCircle, ExternalLink, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type BillingStatus = {
  stripe_status: 'sem_plano' | 'trial' | 'active' | 'past_due' | 'canceled' | 'incomplete'
  trial_ends_at: string | null
  current_period_end: string | null
  stripe_subscription_id: string | null
}

const STATUS_CONFIG = {
  sem_plano: { label: 'Sem plano', color: 'bg-slate-100 text-slate-600', icon: XCircle },
  trial: { label: 'Trial ativo', color: 'bg-blue-50 text-blue-700', icon: Clock },
  active: { label: 'Ativo', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  past_due: { label: 'Pagamento pendente', color: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
  canceled: { label: 'Cancelado', color: 'bg-red-50 text-red-600', icon: XCircle },
  incomplete: { label: 'Incompleto', color: 'bg-slate-100 text-slate-600', icon: XCircle },
}

async function fetchBillingStatus(): Promise<BillingStatus> {
  const { data } = await api.get('/api/v1/billing/status')
  return data
}

function diasRestantes(data: string | null): number | null {
  if (!data) return null
  const diff = new Date(data).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatarData(data: string | null): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function BillingPage() {
  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing-status'],
    queryFn: fetchBillingStatus,
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/v1/billing/checkout')
      return data
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
    },
  })

  const portalMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/v1/billing/portal')
      return data
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
    },
  })

  if (isLoading) return <LoadingSpinner />

  const status = billing?.stripe_status ?? 'sem_plano'
  const config = STATUS_CONFIG[status]
  const StatusIcon = config.icon
  const diasTrial = status === 'trial' ? diasRestantes(billing?.trial_ends_at ?? null) : null
  const semAssinatura = status === 'sem_plano' || status === 'canceled' || status === 'incomplete'

  return (
    <div className="fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Assinatura</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie seu plano Brain Master Pro</p>
      </div>

      {/* Card de status */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <CreditCard size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Brain Master Pro</p>
              <p className="text-xs text-slate-500">R$79,00 por obra ativa / mês</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
            <StatusIcon size={12} />
            {config.label}
          </span>
        </div>

        {/* Trial banner */}
        {status === 'trial' && diasTrial !== null && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
            <Clock size={16} className="text-blue-500 shrink-0" />
            <p className="text-sm text-blue-700">
              Seu trial termina em <strong>{diasTrial} dia{diasTrial !== 1 ? 's' : ''}</strong>
              {billing?.trial_ends_at ? ` — ${formatarData(billing.trial_ends_at)}` : ''}.
              Adicione um método de pagamento para continuar.
            </p>
          </div>
        )}

        {/* Past due banner */}
        {status === 'past_due' && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">
              Pagamento pendente. Atualize seu método de pagamento para manter o acesso.
            </p>
          </div>
        )}

        {/* Info linha */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-1">Próxima cobrança</p>
            <p className="font-medium text-slate-700">{formatarData(billing?.current_period_end ?? null)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Modelo</p>
            <p className="font-medium text-slate-700">Por obra ativa</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        {semAssinatura ? (
          <button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Zap size={15} />
            {checkoutMutation.isPending ? 'Redirecionando...' : 'Assinar agora'}
          </button>
        ) : (
          <button
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <ExternalLink size={15} />
            {portalMutation.isPending ? 'Abrindo portal...' : 'Gerenciar assinatura'}
          </button>
        )}
      </div>

      {/* Info preço */}
      <div className="mt-6 bg-slate-50 rounded-xl p-5 text-sm text-slate-500">
        <p className="font-medium text-slate-700 mb-2">Como funciona o preço</p>
        <ul className="space-y-1 text-xs">
          <li>• R$79,00 por obra ativa por mês</li>
          <li>• 10 ou mais obras: 10% de desconto automático (R$71,10/obra)</li>
          <li>• Trial de 7 dias com cartão — não cobramos até o fim do período</li>
          <li>• Cancele quando quiser pelo portal de assinatura</li>
        </ul>
      </div>
    </div>
  )
}
