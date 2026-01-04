"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
exports.closeConnection = closeConnection;
const postgres_1 = __importDefault(require("postgres"));
const env_1 = require("../config/env");
// Get connection string from environment
const connectionString = env_1.config.databaseUrl;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
// Create postgres connection with configuration
const sql = (0, postgres_1.default)(connectionString, {
    // Connection pool settings
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout in seconds
    // SSL configuration for Supabase
    ssl: {
        rejectUnauthorized: false, // Supabase uses SSL
    },
    // Transform configuration
    transform: {
        undefined: null, // Transform undefined to null
    },
    // Debug mode (only in development)
    debug: env_1.config.nodeEnv === 'development',
});
/**
 * Test database connection
 */
async function testConnection() {
    try {
        await sql `SELECT 1`;
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
/**
 * Close database connection gracefully
 */
async function closeConnection() {
    await sql.end();
    console.log('Database connection closed');
}
// Graceful shutdown handlers
process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await closeConnection();
    process.exit(0);
});
exports.default = sql;
//# sourceMappingURL=connection.js.map