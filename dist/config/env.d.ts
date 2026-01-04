/**
 * Environment configuration
 * Validates and exports all environment variables
 */
export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly apiVersion: string;
    readonly apiPrefix: `/api/${string}`;
    readonly databaseUrl: string;
    readonly corsOrigin: string;
    readonly rateLimitWindowMs: number;
    readonly rateLimitMax: number;
    readonly logLevel: string;
    readonly logDir: string;
};
/**
 * Validates that all required environment variables are set
 */
export declare function validateConfig(): void;
//# sourceMappingURL=env.d.ts.map