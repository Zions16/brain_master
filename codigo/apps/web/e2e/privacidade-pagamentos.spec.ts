import { test, expect } from '@playwright/test'

// Teste de validação DT-001: isolamento de pagamentos entre funcionários
// Requer dois funcionários de teste com mesmo nome, tokens distintos
//
// E2E_FUN1_TOKEN=FUN-XXXXX (primeiro funcionário)
// E2E_FUN2_TOKEN=FUN-YYYYY (segundo funcionário com mesmo nome)
// E2E_BASE_URL=http://localhost:3000

const fun1Token = process.env.E2E_FUN1_TOKEN ?? ''
const fun2Token = process.env.E2E_FUN2_TOKEN ?? ''

async function loginFuncionario(page: any, token: string) {
  await page.goto('/login')
  await page.click('[data-testid="tab-funcionario"]')
  await page.fill('[data-testid="input-token"]', token)
  await page.click('[data-testid="btn-login-token"]')
  await expect(page).toHaveURL(/minha-producao|obras/, { timeout: 10000 })
}

test.describe('DT-001 — Isolamento de pagamentos entre funcionários', () => {
  test.skip(!fun1Token || !fun2Token, 'E2E_FUN1_TOKEN e E2E_FUN2_TOKEN não configurados')

  test('funcionário 1 só vê seus próprios pagamentos', async ({ browser }) => {
    const ctx1 = await browser.newContext()
    const page1 = await ctx1.newPage()

    await loginFuncionario(page1, fun1Token)
    await page1.goto('/minha-producao')

    const pagamentos1 = await page1.locator('[data-testid="pagamento-row"]').allTextContents()

    await ctx1.close()

    const ctx2 = await browser.newContext()
    const page2 = await ctx2.newPage()

    await loginFuncionario(page2, fun2Token)
    await page2.goto('/minha-producao')

    const pagamentos2 = await page2.locator('[data-testid="pagamento-row"]').allTextContents()

    // As listas de pagamentos devem ser diferentes (cada um vê apenas os seus)
    expect(pagamentos1).not.toEqual(pagamentos2)

    await ctx2.close()
  })

  test('funcionário não consegue acessar pagamentos de outro via URL direta', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await loginFuncionario(page, fun1Token)

    // Tenta chamar a API com um ID diferente do seu
    const response = await page.evaluate(async (token) => {
      const r = await fetch('/api/v1/funcionarios/00000000-0000-0000-0000-000000000000/pagamentos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return r.status
    }, fun1Token)

    // Deve retornar 403 (acesso negado) ou 404 (não encontrado)
    expect([403, 404]).toContain(response)

    await ctx.close()
  })
})
