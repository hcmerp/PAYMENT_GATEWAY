import { query } from './client';
import { Transaction, TransactionStatus } from '../types';

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const text = `
        INSERT INTO transactions (reference_id, gateway, gateway_tx_id, type, amount, currency, status, raw_request, raw_response, callback_payload, error_code, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
    `;

    const values = [
        transaction.referenceId,
        transaction.gateway,
        transaction.gatewayTxId || null,
        transaction.type,
        transaction.amount,
        transaction.currency,
        transaction.status,
        transaction.rawRequest || null,
        transaction.rawResponse || null,
        transaction.callbackPayload || null,
        transaction.errorCode || null,
        transaction.errorMessage || null,
    ];

    const result = await query(text, values);
    return mapRowToTransaction(result.rows[0]);
}

export async function updateTransactionStatus(id: string, status: TransactionStatus, additionalData?: Partial<Transaction>): Promise<Transaction | null> {
    const updates: string[] = ['status = $2'];
    const values: any[] = [id, status];
    let paramCount = 3;

    if (additionalData?.gatewayTxId !== undefined) {
        updates.push(`gateway_tx_id = $${paramCount++}`);
        values.push(additionalData.gatewayTxId);
    }
    if (additionalData?.rawResponse !== undefined) {
        updates.push(`raw_response = $${paramCount++}`);
        values.push(additionalData.rawResponse);
    }
    if (additionalData?.callbackPayload !== undefined) {
        updates.push(`callback_payload = $${paramCount++}`);
        values.push(additionalData.callbackPayload);
    }
    if (additionalData?.errorCode !== undefined) {
        updates.push(`error_code = $${paramCount++}`);
        values.push(additionalData.errorCode);
    }
    if (additionalData?.errorMessage !== undefined) {
        updates.push(`error_message = $${paramCount++}`);
        values.push(additionalData.errorMessage);
    }

    const text = `
        UPDATE transactions 
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING *
    `;

    const result = await query(text, values);
    return result.rows.length > 0 ? mapRowToTransaction(result.rows[0]) : null;
}

export async function findTransactionById(id: string): Promise<Transaction | null> {
    const text = 'SELECT * FROM transactions WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows.length > 0 ? mapRowToTransaction(result.rows[0]) : null;
}

export async function findTransactionByReferenceId(referenceId: string): Promise<Transaction | null> {
    const text = 'SELECT * FROM transactions WHERE reference_id = $1';
    const result = await query(text, [referenceId]);
    return result.rows.length > 0 ? mapRowToTransaction(result.rows[0]) : null;
}

export async function findTransactionByGatewayTxId(gatewayTxId: string): Promise<Transaction | null> {
    const text = 'SELECT * FROM transactions WHERE gateway_tx_id = $1';
    const result = await query(text, [gatewayTxId]);
    return result.rows.length > 0 ? mapRowToTransaction(result.rows[0]) : null;
}

export async function findAllTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
    let text = 'SELECT * FROM transactions ORDER BY created_at DESC';
    const values: any[] = [];

    if (limit !== undefined) {
        text += ` LIMIT $${values.length + 1}`;
        values.push(limit);
    }

    if (offset !== undefined) {
        text += ` OFFSET $${values.length + 1}`;
        values.push(offset);
    }

    const result = await query(text, values);
    return result.rows.map(row => mapRowToTransaction(row));
}

function mapRowToTransaction(row: any): Transaction {
    return {
        id: row.id,
        referenceId: row.reference_id,
        gateway: row.gateway,
        gatewayTxId: row.gateway_tx_id,
        type: row.type,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.status,
        rawRequest: row.raw_request,
        rawResponse: row.raw_response,
        callbackPayload: row.callback_payload,
        errorCode: row.error_code,
        errorMessage: row.error_message,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
