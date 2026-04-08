# API — Rotas e Contratos

## Base URL
`/api/v1`

## Autenticação
Todas as rotas (exceto `/auth/*`) exigem header:
```
Authorization: Bearer <accessToken>
```

---

## AUTH

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| POST | `/auth/login` | Login com email/senha | público |
| POST | `/auth/refresh` | Renovar access token | público (com refresh token) |
| POST | `/auth/logout` | Invalidar refresh token | autenticado |

---

## OBRAS

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| GET | `/obras` | Listar obras da empresa | GESTOR, FINANCEIRO |
| GET | `/obras/minhas` | Listar obras vinculadas ao usuário | ENGENHEIRO, COMPRAS |
| POST | `/obras` | Criar obra | GESTOR |
| GET | `/obras/:id` | Detalhe da obra | vinculado |
| PATCH | `/obras/:id` | Editar obra | GESTOR |
| PATCH | `/obras/:id/status` | Mudar status (ativa/pausada/encerrada) | GESTOR |

---

## FUNCIONÁRIOS

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| GET | `/funcionarios` | Listar funcionários da empresa | GESTOR, ENGENHEIRO |
| POST | `/funcionarios` | Criar funcionário | GESTOR |
| GET | `/funcionarios/:id` | Detalhe do funcionário | GESTOR, ENGENHEIRO |
| PATCH | `/funcionarios/:id` | Editar funcionário | GESTOR |
| GET | `/funcionarios/:id/producao` | Produção total do funcionário por período | GESTOR, ENGENHEIRO |
| GET | `/funcionarios/me/producao` | Minha produção (área do funcionário) | FUNCIONARIO |

---

## SERVIÇOS

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| GET | `/obras/:obraId/servicos` | Listar serviços da obra | vinculado |
| POST | `/obras/:obraId/servicos` | Criar serviço | GESTOR |
| PATCH | `/obras/:obraId/servicos/:id` | Editar serviço | GESTOR |
| DELETE | `/obras/:obraId/servicos/:id` | Desativar serviço | GESTOR |

---

## MEDIÇÕES

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| GET | `/obras/:obraId/medicoes` | Listar medições da obra | vinculado |
| POST | `/obras/:obraId/medicoes` | Registrar medição | ENGENHEIRO |
| GET | `/obras/:obraId/medicoes/:id` | Detalhe da medição + histórico | vinculado |
| PATCH | `/obras/:obraId/medicoes/:id/corrigir` | Corrigir medição (com motivo) | ENGENHEIRO, GESTOR |
| PATCH | `/obras/:obraId/medicoes/:id/aprovar` | Aprovar medição | GESTOR |
| PATCH | `/obras/:obraId/medicoes/:id/cancelar` | Cancelar medição (com motivo) | GESTOR |
| GET | `/obras/:obraId/medicoes/:id/historico` | Ver histórico de alterações | GESTOR |

---

## PAGAMENTOS

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| GET | `/obras/:obraId/pagamentos` | Listar pagamentos da obra | GESTOR, FINANCEIRO |
| GET | `/obras/:obraId/pagamentos/calcular` | Calcular valor a pagar por período | GESTOR, FINANCEIRO |
| POST | `/obras/:obraId/pagamentos` | Registrar pagamento realizado | GESTOR, FINANCEIRO |
| GET | `/funcionarios/me/pagamentos` | Meu histórico de pagamentos | FUNCIONARIO |

---

## DASHBOARD

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| GET | `/dashboard/obras` | Resumo de todas as obras | GESTOR |
| GET | `/dashboard/obras/:obraId` | Indicadores detalhados da obra | vinculado |

---

## Regras de segurança nas rotas

1. **Isolamento por empresa:** toda query filtra por `empresaId` do usuário autenticado
2. **Isolamento por obra:** ENGENHEIRO só acessa obras em `ObraUsuario` vinculadas a ele
3. **FUNCIONARIO:** só acessa `/funcionarios/me/*` — nunca dados de outros
4. **Medição:** ENGENHEIRO cria, GESTOR aprova (configurável)
5. **Pagamento:** somente GESTOR e FINANCEIRO criam e editam
6. **Rate limiting:** `/auth/login` → máx 5 tentativas por IP por minuto

---

## Estrutura de pasta da API

```
apps/api/
  src/
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.routes.ts
      obras/
        obras.controller.ts
        obras.service.ts
        obras.routes.ts
      funcionarios/
        funcionarios.controller.ts
        funcionarios.service.ts
        funcionarios.routes.ts
      servicos/
        servicos.controller.ts
        servicos.service.ts
        servicos.routes.ts
      medicoes/
        medicoes.controller.ts
        medicoes.service.ts
        medicoes.routes.ts
      pagamentos/
        pagamentos.controller.ts
        pagamentos.service.ts
        pagamentos.routes.ts
      dashboard/
        dashboard.controller.ts
        dashboard.service.ts
        dashboard.routes.ts
    plugins/
      jwt.ts          ← configuração JWT
      prisma.ts       ← instância Prisma global
      cors.ts
      rateLimit.ts
      helmet.ts
    middlewares/
      autenticar.ts   ← verifica JWT, injeta usuario na request
      autorizar.ts    ← verifica perfil do usuário
      verificarObra.ts ← verifica se usuário tem acesso à obra
    utils/
      calcularPagamento.ts
      gerarTokens.ts
      erros.ts
    app.ts            ← setup do Fastify
    server.ts         ← entrada, escuta na porta
  prisma/
    schema.prisma
    migrations/
  .env.example
```
