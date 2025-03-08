import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.production
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGalleryFunctionality() {
  console.log('Testing gallery functionality...\n');

  try {
    // 1. Test bucket access
    console.log('1. Testing storage bucket access:');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      const galleryBucket = buckets.find(b => b.name === 'gallary_images');
      console.log('✅ Found buckets:', buckets.map(b => b.name));
      console.log('Gallery bucket exists:', !!galleryBucket);
      console.log('Gallery bucket public:', galleryBucket?.public);
    }

    // 2. Test image groups table
    console.log('\n2. Testing image_groups table:');
    const { data: groups, error: groupsError } = await supabase
      .from('image_groups')
      .select('*');
    
    if (groupsError) {
      console.error('❌ Error accessing image_groups:', groupsError);
    } else {
      console.log('✅ Successfully accessed image_groups');
      console.log('Found groups:', groups.map(g => g.name));
    }

    // 3. Test image_metadata table
    console.log('\n3. Testing image_metadata table:');
    const { data: metadata, error: metadataError } = await supabase
      .from('image_metadata')
      .select('*');
    
    if (metadataError) {
      console.error('❌ Error accessing image_metadata:', metadataError);
    } else {
      console.log('✅ Successfully accessed image_metadata');
      console.log('Number of images:', metadata.length);
    }

    // 4. Test bucket contents
    console.log('\n4. Testing bucket contents:');
    const { data: files, error: filesError } = await supabase.storage
      .from('gallary_images')
      .list();
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
    } else {
      console.log('✅ Successfully listed files in bucket');
      console.log('Number of files:', files.length);
      if (files.length > 0) {
        // Try to get a public URL for the first image
        const { data: { publicUrl } } = supabase.storage
          .from('gallary_images')
          .getPublicUrl(files[0].name);
        console.log('Sample public URL:', publicUrl);
      }
    }

  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

testGalleryFunctionality(); 