# Produto — ObrasApp (Brain Master)

## O que é
Plataforma SaaS B2B de gestão operacional de obras.
Foco central: medição de serviços executados, vinculada a funcionários, pagamento por produção e controle de materiais.

## Problema que resolve
Empreiteiros e gestores de obra não sabem com precisão quanto foi produzido,
quanto devem pagar a cada funcionário, quanto gastaram em material e se a obra
está dentro do previsto. Tudo acontece em planilhas, WhatsApp e cadernos.

## Usuários
1. Gestor / Dono — visão macro de todas as obras, pagamentos, custos, lucro
2. Engenheiro / Supervisor — registra medições, acompanha equipe, solicita material
3. Funcionário — visualiza sua própria produção e acumulado a receber
4. Compras — visualiza solicitações de material, urgências, histórico
5. Financeiro / Secretaria — lança pagamentos, acompanha valores devidos

## Funcionalidades principais (MVP)
- Cadastro de empresa, obra, funcionários e serviços
- Registro de medição: funcionário + serviço + quantidade → valor calculado automaticamente
- Correção de medição com histórico auditável e motivo obrigatório
- Cálculo de pagamento por período baseado nas medições
- Dashboard por obra: produção, valores a pagar, histórico
- Perfis de acesso com permissões diferenciadas
- Área do funcionário: produção pessoal e acumulado

## Dados sensíveis que o app manipula
- Dados pessoais de funcionários (nome, função, valores ganhos)
- Dados financeiros da empresa (custos de obra, pagamentos, lucro)
- Dados operacionais confidenciais (preços por serviço cobrados do cliente)
- Credenciais de acesso dos usuários

## Modelo de negócio
Cobrança por obra ativa/mês.
Preço estimado: R$ 69 a R$ 99 por obra ativa.
Período de teste: 14 dias sem cartão.
