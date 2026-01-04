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
    console.log('🔄 Starting route proposal migration...\n');

    const migrationSql = readFileSync(join(__dirname, 'add_route_proposal.sql'), 'utf-8');

    // Execute the migration
    await sql.unsafe(migrationSql);

    console.log('✅ Route proposal migration completed successfully!\n');
    console.log('📋 Changes applied:');
    console.log('   - Added proposed_driver_id column to routes table');
    console.log('   - Added route_status enum (PENDING, ACCEPTED, REJECTED)');
    console.log('   - Added status column to routes table');
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

