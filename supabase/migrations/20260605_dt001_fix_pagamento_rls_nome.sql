-- Sprint 28 — Fix DT-001: corrigir policy RLS de pagamento (defense in depth)
-- Data: 2026-06-05
--
-- Problema:
--   A policy "pagamento: funcionario ve o proprio" usava match por nome:
--     lower(trim(f.nome)) = lower(trim(u.nome))
--   Dois funcionários com mesmo nome na mesma empresa podiam ver
--   pagamentos um do outro.
--
-- Solução primária (já aplicada no backend):
--   - /funcionarios/me passou a usar funcionario.id do JWT (não nome)
--   - /:id/pagamentos, /:id/medicoes, /:id/producao agora verificam
--     que FUNCIONARIO só acessa seu próprio ID
--
-- Solução aqui (defense in depth):
--   A RLS policy abaixo não é ativamente explorada via web (a API usa
--   service_key e contorna o RLS). Mas é corrigida por precaução caso
--   qualquer cliente faça acesso direto ao Supabase com JWT nativo.
--
--   Como funcionários usam Fastify JWT (não Supabase JWT), auth.uid()
--   não retorna o funcionario.id — a policy ficaria inativa de qualquer
--   forma. Mantemos a versão corrigida para consistência e segurança futura.

DROP POLICY IF EXISTS "pagamento: funcionario ve o proprio" ON pagamento;

-- Policy corrigida: sem match por nome.
-- Quando/se funcionários tiverem user_id linkando a auth.users,
-- o subquery abaixo funcionará corretamente.
-- Por ora, a proteção real está no backend (service/controller).
CREATE POLICY "pagamento: funcionario ve o proprio"
ON pagamento FOR SELECT
USING (
  get_meu_perfil() = 'FUNCIONARIO'
  AND funcionario_id IN (
    SELECT f.id
    FROM funcionario f
    WHERE f.empresa_id = get_minha_empresa()
      AND f.id::text = auth.uid()::text
  )
);

-- Nota: esta policy só se tornará plenamente efetiva quando
-- a tabela funcionario tiver coluna user_id e os funcionários
-- fizerem login via Supabase Auth (não Fastify JWT customizado).
-- Registrar como próximo passo em dividas-tecnicas.md.
