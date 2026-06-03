# CONTEXT — Obras (Web Dashboard)

## Função
CRUD de obras vinculadas à empresa do usuário logado.

## Perfis
- GESTOR: cria, edita, arquiva obras
- ENGENHEIRO: lê obras onde está vinculado
- FUNCIONARIO: não acessa diretamente

## Rotas
- `obras/` — listagem com status (ativa/arquivada)
- `obras/[id]` — detalhe: funcionários, serviços, medições, progresso

## Dependências de API
- `GET /obras` — lista obras da empresa
- `POST /obras` — criar obra (GESTOR)
- `GET /obras/:id` — detalhe com relações
- `PATCH /obras/:id` — editar ou arquivar

## Regra
Obra arquivada não aceita novas medições — verificar `status` antes de qualquer operação.
