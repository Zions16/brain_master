-- Sprint 13: adiciona tipo de cobrança ao serviço (empreitada vs diária)
ALTER TABLE servico
  ADD COLUMN tipo_cobranca TEXT NOT NULL DEFAULT 'empreitada'
    CHECK (tipo_cobranca IN ('empreitada', 'diaria'));
