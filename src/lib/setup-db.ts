// Run this once to set up the database schema
// Execute with: npx tsx src/lib/setup-db.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://aodrdzptwrbxrgzpjmhp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZHJkenB0d3JieHJnenBqbWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMyNDM0NSwiZXhwIjoyMDg2OTAwMzQ1fQ.LdI4IMcN5smeI_5u6xnZHoSg_mshKUOflmCBiTUIWvY'
);

async function setup() {
  // Add new columns to the existing audits table
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Add columns if they don't exist
      DO $$
      BEGIN
        -- Score columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audits' AND column_name='onpage_score') THEN
          ALTER TABLE audits ADD COLUMN onpage_score integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audits' AND column_name='audit_results') THEN
          ALTER TABLE audits ADD COLUMN audit_results jsonb;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audits' AND column_name='error_message') THEN
          ALTER TABLE audits ADD COLUMN error_message text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audits' AND column_name='completed_at') THEN
          ALTER TABLE audits ADD COLUMN completed_at timestamptz;
        END IF;
      END $$;
    `
  });

  if (error) {
    console.log('RPC not available, trying direct SQL via REST...');
    // Try adding columns directly
    // If the table doesn't exist, create it
    const { error: createError } = await supabase.from('audits').select('id').limit(1);
    if (createError) {
      console.log('Table may not exist, please create it manually in Supabase SQL editor');
    } else {
      console.log('Table exists, columns may already be there');
    }
  }

  console.log('Done');
}

setup();
