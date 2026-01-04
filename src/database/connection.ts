import postgres from 'postgres';
import { config } from '../config/env';

// Get connection string from environment
const connectionString = config.databaseUrl;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres connection with configuration
const sql = postgres(connectionString, {
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
  debug: config.nodeEnv === 'development',
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<void> {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Close database connection gracefully
 */
export async function closeConnection(): Promise<void> {
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

export default sql;

