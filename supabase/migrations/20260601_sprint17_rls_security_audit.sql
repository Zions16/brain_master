-- Sprint 17 — Auditoria de segurança RLS
-- Data: 2026-06-01
-- Problemas corrigidos:
--   1. search_path mutável nas funções auxiliares (schema injection risk)
--   2. anon podia executar funções SECURITY DEFINER sem autenticação
--   3. Policy duplicada em empresa (2x SELECT)
--   4. Policy duplicada em usuario (2x UPDATE)
--   5. pagamento: funcionario ve o proprio — estava expondo pagamentos de todos os funcionários da empresa

-- 1. Recriar funções com search_path fixo

CREATE OR REPLACE FUNCTION public.get_meu_perfil()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT perfil FROM usuario WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_minha_empresa()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM usuario WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.obra_vinculada(p_obra_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM obra
      WHERE id = p_obra_id
        AND empresa_id = get_minha_empresa()
        AND get_meu_perfil() IN ('GESTOR', 'FINANCEIRO')
    )
    OR
    EXISTS (
      SELECT 1 FROM obra_usuario
      WHERE obra_id = p_obra_id
        AND usuario_id = auth.uid()
    )
$$;

-- 2. Revogar execução anônima

REVOKE EXECUTE ON FUNCTION public.get_meu_perfil() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_minha_empresa() FROM anon;
REVOKE EXECUTE ON FUNCTION public.obra_vinculada(uuid) FROM anon;

-- 3. Remover policies duplicadas

DROP POLICY IF EXISTS "empresa: usuario ve a propria" ON empresa;
DROP POLICY IF EXISTS "usuario: atualiza proprio" ON usuario;

-- 4. Corrigir policy de pagamento para FUNCIONARIO
--    Filtro por nome: funcionario.nome = usuario logado (trim + lowercase)

DROP POLICY IF EXISTS "pagamento: funcionario ve o proprio" ON pagamento;

CREATE POLICY "pagamento: funcionario ve o proprio"
ON pagamento FOR SELECT
USING (
  get_meu_perfil() = 'FUNCIONARIO'
  AND funcionario_id IN (
    SELECT f.id
    FROM funcionario f
    JOIN usuario u ON u.id = auth.uid()
    WHERE f.empresa_id = get_minha_empresa()
      AND lower(trim(f.nome)) = lower(trim(u.nome))
  )
);
