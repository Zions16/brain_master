-- ============================================================
-- Brain Master — Seed de demonstração
-- Cria 3 obras, 12 funcionários, 4 serviços/obra, ~60 medições e pagamentos
-- Executar no Supabase SQL Editor (usa service_key — ignora RLS)
-- ============================================================

DO $$
DECLARE
  -- Contexto dinâmico
  v_empresa_id   UUID;
  v_usuario_id   UUID;

  -- Obras
  v_obra1_id     UUID := gen_random_uuid();
  v_obra2_id     UUID := gen_random_uuid();
  v_obra3_id     UUID := gen_random_uuid();

  -- Funcionários — Obra 1
  v_f1_a UUID := gen_random_uuid();
  v_f1_b UUID := gen_random_uuid();
  v_f1_c UUID := gen_random_uuid();
  v_f1_d UUID := gen_random_uuid();
  v_f1_e UUID := gen_random_uuid();

  -- Funcionários — Obra 2
  v_f2_a UUID := gen_random_uuid();
  v_f2_b UUID := gen_random_uuid();
  v_f2_c UUID := gen_random_uuid();
  v_f2_d UUID := gen_random_uuid();

  -- Funcionários — Obra 3
  v_f3_a UUID := gen_random_uuid();
  v_f3_b UUID := gen_random_uuid();
  v_f3_c UUID := gen_random_uuid();

  -- Serviços — Obra 1 (Residencial)
  v_s1_alv UUID := gen_random_uuid();  -- Alvenaria  R$28/m²
  v_s1_reb UUID := gen_random_uuid();  -- Reboco     R$14/m²
  v_s1_pin UUID := gen_random_uuid();  -- Pintura    R$9/m²
  v_s1_cer UUID := gen_random_uuid();  -- Cerâmica   R$22/m²

  -- Serviços — Obra 2 (Galpão)
  v_s2_est UUID := gen_random_uuid();  -- Estrutura  R$45/m²
  v_s2_pso UUID := gen_random_uuid();  -- Piso       R$35/m²
  v_s2_dry UUID := gen_random_uuid();  -- Drywall    R$18/m²
  v_s2_pin UUID := gen_random_uuid();  -- Pintura    R$12/m²

  -- Serviços — Obra 3 (Hospital)
  v_s3_alv UUID := gen_random_uuid();  -- Alvenaria  R$32/m²
  v_s3_reb UUID := gen_random_uuid();  -- Reboco ext R$16/m²
  v_s3_pin UUID := gen_random_uuid();  -- Pintura    R$20/m²
  v_s3_pso UUID := gen_random_uuid();  -- Piso       R$25/m²

BEGIN

  -- ── Contexto ──────────────────────────────────────────────────────────────
  SELECT id INTO v_empresa_id FROM empresa LIMIT 1;
  SELECT id INTO v_usuario_id
    FROM usuario
    WHERE perfil = 'GESTOR' AND empresa_id = v_empresa_id
    LIMIT 1;

  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada. Crie a empresa e o usuário GESTOR antes de rodar este seed.';
  END IF;
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário GESTOR encontrado para a empresa %. Crie o usuário primeiro.', v_empresa_id;
  END IF;

  -- ── Obras ─────────────────────────────────────────────────────────────────
  INSERT INTO obra (id, empresa_id, nome, cliente, endereco, data_inicio, data_prev_fim, status)
  VALUES
    (v_obra1_id, v_empresa_id,
     'Residencial Parque das Flores',
     'Construtora Alfa Ltda',
     'Av. das Flores, 1200 — Jardim América',
     '2026-02-01', '2026-09-30', 'ativa'),

    (v_obra2_id, v_empresa_id,
     'Galpão Industrial Norte',
     'Beta Logística S/A',
     'Rod. BR-040 Km 125 — Zona Industrial',
     '2026-01-15', '2026-07-31', 'ativa'),

    (v_obra3_id, v_empresa_id,
     'Hospital Regional Leste',
     'Secretaria Municipal de Saúde',
     'R. das Acácias, 890 — Vila Nova',
     '2025-11-01', '2026-12-31', 'pausada');

  -- ── Funcionários — Obra 1 ─────────────────────────────────────────────────
  INSERT INTO funcionario (id, empresa_id, obra_id, nome, funcao, tipo_pagamento)
  VALUES
    (v_f1_a, v_empresa_id, v_obra1_id, 'João Carlos Santos',   'Pedreiro',   'POR_PRODUCAO'),
    (v_f1_b, v_empresa_id, v_obra1_id, 'Marcos Vinicius Silva','Azulejista', 'POR_PRODUCAO'),
    (v_f1_c, v_empresa_id, v_obra1_id, 'Pedro Henrique Alves', 'Pintor',     'POR_PRODUCAO'),
    (v_f1_d, v_empresa_id, v_obra1_id, 'Luiz Fernando Costa',  'Servente',   'POR_PRODUCAO'),
    (v_f1_e, v_empresa_id, v_obra1_id, 'Antônio Pereira',      'Reboqueiro', 'POR_PRODUCAO');

  -- ── Funcionários — Obra 2 ─────────────────────────────────────────────────
  INSERT INTO funcionario (id, empresa_id, obra_id, nome, funcao, tipo_pagamento)
  VALUES
    (v_f2_a, v_empresa_id, v_obra2_id, 'Rafael Oliveira',      'Montador',   'POR_PRODUCAO'),
    (v_f2_b, v_empresa_id, v_obra2_id, 'Bruno Mendes',         'Eletricista','POR_PRODUCAO'),
    (v_f2_c, v_empresa_id, v_obra2_id, 'Carlos Eduardo Lima',  'Serralheiro','POR_PRODUCAO'),
    (v_f2_d, v_empresa_id, v_obra2_id, 'Tiago Barbosa',        'Servente',   'POR_PRODUCAO');

  -- ── Funcionários — Obra 3 ─────────────────────────────────────────────────
  INSERT INTO funcionario (id, empresa_id, obra_id, nome, funcao, tipo_pagamento)
  VALUES
    (v_f3_a, v_empresa_id, v_obra3_id, 'Henrique Souza',       'Pedreiro',   'POR_PRODUCAO'),
    (v_f3_b, v_empresa_id, v_obra3_id, 'Márcio Rodrigues',     'Pintor',     'POR_PRODUCAO'),
    (v_f3_c, v_empresa_id, v_obra3_id, 'Júlio Santos',         'Reboqueiro', 'POR_PRODUCAO');

  -- ── Serviços — Obra 1 ─────────────────────────────────────────────────────
  INSERT INTO servico (id, obra_id, nome, unidade_medida, valor_pagamento, valor_cobranca)
  VALUES
    (v_s1_alv, v_obra1_id, 'Alvenaria de tijolo',   'M2', 28.00, 45.00),
    (v_s1_reb, v_obra1_id, 'Reboco interno',         'M2', 14.00, 22.00),
    (v_s1_pin, v_obra1_id, 'Pintura interna',        'M2',  9.00, 15.00),
    (v_s1_cer, v_obra1_id, 'Assentamento cerâmica',  'M2', 22.00, 38.00);

  -- ── Serviços — Obra 2 ─────────────────────────────────────────────────────
  INSERT INTO servico (id, obra_id, nome, unidade_medida, valor_pagamento, valor_cobranca)
  VALUES
    (v_s2_est, v_obra2_id, 'Estrutura metálica',     'M2', 45.00, 80.00),
    (v_s2_pso, v_obra2_id, 'Piso industrial',         'M2', 35.00, 60.00),
    (v_s2_dry, v_obra2_id, 'Drywall',                 'M2', 18.00, 32.00),
    (v_s2_pin, v_obra2_id, 'Pintura industrial',      'M2', 12.00, 20.00);

  -- ── Serviços — Obra 3 ─────────────────────────────────────────────────────
  INSERT INTO servico (id, obra_id, nome, unidade_medida, valor_pagamento, valor_cobranca)
  VALUES
    (v_s3_alv, v_obra3_id, 'Alvenaria estrutural',   'M2', 32.00, 55.00),
    (v_s3_reb, v_obra3_id, 'Reboco externo',          'M2', 16.00, 28.00),
    (v_s3_pin, v_obra3_id, 'Pintura hospitalar',      'M2', 20.00, 35.00),
    (v_s3_pso, v_obra3_id, 'Assentamento piso',       'M2', 25.00, 42.00);

  -- ── Medições — Obra 1 ────────────────────────────────────────────────────
  -- Março
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra1_id, v_f1_a, v_s1_alv, '2026-03-03', 18.5, 518.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_a, v_s1_alv, '2026-03-10', 22.0, 616.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_a, v_s1_reb, '2026-03-17', 30.0, 420.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_b, v_s1_cer, '2026-03-04', 12.5, 275.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_b, v_s1_cer, '2026-03-11', 14.0, 308.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_c, v_s1_pin, '2026-03-05', 45.0, 405.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_c, v_s1_pin, '2026-03-12', 50.0, 450.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_d, v_s1_reb, '2026-03-06', 25.0, 350.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_e, v_s1_reb, '2026-03-07', 28.0, 392.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_e, v_s1_alv, '2026-03-14', 15.0, 420.00, v_usuario_id, 'ativa');

  -- Abril
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra1_id, v_f1_a, v_s1_alv, '2026-04-02', 24.0, 672.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_a, v_s1_reb, '2026-04-09', 35.0, 490.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_b, v_s1_cer, '2026-04-03', 16.0, 352.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_b, v_s1_cer, '2026-04-10', 18.5, 407.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_c, v_s1_pin, '2026-04-04', 55.0, 495.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_d, v_s1_reb, '2026-04-05', 30.0, 420.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_e, v_s1_alv, '2026-04-06', 20.0, 560.00, v_usuario_id, 'ativa');

  -- Maio
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra1_id, v_f1_a, v_s1_alv, '2026-05-05', 26.0, 728.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_b, v_s1_cer, '2026-05-06', 20.0, 440.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_c, v_s1_pin, '2026-05-07', 60.0, 540.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_d, v_s1_reb, '2026-05-08', 32.0, 448.00, v_usuario_id, 'ativa'),
    (v_obra1_id, v_f1_e, v_s1_alv, '2026-05-09', 22.0, 616.00, v_usuario_id, 'ativa');

  -- ── Medições — Obra 2 ────────────────────────────────────────────────────
  -- Fevereiro
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra2_id, v_f2_a, v_s2_est, '2026-02-03', 15.0, 675.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_a, v_s2_est, '2026-02-10', 18.0, 810.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_b, v_s2_dry, '2026-02-04', 40.0, 720.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_c, v_s2_pso, '2026-02-05', 22.0, 770.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_d, v_s2_pin, '2026-02-06', 55.0, 660.00, v_usuario_id, 'ativa');

  -- Março
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra2_id, v_f2_a, v_s2_est, '2026-03-04', 20.0,  900.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_b, v_s2_dry, '2026-03-05', 45.0,  810.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_b, v_s2_pin, '2026-03-12', 60.0,  720.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_c, v_s2_pso, '2026-03-06', 25.0,  875.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_d, v_s2_pin, '2026-03-07', 70.0,  840.00, v_usuario_id, 'ativa');

  -- Abril
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra2_id, v_f2_a, v_s2_est, '2026-04-03', 22.0,  990.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_b, v_s2_dry, '2026-04-04', 48.0,  864.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_c, v_s2_pso, '2026-04-05', 28.0,  980.00, v_usuario_id, 'ativa'),
    (v_obra2_id, v_f2_d, v_s2_pin, '2026-04-06', 75.0,  900.00, v_usuario_id, 'ativa');

  -- ── Medições — Obra 3 ────────────────────────────────────────────────────
  -- Novembro 2025
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra3_id, v_f3_a, v_s3_alv, '2025-11-05', 12.0, 384.00, v_usuario_id, 'ativa'),
    (v_obra3_id, v_f3_a, v_s3_alv, '2025-11-12', 14.0, 448.00, v_usuario_id, 'ativa'),
    (v_obra3_id, v_f3_b, v_s3_pin, '2025-11-06', 30.0, 600.00, v_usuario_id, 'ativa'),
    (v_obra3_id, v_f3_c, v_s3_reb, '2025-11-07', 20.0, 320.00, v_usuario_id, 'ativa');

  -- Dezembro 2025
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra3_id, v_f3_a, v_s3_alv, '2025-12-03', 16.0, 512.00, v_usuario_id, 'ativa'),
    (v_obra3_id, v_f3_b, v_s3_pin, '2025-12-04', 35.0, 700.00, v_usuario_id, 'ativa'),
    (v_obra3_id, v_f3_c, v_s3_reb, '2025-12-05', 22.0, 352.00, v_usuario_id, 'ativa'),
    (v_obra3_id, v_f3_c, v_s3_pso, '2025-12-10', 15.0, 375.00, v_usuario_id, 'ativa');

  -- Janeiro 2026
  INSERT INTO medicao (obra_id, funcionario_id, servico_id, data, quantidade, valor_calculado, medido_por, status)
  VALUES
    (v_obra3_id, v_f3_a, v_s3_alv, '2026-01-07', 10.0, 320.00, v_usuario_id, 'ativa'),
    (v_obra3_id, v_f3_b, v_s3_pin, '2026-01-08', 25.0, 500.00, v_usuario_id, 'ativa');

  -- ── Pagamentos — Obra 1 ───────────────────────────────────────────────────
  -- Março (todos realizados)
  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status, pago_por, data_pagamento, forma_pagamento)
  VALUES
    (v_obra1_id, v_f1_a, '2026-03-01', '2026-03-31', 1554.00, 'realizado', v_usuario_id, '2026-04-01', 'PIX'),
    (v_obra1_id, v_f1_b, '2026-03-01', '2026-03-31',  583.00, 'realizado', v_usuario_id, '2026-04-01', 'PIX'),
    (v_obra1_id, v_f1_c, '2026-03-01', '2026-03-31',  855.00, 'realizado', v_usuario_id, '2026-04-01', 'PIX'),
    (v_obra1_id, v_f1_d, '2026-03-01', '2026-03-31',  350.00, 'realizado', v_usuario_id, '2026-04-01', 'PIX'),
    (v_obra1_id, v_f1_e, '2026-03-01', '2026-03-31',  812.00, 'realizado', v_usuario_id, '2026-04-01', 'PIX');

  -- Abril (mix: 3 realizados, 2 pendentes)
  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status, pago_por, data_pagamento, forma_pagamento)
  VALUES
    (v_obra1_id, v_f1_a, '2026-04-01', '2026-04-30', 1162.00, 'realizado', v_usuario_id, '2026-05-02', 'PIX'),
    (v_obra1_id, v_f1_b, '2026-04-01', '2026-04-30',  759.00, 'realizado', v_usuario_id, '2026-05-02', 'PIX'),
    (v_obra1_id, v_f1_e, '2026-04-01', '2026-04-30',  560.00, 'realizado', v_usuario_id, '2026-05-02', 'PIX');

  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status)
  VALUES
    (v_obra1_id, v_f1_c, '2026-04-01', '2026-04-30',  495.00, 'pendente'),
    (v_obra1_id, v_f1_d, '2026-04-01', '2026-04-30',  420.00, 'pendente');

  -- ── Pagamentos — Obra 2 ───────────────────────────────────────────────────
  -- Fevereiro (todos realizados)
  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status, pago_por, data_pagamento, forma_pagamento)
  VALUES
    (v_obra2_id, v_f2_a, '2026-02-01', '2026-02-28', 1485.00, 'realizado', v_usuario_id, '2026-03-03', 'PIX'),
    (v_obra2_id, v_f2_b, '2026-02-01', '2026-02-28',  720.00, 'realizado', v_usuario_id, '2026-03-03', 'PIX'),
    (v_obra2_id, v_f2_c, '2026-02-01', '2026-02-28',  770.00, 'realizado', v_usuario_id, '2026-03-03', 'PIX'),
    (v_obra2_id, v_f2_d, '2026-02-01', '2026-02-28',  660.00, 'realizado', v_usuario_id, '2026-03-03', 'PIX');

  -- Março (todos realizados)
  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status, pago_por, data_pagamento, forma_pagamento)
  VALUES
    (v_obra2_id, v_f2_a, '2026-03-01', '2026-03-31',  900.00, 'realizado', v_usuario_id, '2026-04-02', 'PIX'),
    (v_obra2_id, v_f2_b, '2026-03-01', '2026-03-31', 1530.00, 'realizado', v_usuario_id, '2026-04-02', 'PIX'),
    (v_obra2_id, v_f2_c, '2026-03-01', '2026-03-31',  875.00, 'realizado', v_usuario_id, '2026-04-02', 'PIX'),
    (v_obra2_id, v_f2_d, '2026-03-01', '2026-03-31',  840.00, 'realizado', v_usuario_id, '2026-04-02', 'PIX');

  -- Abril (todos pendentes)
  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status)
  VALUES
    (v_obra2_id, v_f2_a, '2026-04-01', '2026-04-30',  990.00, 'pendente'),
    (v_obra2_id, v_f2_b, '2026-04-01', '2026-04-30', 1764.00, 'pendente'),
    (v_obra2_id, v_f2_c, '2026-04-01', '2026-04-30',  980.00, 'pendente'),
    (v_obra2_id, v_f2_d, '2026-04-01', '2026-04-30',  900.00, 'pendente');

  -- ── Pagamentos — Obra 3 ───────────────────────────────────────────────────
  -- Novembro 2025 (todos realizados)
  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status, pago_por, data_pagamento, forma_pagamento)
  VALUES
    (v_obra3_id, v_f3_a, '2025-11-01', '2025-11-30',  832.00, 'realizado', v_usuario_id, '2025-12-01', 'PIX'),
    (v_obra3_id, v_f3_b, '2025-11-01', '2025-11-30',  600.00, 'realizado', v_usuario_id, '2025-12-01', 'PIX'),
    (v_obra3_id, v_f3_c, '2025-11-01', '2025-11-30',  320.00, 'realizado', v_usuario_id, '2025-12-01', 'PIX');

  -- Dezembro 2025 (2 realizados, 1 pendente)
  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status, pago_por, data_pagamento, forma_pagamento)
  VALUES
    (v_obra3_id, v_f3_a, '2025-12-01', '2025-12-31',  512.00, 'realizado', v_usuario_id, '2026-01-02', 'PIX'),
    (v_obra3_id, v_f3_b, '2025-12-01', '2025-12-31',  700.00, 'realizado', v_usuario_id, '2026-01-02', 'PIX');

  INSERT INTO pagamento (obra_id, funcionario_id, periodo_inicio, periodo_fim, valor_total, status)
  VALUES
    (v_obra3_id, v_f3_c, '2025-12-01', '2025-12-31',  727.00, 'pendente');

  RAISE NOTICE '✓ Seed concluído: 3 obras, 12 funcionários, 4 serviços/obra, ~60 medições, pagamentos inseridos.';

END $$;
