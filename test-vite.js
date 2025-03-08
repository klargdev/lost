import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.production
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing with environment variables:');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey?.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test a simple query first
    const { data, error } = await supabase
      .from('image_groups')
      .select('*')
      .limit(1);
    
    console.log('\nDatabase query:', error ? 'Error: ' + JSON.stringify(error) : 'Success', data);
    
    // Test storage
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    console.log('\nStorage buckets:', bucketsError ? 'Error: ' + JSON.stringify(bucketsError) : buckets);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection(); 