/**
 * OTP (One-Time Password) Service
 *
 * This service implements SMS OTP via Vonage Verify using simple REST calls.
 * We intentionally avoid adding an SDK dependency and rely on Node 18+ `fetch`.
 *
 * Required environment variables:
 * - VONAGE_API_KEY
 * - VONAGE_API_SECRET
 *
 * Optional environment variables:
 * - VONAGE_BRAND (defaults to "Zuanga")
 */

type VonageVerifyBaseResponse = {
  status?: string; // "0" means success in Vonage Verify
  error_text?: string;
  [key: string]: unknown;
};

export type OtpStartResult = {
  request_id: string;
  status: string;
};

export type OtpCheckResult = {
  status: string;
  // Vonage may include `event_id` on success; keep it optional to avoid tight coupling
  event_id?: string;
};

export type OtpCancelResult = {
  status: string;
  command?: string;
};

export class OtpService {
  // Vonage Verify REST endpoints (Nexmo legacy domain is still used for Verify)
  private static readonly START_URL = 'https://api.nexmo.com/verify/json';
  private static readonly CHECK_URL = 'https://api.nexmo.com/verify/check/json';
  private static readonly CONTROL_URL = 'https://api.nexmo.com/verify/control/json';

  /**
   * Start an OTP verification request.
   */
  static async startVerification(input: { phoneNumber: string; brand?: string }): Promise<OtpStartResult> {
    const { apiKey, apiSecret, brand } = this.getVonageConfig(input.brand);

    const response = await this.postForm<VonageVerifyBaseResponse>(this.START_URL, {
      api_key: apiKey,
      api_secret: apiSecret,
      number: input.phoneNumber,
      brand,
    });

    // Vonage success is `status: "0"`
    if (response.status !== '0') {
      throw new Error(response.error_text || 'Failed to start OTP verification');
    }

    const requestId = String((response as any).request_id || '');
    if (!requestId) {
      throw new Error('Vonage did not return request_id');
    }

    return {
      request_id: requestId,
      status: '0',
    };
  }

  /**
   * Check an OTP code for a given request_id.
   */
  static async checkVerification(input: { requestId: string; code: string }): Promise<OtpCheckResult> {
    const { apiKey, apiSecret } = this.getVonageConfig();

    const response = await this.postForm<VonageVerifyBaseResponse>(this.CHECK_URL, {
      api_key: apiKey,
      api_secret: apiSecret,
      request_id: input.requestId,
      code: input.code,
    });

    if (response.status !== '0') {
      throw new Error(response.error_text || 'Invalid or expired OTP code');
    }

    return {
      status: '0',
      event_id: (response as any).event_id ? String((response as any).event_id) : undefined,
    };
  }

  /**
   * Cancel an OTP verification request.
   */
  static async cancelVerification(input: { requestId: string }): Promise<OtpCancelResult> {
    const { apiKey, apiSecret } = this.getVonageConfig();

    const response = await this.postForm<VonageVerifyBaseResponse>(this.CONTROL_URL, {
      api_key: apiKey,
      api_secret: apiSecret,
      request_id: input.requestId,
      cmd: 'cancel',
    });

    if (response.status !== '0') {
      throw new Error(response.error_text || 'Failed to cancel OTP request');
    }

    return {
      status: '0',
      command: (response as any).command ? String((response as any).command) : 'cancel',
    };
  }

  /**
   * Reads Vonage env configuration.
   * NOTE: We validate presence here so the server can still start even if OTP isn't used.
   */
  private static getVonageConfig(brandOverride?: string): { apiKey: string; apiSecret: string; brand: string } {
    const apiKey = process.env.VONAGE_API_KEY || '';
    const apiSecret = process.env.VONAGE_API_SECRET || '';
    const brand = brandOverride || process.env.VONAGE_BRAND || 'Zuanga';

    if (!apiKey || !apiSecret) {
      // Keep message explicit to reduce debugging time.
      throw new Error('Missing Vonage configuration (VONAGE_API_KEY / VONAGE_API_SECRET)');
    }

    return { apiKey, apiSecret, brand };
  }

  /**
   * Helper: POST application/x-www-form-urlencoded and parse JSON.
   */
  private static async postForm<T = unknown>(url: string, body: Record<string, string>): Promise<T> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      // Ensure we only send strings
      params.append(key, String(value));
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // Even on HTTP 200, Vonage returns error status in JSON; still handle non-2xx defensively.
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Unexpected response from OTP provider');
    }

    if (!res.ok) {
      const maybeError = (json as any)?.error_text ? String((json as any).error_text) : undefined;
      throw new Error(maybeError || `OTP provider error (HTTP ${res.status})`);
    }

    return json as T;
  }
}

