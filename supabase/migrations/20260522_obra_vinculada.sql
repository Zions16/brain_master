-- Migration: função obra_vinculada
-- Usada nas policies de servico, medicao, medicao_historico e pagamento.
-- Retorna TRUE se o usuário autenticado pode operar na obra informada.

CREATE OR REPLACE FUNCTION obra_vinculada(p_obra_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    -- GESTOR e FINANCEIRO acessam todas as obras da empresa
    EXISTS (
      SELECT 1 FROM obra
      WHERE id = p_obra_id
        AND empresa_id = get_minha_empresa()
        AND get_meu_perfil() IN ('GESTOR', 'FINANCEIRO')
    )
    OR
    -- ENGENHEIRO e COMPRAS acessam apenas obras vinculadas via obra_usuario
    EXISTS (
      SELECT 1 FROM obra_usuario
      WHERE obra_id = p_obra_id
        AND usuario_id = auth.uid()
    )
$$;
