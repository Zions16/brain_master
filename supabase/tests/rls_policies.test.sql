-- ============================================================
-- Sprint 22 — RLS Integration Tests (pgTAP)
-- Cobertura:
--   Bug 1 (T01–T06): anon não pode executar funções SECURITY DEFINER
--   Bug 2 (T07–T12): isolamento cross-empresa em servico/medicao
--
-- Como executar:
--   1. Cole no Supabase SQL Editor e rode (ou via MCP execute_sql)
--   2. O ROLLBACK final garante limpeza total dos dados de teste
--   3. Resultado esperado: 12/12 ok
--
-- Pré-requisito: extensão pgTAP instalada em schema extensions
--   CREATE EXTENSION IF NOT EXISTS pgtap SCHEMA extensions;
-- ============================================================

-- Cria a função de teste (recriada a cada execução)
CREATE OR REPLACE FUNCTION public._run_rls_tests()
RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  -- ──────────────────────────────────────────────────────────
  -- SETUP: dados isolados com UUIDs fixos e prefixo _TEST_
  -- Necessário criar auth.users por FK constraint usuario.id
  -- ──────────────────────────────────────────────────────────
  INSERT INTO auth.users (id, aud, role, email, email_confirmed_at) VALUES
    ('a0000000-0000-0000-0000-000000000010'::uuid,
     'authenticated', 'authenticated', '_test_alpha@test.internal', now()),
    ('b0000000-0000-0000-0000-000000000020'::uuid,
     'authenticated', 'authenticated', '_test_beta@test.internal', now());

  INSERT INTO public.empresa (id, nome) VALUES
    ('a0000000-0000-0000-0000-000000000001'::uuid, '_TEST_ Empresa Alpha'),
    ('b0000000-0000-0000-0000-000000000002'::uuid, '_TEST_ Empresa Beta');

  INSERT INTO public.usuario (id, empresa_id, nome, perfil) VALUES
    ('a0000000-0000-0000-0000-000000000010'::uuid,
     'a0000000-0000-0000-0000-000000000001', '_TEST_ Gestor Alpha', 'GESTOR'),
    ('b0000000-0000-0000-0000-000000000020'::uuid,
     'b0000000-0000-0000-0000-000000000002', '_TEST_ Gestor Beta', 'GESTOR');

  INSERT INTO public.obra (id, empresa_id, nome) VALUES
    ('a0000000-0000-0000-0000-000000000100'::uuid,
     'a0000000-0000-0000-0000-000000000001', '_TEST_ Obra Alpha'),
    ('b0000000-0000-0000-0000-000000000200'::uuid,
     'b0000000-0000-0000-0000-000000000002', '_TEST_ Obra Beta');

  -- Vínculo usuário ↔ obra (usado por obra_vinculada())
  INSERT INTO public.obra_usuario (obra_id, usuario_id) VALUES
    ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000010'),
    ('b0000000-0000-0000-0000-000000000200', 'b0000000-0000-0000-0000-000000000020');

  INSERT INTO public.funcionario (id, empresa_id, nome, funcao) VALUES
    ('a0000000-0000-0000-0000-000000001000'::uuid,
     'a0000000-0000-0000-0000-000000000001', '_TEST_ Func Alpha', 'Pedreiro'),
    ('b0000000-0000-0000-0000-000000002000'::uuid,
     'b0000000-0000-0000-0000-000000000002', '_TEST_ Func Beta', 'Pedreiro');

  INSERT INTO public.servico (id, obra_id, nome, unidade_medida, valor_pagamento) VALUES
    ('a0000000-0000-0000-0000-000000010000'::uuid,
     'a0000000-0000-0000-0000-000000000100', '_TEST_ Servico Alpha', 'M2', 20),
    ('b0000000-0000-0000-0000-000000020000'::uuid,
     'b0000000-0000-0000-0000-000000000200', '_TEST_ Servico Beta', 'M2', 20);

  INSERT INTO public.medicao
    (id, obra_id, funcionario_id, servico_id, quantidade, valor_calculado, medido_por, status)
  VALUES
    ('a0000000-0000-0000-0000-000001000000'::uuid,
     'a0000000-0000-0000-0000-000000000100',
     'a0000000-0000-0000-0000-000000001000',
     'a0000000-0000-0000-0000-000000010000',
     10, 200, 'a0000000-0000-0000-0000-000000000010', 'ativa'),
    ('b0000000-0000-0000-0000-000002000000'::uuid,
     'b0000000-0000-0000-0000-000000000200',
     'b0000000-0000-0000-0000-000000002000',
     'b0000000-0000-0000-0000-000000020000',
     10, 200, 'b0000000-0000-0000-0000-000000000020', 'ativa');

  RETURN NEXT extensions.plan(12);

  -- ──────────────────────────────────────────────────────────
  -- BLOCO 1 — Bug 1: permissão de execução das funções helper
  -- has_function_privilege() verifica o ACL sem trocar de role.
  -- ──────────────────────────────────────────────────────────

  RETURN NEXT extensions.is(
    has_function_privilege('anon', 'public.get_meu_perfil()', 'execute'),
    false, 'T01: anon não tem EXECUTE em get_meu_perfil()');

  RETURN NEXT extensions.is(
    has_function_privilege('anon', 'public.get_minha_empresa()', 'execute'),
    false, 'T02: anon não tem EXECUTE em get_minha_empresa()');

  RETURN NEXT extensions.is(
    has_function_privilege('anon', 'public.obra_vinculada(uuid)', 'execute'),
    false, 'T03: anon não tem EXECUTE em obra_vinculada(uuid)');

  RETURN NEXT extensions.is(
    has_function_privilege('authenticated', 'public.get_meu_perfil()', 'execute'),
    true, 'T04: authenticated tem EXECUTE em get_meu_perfil()');

  RETURN NEXT extensions.is(
    has_function_privilege('authenticated', 'public.get_minha_empresa()', 'execute'),
    true, 'T05: authenticated tem EXECUTE em get_minha_empresa()');

  RETURN NEXT extensions.is(
    has_function_privilege('authenticated', 'public.obra_vinculada(uuid)', 'execute'),
    true, 'T06: authenticated tem EXECUTE em obra_vinculada(uuid)');

  -- ──────────────────────────────────────────────────────────
  -- BLOCO 2 — Bug 2: isolamento cross-empresa (RLS real)
  -- Estratégia: captura contagens como `authenticated` em temp
  -- table; asserta como `postgres` onde pgTAP é acessível.
  -- ──────────────────────────────────────────────────────────

  CREATE TEMP TABLE _rls_results (test_name text PRIMARY KEY, result int);
  GRANT INSERT, SELECT ON _rls_results TO authenticated;

  -- Simula Gestor Alpha (empresa A)
  PERFORM set_config('request.jwt.claims',
    '{"sub":"a0000000-0000-0000-0000-000000000010","role":"authenticated"}', TRUE);
  SET LOCAL ROLE authenticated;
  INSERT INTO _rls_results VALUES
    ('alpha_ve_servico_beta',
     (SELECT COUNT(*)::int FROM public.servico
      WHERE id = 'b0000000-0000-0000-0000-000000020000'::uuid)),
    ('alpha_ve_medicao_beta',
     (SELECT COUNT(*)::int FROM public.medicao
      WHERE id = 'b0000000-0000-0000-0000-000002000000'::uuid)),
    ('alpha_ve_propria_medicao',
     (SELECT COUNT(*)::int FROM public.medicao
      WHERE id = 'a0000000-0000-0000-0000-000001000000'::uuid));
  RESET ROLE;

  -- Simula Gestor Beta (empresa B)
  PERFORM set_config('request.jwt.claims',
    '{"sub":"b0000000-0000-0000-0000-000000000020","role":"authenticated"}', TRUE);
  SET LOCAL ROLE authenticated;
  INSERT INTO _rls_results VALUES
    ('beta_ve_servico_alpha',
     (SELECT COUNT(*)::int FROM public.servico
      WHERE id = 'a0000000-0000-0000-0000-000000010000'::uuid)),
    ('beta_ve_medicao_alpha',
     (SELECT COUNT(*)::int FROM public.medicao
      WHERE id = 'a0000000-0000-0000-0000-000001000000'::uuid)),
    ('beta_ve_propria_medicao',
     (SELECT COUNT(*)::int FROM public.medicao
      WHERE id = 'b0000000-0000-0000-0000-000002000000'::uuid));
  RESET ROLE;

  -- Assertivas (como postgres — pgTAP acessível)
  RETURN NEXT extensions.is(
    (SELECT result FROM _rls_results WHERE test_name = 'alpha_ve_servico_beta'),
    0, 'T07: Alpha NÃO vê serviço da Beta (cross-empresa)');

  RETURN NEXT extensions.is(
    (SELECT result FROM _rls_results WHERE test_name = 'alpha_ve_medicao_beta'),
    0, 'T08: Alpha NÃO vê medição da Beta (cross-empresa)');

  RETURN NEXT extensions.is(
    (SELECT result FROM _rls_results WHERE test_name = 'alpha_ve_propria_medicao'),
    1, 'T09: Alpha VÊ sua própria medição (controle positivo)');

  RETURN NEXT extensions.is(
    (SELECT result FROM _rls_results WHERE test_name = 'beta_ve_servico_alpha'),
    0, 'T10: Beta NÃO vê serviço da Alpha (cross-empresa)');

  RETURN NEXT extensions.is(
    (SELECT result FROM _rls_results WHERE test_name = 'beta_ve_medicao_alpha'),
    0, 'T11: Beta NÃO vê medição da Alpha (cross-empresa)');

  RETURN NEXT extensions.is(
    (SELECT result FROM _rls_results WHERE test_name = 'beta_ve_propria_medicao'),
    1, 'T12: Beta VÊ sua própria medição (controle positivo)');

  RETURN NEXT extensions.finish();
END;
$$;

-- ============================================================
-- EXECUÇÃO — roda numa transação; ROLLBACK limpa tudo
-- ============================================================
BEGIN;
SELECT * FROM public._run_rls_tests();
ROLLBACK;

-- Remove a função de teste (não deve ficar em produção)
DROP FUNCTION IF EXISTS public._run_rls_tests();
