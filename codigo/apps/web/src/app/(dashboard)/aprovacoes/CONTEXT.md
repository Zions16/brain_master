# CONTEXT — Aprovações (Web Dashboard)

## Função
Tela onde GESTOR vê medições pendentes e aprova ou rejeita.

## Perfil
- Apenas GESTOR acessa
- ENGENHEIRO e FUNCIONARIO não veem esta rota

## Fluxo
1. Lista medições com `status = 'pendente'` da obra atual
2. Gestor revisa quantidade, serviço, funcionário
3. Aprova → API `PATCH /medicoes/:id/aprovar`
4. Rejeita → API `PATCH /medicoes/:id/cancelar` (motivo obrigatório)

## Dependências de API
- `GET /medicoes?status=pendente&obra_id=X`
- `PATCH /medicoes/:id/aprovar`
- `PATCH /medicoes/:id/cancelar`
