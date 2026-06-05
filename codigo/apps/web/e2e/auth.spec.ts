import { test, expect } from '@playwright/test'

// Variáveis de ambiente necessárias (não usar dados reais em CI):
// E2E_GESTOR_EMAIL=gestor@teste.com
// E2E_GESTOR_SENHA=SenhaSegura123
// E2E_FUNCIONARIO_TOKEN=FUN-TESTE

const gestorEmail = process.env.E2E_GESTOR_EMAIL ?? ''
const gestorSenha = process.env.E2E_GESTOR_SENHA ?? ''

test.describe('Login — GESTOR', () => {
  test.skip(!gestorEmail || !gestorSenha, 'E2E_GESTOR_EMAIL e E2E_GESTOR_SENHA não configurados')

  test('login com email+senha redireciona para dashboard', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/login/)

    await page.click('[data-testid="tab-gestor"]')
    await page.fill('[data-testid="input-email"]', gestorEmail)
    await page.fill('[data-testid="input-senha"]', gestorSenha)
    await page.click('[data-testid="btn-login"]')

    await expect(page).toHaveURL(/obras|dashboard/, { timeout: 10000 })
  })

  test('credenciais inválidas exibem erro', async ({ page }) => {
    await page.goto('/login')
    await page.click('[data-testid="tab-gestor"]')
    await page.fill('[data-testid="input-email"]', 'invalido@x.com')
    await page.fill('[data-testid="input-senha"]', 'senha-errada')
    await page.click('[data-testid="btn-login"]')

    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Smoke — landing page', () => {
  test('landing page carrega sem erro', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Brain Master|ObrasApp/i)
    await expect(page.locator('body')).not.toContainText('500')
    await expect(page.locator('body')).not.toContainText('Application error')
  })
})
