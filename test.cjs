const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://szhvcthgozkfttnhzbqt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aHZjdGhnb3prZnR0bmh6YnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzA3NzYsImV4cCI6MjAyNTQwNjc3Nn0.Nh83ebqzf9Yt_1iHLJckxbv-R4QgbqGGlgcjXYPEL-E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test a simple query first
    const { data, error } = await supabase
      .from('image_groups')
      .select('*')
      .limit(1);
    
    console.log('Query result:', error ? 'Error: ' + JSON.stringify(error) : 'Success', data);
    
    // Test storage
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    console.log('Storage buckets:', bucketsError ? 'Error: ' + JSON.stringify(bucketsError) : buckets);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection(); 