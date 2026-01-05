import { config } from '../config/env';

/**
 * Supabase REST API Client
 * Handles all database operations via Supabase REST API
 */

// Base URL for Supabase REST API
const SUPABASE_BASE_URL = config.supabaseUrl;
const SUPABASE_ANON_KEY = config.supabaseAnonKey;

if (!SUPABASE_BASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

/**
 * Query options for Supabase REST API
 */
interface QueryOptions {
  select?: string; // Column selection (e.g., "id,name,email")
  filter?: string; // PostgREST filter (e.g., "id.eq.123")
  order?: string; // Order by (e.g., "created_at.desc")
  limit?: number;
  offset?: number;
}

/**
 * Supabase REST API client
 */
export class SupabaseClient {
  /**
   * Select records from a table
   */
  static async select<T>(
    table: string,
    options?: QueryOptions
  ): Promise<T[]> {
    const url = `${SUPABASE_BASE_URL}/rest/v1/${table}`;
    
    const queryParams: string[] = [];
    if (options?.select) {
      queryParams.push(`select=${options.select}`);
    }
    if (options?.filter) {
      queryParams.push(options.filter);
    }
    if (options?.order) {
      queryParams.push(`order=${options.order}`);
    }
    if (options?.limit) {
      queryParams.push(`limit=${options.limit}`);
    }
    if (options?.offset) {
      queryParams.push(`offset=${options.offset}`);
    }
    
    const fullUrl = queryParams.length > 0 ? `${url}?${queryParams.join('&')}` : url;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw new Error(
        errorData?.message || errorData?.error_description || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    
    return await response.json() as T[];
  }
  
  /**
   * Select a single record by ID
   */
  static async selectOne<T>(
    table: string,
    id: string,
    options?: { select?: string }
  ): Promise<T | null> {
    const url = `${SUPABASE_BASE_URL}/rest/v1/${table}`;
    
    const queryParams: string[] = [`id=eq.${id}`];
    if (options?.select) {
      queryParams.push(`select=${options.select}`);
    }
    queryParams.push('limit=1');
    
    const fullUrl = `${url}?${queryParams.join('&')}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw new Error(
        errorData?.message || errorData?.error_description || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    
    const data = await response.json() as T[];
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  }
  
  /**
   * Insert a record
   */
  static async insert<T>(table: string, data: Partial<T>): Promise<T> {
    const url = `${SUPABASE_BASE_URL}/rest/v1/${table}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw new Error(
        errorData?.message || errorData?.error_description || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    
    const result = await response.json() as T[] | T;
    return Array.isArray(result) ? result[0] : result;
  }
  
  /**
   * Update records
   */
  static async update<T>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<T | null> {
    const url = `${SUPABASE_BASE_URL}/rest/v1/${table}?id=eq.${id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw new Error(
        errorData?.message || errorData?.error_description || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    
    const result = await response.json() as T[];
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }
  
  /**
   * Delete a record
   */
  static async delete(table: string, id: string): Promise<void> {
    const url = `${SUPABASE_BASE_URL}/rest/v1/${table}?id=eq.${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw new Error(
        errorData?.message || errorData?.error_description || `HTTP ${response.status}: ${response.statusText}`
      );
    }
  }
  
  /**
   * Test connection to Supabase
   */
  static async testConnection(): Promise<void> {
    try {
      // Try to query a system table or make a simple request
      const url = `${SUPABASE_BASE_URL}/rest/v1/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (response.status === 200 || response.status === 404) {
        // 404 is OK - it means the API is reachable
        console.log('✅ Supabase REST API connected successfully');
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Supabase REST API connection failed:', error);
      throw error;
    }
  }
}

export default SupabaseClient;

