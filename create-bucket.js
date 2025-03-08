import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.production
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBucket() {
  try {
    console.log('Creating gallery bucket...');
    
    const { data, error } = await supabase.storage.createBucket('gallary_images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket created successfully:', data);
      
      // Update bucket to be public
      const { error: updateError } = await supabase.storage
        .updateBucket('gallary_images', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });
        
      if (updateError) {
        console.error('Error updating bucket settings:', updateError);
      } else {
        console.log('Bucket settings updated successfully');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createBucket(); 