const { readFileSync } = require('fs');
const { join } = require('path');
const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  try {
    console.log('🔄 Starting subscription migration...\n');

    const migrationSql = readFileSync(join(__dirname, 'add_subscriptions.sql'), 'utf-8');

    // Execute the migration
    await sql.unsafe(migrationSql);

    console.log('✅ Subscription migration completed successfully!\n');
    console.log('📋 Changes applied:');
    console.log('   - Added subscription_type enum (WEEKLY, MONTHLY)');
    console.log('   - Added subscription_status enum (ACTIVE, PAUSED, CANCELLED, EXPIRED)');
    console.log('   - Created subscriptions table');
    console.log('   - Added subscription_id column to rides table');
    console.log('   - Added indexes for better query performance\n');

    await sql.end();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    await sql.end();
    process.exit(1);
  }
}

runMigration();

