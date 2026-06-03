import { Resend } from 'resend'
import { Sentry } from './sentry'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = 'Brain Master <notificacoes@brainmaster.app>'
const APP_URL = process.env.APP_URL ?? 'https://brain-master-delta.vercel.app'

async function enviar(payload: Parameters<Resend['emails']['send']>[0]) {
  if (!resend) return
  try {
    await resend.emails.send(payload)
  } catch (err) {
    Sentry.captureException(err)
  }
}

export async function emailMedicaoRegistrada(params: {
  gestorEmail: string
  gestorNome: string
  funcionarioNome: string
  obraNome: string
  servicoNome: string
  quantidade: number
  unidade: string
  obraId: string
}) {
  await enviar({
    from: FROM,
    to: params.gestorEmail,
    subject: `Nova medição aguardando aprovação — ${params.obraNome}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b;margin-bottom:4px">Nova medição para aprovar</h2>
        <p style="color:#64748b;margin-top:0">Obra: <strong>${params.obraNome}</strong></p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;color:#334155"><strong>Funcionário:</strong> ${params.funcionarioNome}</p>
          <p style="margin:0 0 8px;color:#334155"><strong>Serviço:</strong> ${params.servicoNome}</p>
          <p style="margin:0;color:#334155"><strong>Quantidade:</strong> ${params.quantidade} ${params.unidade}</p>
        </div>

        <a href="${APP_URL}/obras/${params.obraId}/medicoes"
          style="display:inline-block;background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Ver e aprovar medição
        </a>

        <p style="color:#94a3b8;font-size:12px;margin-top:24px">
          Brain Master — Gestão de obras
        </p>
      </div>
    `,
  })
}

export async function emailPagamentoRealizado(params: {
  gestorEmail: string
  gestorNome: string
  funcionarioNome: string
  obraNome: string
  valorTotal: number
  periodo: string
}) {
  const valor = params.valorTotal.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  await enviar({
    from: FROM,
    to: params.gestorEmail,
    subject: `Pagamento registrado — ${params.funcionarioNome}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b;margin-bottom:4px">Pagamento registrado com sucesso</h2>
        <p style="color:#64748b;margin-top:0">Obra: <strong>${params.obraNome}</strong></p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;color:#334155"><strong>Funcionário:</strong> ${params.funcionarioNome}</p>
          <p style="margin:0 0 8px;color:#334155"><strong>Período:</strong> ${params.periodo}</p>
          <p style="margin:0;color:#15803d;font-size:20px;font-weight:700">${valor}</p>
        </div>

        <p style="color:#94a3b8;font-size:12px;margin-top:24px">
          Brain Master — Gestão de obras
        </p>
      </div>
    `,
  })
}
