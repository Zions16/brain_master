import Link from 'next/link'
import {
  ClipboardList, Users, DollarSign, BarChart3,
  CheckCircle, ArrowRight, Building2, HardHat,
  Ruler, ShieldCheck, Zap, ChevronRight,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brain Master — Gestão de Obras Simplificada',
  description:
    'Registre medições, calcule pagamentos e gerencie sua equipe em um único sistema. Do canteiro ao pagamento, sem planilha.',
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Ruler,
    title: 'Medição por produção',
    desc: 'Registre o que cada funcionário produziu por serviço. O valor a pagar é calculado automaticamente.',
  },
  {
    icon: DollarSign,
    title: 'Pagamento sem erro',
    desc: 'Feche a semana em minutos. Veja exatamente quanto cada operário tem a receber com base no que mediu.',
  },
  {
    icon: Users,
    title: 'Controle de equipe',
    desc: 'Gerencie funcionários, engenheiros e equipes por obra. Cada perfil vê só o que precisa.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard em tempo real',
    desc: 'Acompanhe produção, custos e status de todas as obras em um único painel.',
  },
  {
    icon: ClipboardList,
    title: 'Histórico auditável',
    desc: 'Toda correção tem motivo registrado. Nunca perca o rastro de uma medição.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança por empresa',
    desc: 'Dados isolados por empresa. Nenhum dado vaza entre clientes.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Cadastre sua obra',
    desc: 'Crie a obra, defina os serviços e os valores de pagamento por unidade produzida.',
  },
  {
    n: '02',
    title: 'Registre as medições',
    desc: 'O engenheiro mede o que foi feito. O sistema calcula o valor automaticamente.',
  },
  {
    n: '03',
    title: 'Feche o pagamento',
    desc: 'Aprove as medições e gere o resumo de pagamento por funcionário. Sem planilha.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '79',
    unit: 'obra/mês',
    desc: 'Para empreiteiros com até 3 obras ativas.',
    features: ['Até 3 obras ativas', 'Funcionários ilimitados', 'Medições e pagamentos', 'Dashboard por obra', 'Suporte por email'],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '59',
    unit: 'obra/mês',
    desc: 'Para empresas com múltiplas obras em andamento.',
    features: ['Obras ilimitadas', 'Funcionários ilimitados', 'Relatórios exportáveis', 'Aprovação de medição', 'Suporte prioritário'],
    cta: 'Começar grátis',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: null,
    unit: null,
    desc: 'Para construtoras com operações complexas.',
    features: ['Tudo do Pro', 'Multi-empresa', 'Onboarding dedicado', 'Integrações sob demanda', 'SLA garantido'],
    cta: 'Falar com vendas',
    highlight: false,
  },
]

// ─── Components ────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">Brain Master</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
          <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#planos" className="hover:text-white transition-colors">Planos</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Teste grátis
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="min-h-screen bg-slate-950 flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Zap size={12} />
          14 dias grátis · Sem cartão de crédito
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
          Da medição ao pagamento,{' '}
          <span className="text-indigo-400">sem planilha.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Brain Master é o sistema para empreiteiros que precisam saber
          exatamente o que foi produzido e quanto pagar a cada funcionário —
          sem anotação em papel, sem WhatsApp, sem erro.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-indigo-900/40"
          >
            Comece agora grátis
            <ArrowRight size={18} />
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-base transition-colors"
          >
            Ver como funciona
            <ChevronRight size={16} />
          </a>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Usado por empreiteiros em todo o Brasil
        </p>
      </div>
    </section>
  )
}

function Problem() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Você já perdeu horas tentando responder:
        </h2>
        <p className="text-2xl md:text-3xl text-slate-400 font-medium italic leading-relaxed">
          &ldquo;Quanto devo pagar ao João essa sexta-feira, com base no que ele produziu?&rdquo;
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          {[
            { title: 'Planilha desatualizada', desc: 'Cada obra tem uma planilha diferente. Ninguém sabe qual é a versão certa.' },
            { title: 'Medição no papel', desc: 'Anotação no caderno, foto no WhatsApp. Na hora de pagar, os dados somem.' },
            { title: 'Erro no pagamento', desc: 'Pagar a mais ou a menos por falta de controle. Conflito com funcionário na sexta.' },
          ].map((item) => (
            <div key={item.title} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-slate-950 py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Como funciona
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Três passos para ter controle total da sua obra.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.n} className="relative">
              <div className="text-5xl font-bold text-indigo-900/60 mb-4 select-none">{step.n}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="funcionalidades" className="bg-slate-900 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tudo que sua obra precisa
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Do registro de medição ao fechamento de pagamento, sem complicação.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 hover:border-indigo-800/60 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center mb-4">
                <f.icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Profiles() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Para toda a equipe
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Cada perfil vê só o que precisa. Sem confusão, sem acesso indevido.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              role: 'Gestor',
              desc: 'Visão completa de todas as obras, pagamentos, custos e produtividade da equipe.',
              items: ['Dashboard multiobra', 'Fechamento de pagamento', 'Aprovação de medições', 'Relatórios financeiros'],
            },
            {
              icon: HardHat,
              role: 'Engenheiro',
              desc: 'Foco nas obras vinculadas. Registra medições no campo com agilidade.',
              items: ['Obras sob sua responsabilidade', 'Registro de medição', 'Equipe da obra', 'Acompanhamento de produção'],
            },
            {
              icon: Users,
              role: 'Funcionário',
              desc: 'Transparência total. Sabe exatamente o que produziu e quanto tem a receber.',
              items: ['Minha produção', 'Acumulado a receber', 'Histórico de pagamentos', 'Acesso por token simples'],
            },
          ].map((p) => (
            <div key={p.role} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center mb-4">
                <p.icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">{p.role}</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{p.desc}</p>
              <ul className="space-y-1.5">
                {p.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} className="text-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="planos" className="bg-slate-900 py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Planos simples, sem surpresa
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Pague por obra ativa. Não usa, não paga.
            14 dias grátis em qualquer plano.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-7 border flex flex-col ${
                plan.highlight
                  ? 'bg-indigo-600 border-indigo-500 ring-2 ring-indigo-400/30'
                  : 'bg-slate-800/40 border-slate-700/60'
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-indigo-200 bg-indigo-500/40 px-3 py-1 rounded-full w-fit mb-4">
                  Mais popular
                </div>
              )}
              <h3 className={`font-bold text-xl mb-1 ${plan.highlight ? 'text-white' : 'text-white'}`}>
                {plan.name}
              </h3>
              <div className="mb-3">
                {plan.price ? (
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-white'}`}>
                      R${plan.price}
                    </span>
                    <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>
                      /{plan.unit}
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">Sob consulta</div>
                )}
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-indigo-100' : 'text-slate-400'}`}>
                {plan.desc}
              </p>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className={plan.highlight ? 'text-indigo-200' : 'text-indigo-400'} />
                    <span className={plan.highlight ? 'text-indigo-50' : 'text-slate-300'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.price ? '/cadastro' : 'mailto:contato@brainmaster.com.br'}
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Pronto para parar de adivinhar?
        </h2>
        <p className="text-slate-400 text-lg mb-10">
          Crie sua conta grátis e comece a usar hoje.
          Sem cartão de crédito, sem compromisso.
        </p>
        <Link
          href="/cadastro"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-indigo-900/40"
        >
          Começar grátis — 14 dias
          <ArrowRight size={20} />
        </Link>
        <p className="mt-4 text-sm text-slate-600">
          Sem cartão · Cancele quando quiser · Suporte em português
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <Building2 size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-400">Brain Master</span>
        </div>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Brain Master. Todos os direitos reservados.
        </p>
        <div className="flex gap-4 text-xs text-slate-500">
          <Link href="/login" className="hover:text-slate-300 transition-colors">Entrar</Link>
          <Link href="/cadastro" className="hover:text-slate-300 transition-colors">Criar conta</Link>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-slate-950">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Profiles />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
