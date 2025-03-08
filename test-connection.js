import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szhvcthgozkfttnhzbqt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aHZjdGhnb3prZnR0bmh6YnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzA3NzYsImV4cCI6MjAyNTQwNjc3Nn0.Nh83ebqzf9Yt_1iHLJckxbv-R4QgbqGGlgcjXYPEL-E';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple test to list buckets
async function testConnection() {
  try {
    console.log('\nTesting Supabase connection...');
    
    // Try to list storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      console.log('Successfully listed buckets:', buckets);
    }
    
    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
    } else {
      console.log('User:', user);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection(); 