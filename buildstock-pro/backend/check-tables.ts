import { supabase } from './src/utils/database';

async function checkTables() {
  console.log('Checking if tables exist...\n');

  const tables = ['quotes', 'quote_items', 'quote_responses'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`${table}: ❌ Does not exist (${error.code})`);
      } else {
        console.log(`${table}: ✅ Exists`);
      }
    } catch (err) {
      console.log(`${table}: ❌ Error - ${err}`);
    }
  }
}

checkTables().catch(console.error);
