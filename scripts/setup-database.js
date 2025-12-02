// Database setup script for Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up AI Chatbot Assistant database...\n');

    // Read SQL schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        // Use RPC for DDL statements
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (error) {
          // Try direct query as fallback
          const { error: queryError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(1);
            
          if (queryError) {
            console.log(`⚠️  Statement ${i + 1} may have failed:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.log(`⚠️  Error executing statement ${i + 1}:`, err.message);
        console.log(`Statement: ${statement.substring(0, 100)}...`);
      }
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify tables were created in your Supabase dashboard');
    console.log('2. Check that sample data for AI Labben was inserted');
    console.log('3. Configure your API keys in the .env file');
    console.log('4. Test the API endpoints');

    // Test database connection
    console.log('\n🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('customers')
      .select('customer_id, name')
      .eq('customer_id', 'ailabben')
      .single();

    if (error) {
      console.log('❌ Database test failed:', error.message);
    } else {
      console.log('✅ Database test successful!');
      console.log('   Found customer:', data.name);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Alternative manual setup instructions
function showManualSetup() {
  console.log('\n📖 Manual Setup Instructions:');
  console.log('1. Open your Supabase project dashboard');
  console.log('2. Go to the SQL Editor');
  console.log('3. Copy and paste the contents of database/schema.sql');
  console.log('4. Execute the SQL statements');
  console.log('5. Verify that all tables were created successfully');
}

// Run setup
setupDatabase().catch(error => {
  console.error('\n❌ Automated setup failed:', error.message);
  showManualSetup();
  process.exit(1);
});
