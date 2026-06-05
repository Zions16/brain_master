# Testes E2E — ObrasApp Web

## Setup (primeira vez)

```bash
cd codigo/apps/web
npm install --save-dev @playwright/test
npx playwright install chromium
```

## Variáveis de ambiente necessárias

Criar `.env.e2e.local` (nunca commitar):

```env
E2E_BASE_URL=http://localhost:3000
E2E_GESTOR_EMAIL=gestor@teste.com
E2E_GESTOR_SENHA=SenhaSegura123
E2E_FUN1_TOKEN=FUN-XXXXX
E2E_FUN2_TOKEN=FUN-YYYYY   # segundo funcionário com mesmo nome (para testar DT-001)
```

## Rodar

```bash
# Todos os testes
npx playwright test

# Só smoke tests (sem credenciais)
npx playwright test e2e/auth.spec.ts --grep "landing page"

# Teste de privacidade de pagamentos (DT-001)
npx playwright test e2e/privacidade-pagamentos.spec.ts
```

## Testes disponíveis

| Arquivo | Testa | Requer credenciais |
|---------|-------|--------------------|
| `auth.spec.ts` | Login GESTOR + smoke landing page | E2E_GESTOR_EMAIL/SENHA |
| `privacidade-pagamentos.spec.ts` | Isolamento de pagamentos DT-001 | E2E_FUN1/FUN2_TOKEN |

## Data-testids necessários (a adicionar no login)

Os testes dependem de atributos `data-testid` no formulário de login:
- `tab-gestor` — aba de login GESTOR
- `tab-funcionario` — aba de login FUNCIONARIO
- `input-email` — campo email
- `input-senha` — campo senha
- `input-token` — campo token FUN/ENG
- `btn-login` — botão submit GESTOR
- `btn-login-token` — botão submit token
- `login-error` — mensagem de erro

**Status:** Testes criados, data-testids ainda não adicionados na página de login.
