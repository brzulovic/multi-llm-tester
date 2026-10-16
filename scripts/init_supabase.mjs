// ==============================================================================
// Node.js script to verify Supabase connection & table setup
// ==============================================================================
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, 'supabase_schema.sql');

async function main() {
  console.log('🔍 Checking Supabase configuration and setup...');

  const dbUrl = process.argv[2] || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tablePrefix = (process.env.VITE_SUPABASE_TABLE_PREFIX || 'llm_tester_').trim();
  const runsTable = `${tablePrefix}benchmark_runs`;
  const resultsTable = `${tablePrefix}benchmark_results`;

  if (existsSync(schemaPath)) {
    console.log(`✓ Supabase schema SQL file found at: ${schemaPath}`);
  } else {
    console.error(`✗ Schema file missing at: ${schemaPath}`);
    process.exit(1);
  }

  if (dbUrl) {
    console.log(`✓ Database URL detected: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
  }

  if (supabaseUrl && supabaseKey) {
    console.log(`✓ Supabase project URL: ${supabaseUrl}`);
    console.log(`✓ Supabase key provided (length: ${supabaseKey.length})`);
    console.log(`✓ Table prefix: "${tablePrefix}" (Runs table: "${runsTable}")`);
    
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log(`Testing query on ${runsTable} table...`);
      const { data, error } = await supabase.from(runsTable).select('id').limit(1);
      
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn(`⚠️ Table ${runsTable} does not exist yet. Please run the schema SQL script in Supabase SQL editor:`);
          console.log(`   File: ${schemaPath}`);
        } else {
          console.warn(`⚠️ Supabase responded with notice: ${error.message} (Code: ${error.code || 'N/A'})`);
        }
      } else {
        console.log(`✓ Successfully connected to Supabase and queried ${runsTable} table!`);
      }
    } catch (err) {
      console.log(`ℹ️ Client test note: ${err.message}`);
    }
  } else {
    console.log('ℹ️ Tip: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env to connect from the web app.');
  }

  console.log('\nReady! Use "make supabase-init" to deploy schema or view dashboard setup instructions.');
}

main().catch(err => {
  console.error('Error during Supabase verification:', err);
  process.exit(1);
});
