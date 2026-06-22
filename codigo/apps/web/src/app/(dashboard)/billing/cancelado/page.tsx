'use client'
import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function BillingCanceladoPage() {
  return (
    <div className="fade-in flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <XCircle size={32} className="text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Checkout cancelado</h1>
      <p className="text-slate-500 text-sm mb-8">
        Nenhuma cobrança foi feita. Você pode assinar quando quiser.
      </p>
      <Link
        href="/billing"
        className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        <ArrowLeft size={15} /> Voltar para assinatura
      </Link>
    </div>
  )
}
