-- ============================================================
-- Sprint 22 — Correção crítica de RLS
-- Problemas corrigidos:
--   1. anon executa funções SECURITY DEFINER via herança de PUBLIC
--      (Sprint 17 só revogou de anon diretamente — insuficiente)
--   2. Policies de servico, medicao e medicao_historico tinham
--      OR get_meu_perfil() sem filtro de empresa, permitindo
--      leitura cross-empresa por GESTOR/FINANCEIRO
-- ============================================================

-- 1. Corrigir EXECUTE nas funções helper
--    REVOKE de PUBLIC (anon herda de public)
--    GRANT apenas para authenticated (usado pelas políticas RLS)

REVOKE EXECUTE ON FUNCTION public.get_meu_perfil()        FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_minha_empresa()     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.obra_vinculada(uuid)    FROM PUBLIC;

GRANT  EXECUTE ON FUNCTION public.get_meu_perfil()        TO authenticated;
GRANT  EXECUTE ON FUNCTION public.get_minha_empresa()     TO authenticated;
GRANT  EXECUTE ON FUNCTION public.obra_vinculada(uuid)    TO authenticated;

-- 2. Corrigir policy de servico
--    obra_vinculada() já cobre GESTOR/FINANCEIRO com isolamento de empresa.
--    OR get_meu_perfil() IN ('GESTOR','FINANCEIRO') sem empresa check
--    permitia leitura cross-empresa.

DROP POLICY IF EXISTS "servico: ve da obra vinculada" ON servico;

CREATE POLICY "servico: ve da obra vinculada"
  ON servico FOR SELECT
  USING (obra_vinculada(obra_id));

-- 3. Corrigir policy de medicao (mesmo problema)

DROP POLICY IF EXISTS "medicao: ve da obra vinculada" ON medicao;

CREATE POLICY "medicao: ve da obra vinculada"
  ON medicao FOR SELECT
  USING (obra_vinculada(obra_id));

-- 4. Corrigir policy de medicao_historico (mesmo problema no subquery)

DROP POLICY IF EXISTS "medicao_historico: ve vinculado" ON medicao_historico;

CREATE POLICY "medicao_historico: ve vinculado"
  ON medicao_historico FOR SELECT
  USING (
    medicao_id IN (
      SELECT id FROM medicao WHERE obra_vinculada(obra_id)
    )
  );
