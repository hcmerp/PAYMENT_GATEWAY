-- Auto Withdraw System - Database Schema
-- PostgreSQL - Chosen for ACID compliance, transaction support, and data integrity

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id VARCHAR(255) NOT NULL UNIQUE,
    gateway VARCHAR(50) NOT NULL,
    gateway_tx_id VARCHAR(255),
    type VARCHAR(50) NOT NULL DEFAULT 'withdraw',
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    raw_request TEXT,
    raw_response TEXT,
    callback_payload TEXT,
    error_code VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_tx_id ON transactions(gateway_tx_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway ON transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE
    ON transactions FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE transactions IS 'Stores all withdrawal/payout transaction records';
COMMENT ON COLUMN transactions.id IS 'Unique transaction identifier (UUID)';
COMMENT ON COLUMN transactions.reference_id IS 'External system transaction ID - must be unique';
COMMENT ON COLUMN transactions.gateway_tx_id IS 'Gateway provider transaction ID';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount (8 decimal precision)';
COMMENT ON COLUMN transactions.status IS 'Transaction status: PENDING, PROCESSING, SUCCESS, FAILED, UNKNOWN';
COMMENT ON COLUMN transactions.raw_request IS 'Raw request payload sent to gateway (JSON string)';
COMMENT ON COLUMN transactions.raw_response IS 'Raw response from gateway (JSON string)';
COMMENT ON COLUMN transactions.callback_payload IS 'Raw webhook callback payload (JSON string)';