import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szhvcthgozkfttnhzbqt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aHZjdGhnb3prZnR0bmh6YnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzA3NzYsImV4cCI6MjAyNTQwNjc3Nn0.Nh83ebqzf9Yt_1iHLJckxbv-R4QgbqGGlgcjXYPEL-E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSPolicies() {
  console.log('Testing RLS policies...');
  
  // Test image_groups table
  console.log('Testing image_groups table...');
  
  // Test SELECT
  const { data: selectGroups, error: selectGroupsError } = await supabase
    .from('image_groups')
    .select('*')
    .limit(1);
  
  console.log('SELECT from image_groups:', 
    selectGroupsError ? `Error: ${JSON.stringify(selectGroupsError)}` : 'Success');
  
  // Test INSERT
  const testGroupName = `test_group_${Date.now()}`;
  const { data: insertGroup, error: insertGroupError } = await supabase
    .from('image_groups')
    .insert([{ name: testGroupName, description: 'Test group' }])
    .select();
  
  console.log('INSERT into image_groups:', 
    insertGroupError ? `Error: ${JSON.stringify(insertGroupError)}` : 'Success');
  
  // Test image_metadata table
  console.log('Testing image_metadata table...');
  
  // Test SELECT
  const { data: selectMetadata, error: selectMetadataError } = await supabase
    .from('image_metadata')
    .select('*')
    .limit(1);
  
  console.log('SELECT from image_metadata:', 
    selectMetadataError ? `Error: ${JSON.stringify(selectMetadataError)}` : 'Success');
  
  // Test INSERT
  const testFilename = `test_file_${Date.now()}.jpg`;
  const { data: insertMetadata, error: insertMetadataError } = await supabase
    .from('image_metadata')
    .insert([{ 
      filename: testFilename, 
      caption: 'Test file', 
      group_id: insertGroup?.[0]?.id || null 
    }])
    .select();
  
  console.log('INSERT into image_metadata:', 
    insertMetadataError ? `Error: ${JSON.stringify(insertMetadataError)}` : 'Success');
  
  // Clean up test data
  if (insertGroup?.[0]?.id) {
    await supabase.from('image_groups').delete().eq('id', insertGroup[0].id);
  }
  if (!insertMetadataError) {
    await supabase.from('image_metadata').delete().eq('filename', testFilename);
  }
  
  return {
    groupsSelect: !selectGroupsError,
    groupsInsert: !insertGroupError,
    metadataSelect: !selectMetadataError,
    metadataInsert: !insertMetadataError
  };
}

testRLSPolicies().then(console.log).catch(console.error); 