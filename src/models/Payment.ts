import sql from '../database/connection';

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

/**
 * Payment interface matching database schema
 */
export interface Payment {
  id: string;
  ride_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transaction_id: string | null;
  provider_response: any | null; // JSONB
  created_at: Date;
  updated_at: Date;
  processed_at: Date | null;
}

/**
 * Payment creation input
 */
export interface CreatePaymentInput {
  ride_id: string;
  user_id: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  transaction_id?: string;
  provider_response?: any;
}

/**
 * Payment update input
 */
export interface UpdatePaymentInput {
  status?: PaymentStatus;
  transaction_id?: string;
  provider_response?: any;
  processed_at?: Date | string;
}

/**
 * Payment model with database operations
 */
export class PaymentModel {
  /**
   * Create a new payment
   */
  static async create(input: CreatePaymentInput): Promise<Payment> {
    const [payment] = await sql<Payment[]>`
      INSERT INTO payments (
        ride_id, user_id, amount, currency, status, method,
        transaction_id, provider_response
      )
      VALUES (
        ${input.ride_id}, ${input.user_id}, ${input.amount},
        ${input.currency || 'USD'}, ${PaymentStatus.PENDING}::payment_status,
        ${input.method}::payment_method,
        ${input.transaction_id || null},
        ${input.provider_response ? JSON.stringify(input.provider_response) : null}::jsonb
      )
      RETURNING *
    `;
    return payment;
  }

  /**
   * Find payment by ID
   */
  static async findById(id: string): Promise<Payment | null> {
    const [payment] = await sql<Payment[]>`
      SELECT * FROM payments WHERE id = ${id} LIMIT 1
    `;
    return payment || null;
  }

  /**
   * Find payments by ride ID
   */
  static async findByRideId(rideId: string): Promise<Payment[]> {
    return await sql<Payment[]>`
      SELECT * FROM payments 
      WHERE ride_id = ${rideId}
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find payments by user ID
   */
  static async findByUserId(userId: string): Promise<Payment[]> {
    return await sql<Payment[]>`
      SELECT * FROM payments 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find payments by status
   */
  static async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return await sql<Payment[]>`
      SELECT * FROM payments 
      WHERE status = ${status}::payment_status
      ORDER BY created_at DESC
    `;
  }

  /**
   * Update payment
   */
  static async update(id: string, input: UpdatePaymentInput): Promise<Payment | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}::payment_status`);
      values.push(input.status);
    }
    if (input.transaction_id !== undefined) {
      updates.push(`transaction_id = $${paramIndex++}`);
      values.push(input.transaction_id || null);
    }
    if (input.provider_response !== undefined) {
      updates.push(`provider_response = $${paramIndex++}::jsonb`);
      values.push(input.provider_response ? JSON.stringify(input.provider_response) : null);
    }
    if (input.processed_at !== undefined) {
      updates.push(`processed_at = $${paramIndex++}`);
      values.push(input.processed_at || null);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE payments SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const [payment] = await sql.unsafe(query, values) as Payment[];
    return payment || null;
  }
}

