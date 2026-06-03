-- Sprint 24 — Fix 1: Cancelamento de pagamento pendente
-- Adiciona status 'cancelado' e coluna motivo_cancelamento

ALTER TABLE pagamento
  DROP CONSTRAINT IF EXISTS pagamento_status_check;

ALTER TABLE pagamento
  ADD CONSTRAINT pagamento_status_check
    CHECK (status IN ('pendente', 'realizado', 'cancelado'));

ALTER TABLE pagamento
  ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;
