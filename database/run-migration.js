// Simple migration runner for Supabase
// Run this with: node database/run-migration.js
// Make sure DATABASE_URL is set in your .env file

require('dotenv').config();
const { readFileSync } = require('fs');
const { join } = require('path');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 1, // Single connection for migration
});

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...\n');
    console.log('📦 Step 1: Running init.sql (extensions)...\n');

    // Read and execute init.sql
    const initSql = readFileSync(join(__dirname, 'init.sql'), 'utf-8');
    const initLines = initSql.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('/*');
    });

    for (const line of initLines) {
      if (line.toUpperCase().includes('CREATE EXTENSION')) {
        try {
          await sql.unsafe(line);
          const extName = line.match(/CREATE EXTENSION.*?(\w+)/i)?.[1];
          console.log(`  ✓ ${extName || 'extension'}`);
        } catch (error) {
          if (error.message?.includes('already exists')) {
            const extName = line.match(/CREATE EXTENSION.*?(\w+)/i)?.[1];
            console.log(`  ⊙ ${extName || 'extension'} (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n📋 Step 2: Running schema.sql (tables, indexes, functions)...\n');

    // Read schema.sql
    const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

    // Smart SQL statement parser that handles dollar-quoted strings
    function parseSQLStatements(sql) {
      const statements = [];
      let current = '';
      let inDollarQuote = false;
      let dollarTag = '';
      let i = 0;

      while (i < sql.length) {
        const char = sql[i];
        const nextChar = sql[i + 1];

        // Check for dollar-quoted strings ($$ or $tag$)
        if (char === '$' && !inDollarQuote) {
          // Find the closing $
          let tagEnd = i + 1;
          while (tagEnd < sql.length && sql[tagEnd] !== '$') {
            tagEnd++;
          }
          if (tagEnd < sql.length) {
            dollarTag = sql.substring(i, tagEnd + 1);
            inDollarQuote = true;
            current += dollarTag;
            i = tagEnd + 1;
            continue;
          }
        } else if (inDollarQuote && sql.substring(i, i + dollarTag.length) === dollarTag) {
          current += dollarTag;
          i += dollarTag.length;
          inDollarQuote = false;
          dollarTag = '';
          continue;
        }

        // If we're in a dollar-quoted string, just add the character
        if (inDollarQuote) {
          current += char;
          i++;
          continue;
        }

        // Check for statement terminator (semicolon outside quotes)
        if (char === ';') {
          const trimmed = current.trim();
          if (trimmed.length > 0) {
            statements.push(trimmed);
          }
          current = '';
          i++;
          continue;
        }

        current += char;
        i++;
      }

      // Add remaining statement
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }

      return statements
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length > 10);
    }

    // Remove comments first
    let cleanedSql = schemaSql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments

    const statements = parseSQLStatements(cleanedSql);

    let executed = 0;
    let skipped = 0;

    for (const statement of statements) {
      try {
        await sql.unsafe(statement);
        executed++;

        // Log important operations
        const upper = statement.toUpperCase();
        if (upper.startsWith('CREATE TYPE')) {
          const match = statement.match(/CREATE TYPE\s+(\w+)/i);
          if (match) console.log(`  ✓ Type: ${match[1]}`);
        } else if (upper.startsWith('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE\s+(\w+)/i);
          if (match) console.log(`  ✓ Table: ${match[1]}`);
        } else if (upper.startsWith('CREATE INDEX')) {
          const match = statement.match(/CREATE INDEX\s+(\w+)/i);
          if (match && !match[1].includes('idx_')) {
            console.log(`  ✓ Index: ${match[1]}`);
          }
        } else if (upper.startsWith('CREATE OR REPLACE FUNCTION')) {
          const match = statement.match(/CREATE OR REPLACE FUNCTION\s+(\w+)/i);
          if (match) console.log(`  ✓ Function: ${match[1]}`);
        } else if (upper.startsWith('CREATE TRIGGER')) {
          const match = statement.match(/CREATE TRIGGER\s+(\w+)/i);
          if (match) console.log(`  ✓ Trigger: ${match[1]}`);
        } else if (upper.startsWith('CREATE OR REPLACE VIEW')) {
          const match = statement.match(/CREATE OR REPLACE VIEW\s+(\w+)/i);
          if (match) console.log(`  ✓ View: ${match[1]}`);
        }
      } catch (error) {
        if (
          error.message?.includes('already exists') ||
          error.message?.includes('duplicate') ||
          error.code === '42P07' ||
          error.code === '42710'
        ) {
          skipped++;
          continue;
        }
        console.error(`\n❌ Error: ${error.message}`);
        console.error(`Statement: ${statement.substring(0, 150)}...\n`);
        throw error;
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   Executed: ${executed} statements`);
    if (skipped > 0) {
      console.log(`   Skipped (already exists): ${skipped} statements`);
    }

    // Verify tables
    console.log('\n📊 Verifying database...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`   Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runMigration();

