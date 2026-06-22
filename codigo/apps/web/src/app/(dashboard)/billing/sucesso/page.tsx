'use client'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function BillingSucessoPage() {
  return (
    <div className="fade-in flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Assinatura confirmada</h1>
      <p className="text-slate-500 text-sm mb-8">
        Seu trial de 7 dias começou. Nenhuma cobrança será feita até o fim do período.
        Bem-vindo ao Brain Master Pro.
      </p>
      <Link
        href="/obras"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        Ir para obras <ArrowRight size={15} />
      </Link>
    </div>
  )
}
