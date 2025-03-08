import { createClient } from '@supabase/supabase-js';

// Hardcoded configuration for development
const supabaseUrl = 'https://szhvcthgozkfttnhzbqt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aHZjdGhnb3prZnR0bmh6YnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NjcyMzcsImV4cCI6MjA1NDQ0MzIzN30.yWN2AztrkTocthC4zjFQc3SivLqhl4b5s-Weg4lb8Lo';

// Log the Supabase configuration for debugging
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key length:", supabaseAnonKey?.length || 'Missing');

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      console.log("Attempting to sign in with Supabase");
      
      // For development/testing - bypass actual authentication
      // This allows any email/password combination to work
      if (import.meta.env.MODE === 'development') {
        console.log("Development mode: Bypassing actual authentication");
        return { 
          data: { 
            user: { email, id: 'test-user-id' },
            session: { access_token: 'fake-token' }
          }, 
          error: null 
        };
      }
      
      // For production - use actual Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
      } else {
        console.log("Supabase auth success:", data.user?.email);
      }
      
      return { data, error };
    } catch (error) {
      console.error("Exception during sign in:", error);
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error("Exception during sign out:", error);
      return { error };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      console.error("Exception getting session:", error);
      return { session: null, error };
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error("Exception getting user:", error);
      return { user: null, error };
    }
  },

  // Check if user is admin (based on user metadata or email)
  isAdmin: async () => {
    try {
      // Get the current user
      const { user, error } = await auth.getUser();
      if (error || !user) {
        console.log('No authenticated user found');
        return false;
      }

      // List of authorized admin emails
      const authorizedAdmins = [
        'kpabitey.gabriel@gmail.com',
        // Add other admin emails here
      ];

      // Check if user's email is in the authorized list
      const isAuthorizedAdmin = authorizedAdmins.includes(user.email);

      if (!isAuthorizedAdmin) {
        console.log('User is not an authorized admin:', user.email);
        return false;
      }

      console.log('Admin access granted for:', user.email);
      return true;
    } catch (error) {
      console.error("Exception checking admin status:", error);
      return false;
    }
  }
};

// Content management helpers
export const content = {
  // Reference to auth functions for use in components
  auth: auth,
  
  // Delete a guestbook post
  deleteGuestbookPost: async (postId) => {
    try {
      const { error } = await supabase
        .from('tributes')
        .delete()
        .eq('id', postId);
      return { error };
    } catch (error) {
      console.error("Exception deleting guestbook post:", error);
      return { error };
    }
  },
  
  // Delete an image from storage
  deleteImage: async (bucket, fileName) => {
    try {
      const { error } = await supabase
        .storage
        .from(bucket)
        .remove([fileName]);
      return { error };
    } catch (error) {
      console.error("Exception deleting image:", error);
      return { error };
    }
  },

  // Gallery management functions
  gallery: {
    // Initialize gallery bucket if it doesn't exist
    initializeBucket: async () => {
      try {
        const bucketName = 'gallary_images';
        
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase
          .storage
          .listBuckets();
        
        if (listError) {
          console.error('Error listing buckets:', listError);
          return { error: listError };
        }

        const bucketExists = buckets.some(bucket => bucket.name === bucketName);
        
        if (!bucketExists) {
          console.log('Creating gallery bucket...');
          const { error: createError } = await supabase
            .storage
            .createBucket(bucketName, {
              public: true,
              fileSizeLimit: 5242880, // 5MB
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            });
            
          if (createError) {
            console.error('Error creating bucket:', createError);
            // If we get an RLS error, the bucket might already exist
            if (createError.message.includes('row-level security policy')) {
              console.log('Bucket might already exist, proceeding...');
            } else {
              return { error: createError };
            }
          }
          
          console.log('Gallery bucket created successfully');
        } else {
          console.log('Gallery bucket already exists');
        }
        
        // Initialize the image_groups table if it doesn't exist
        await content.gallery.initializeImageGroupsTable();
        
        return { error: null };
      } catch (error) {
        console.error('Exception initializing gallery bucket:', error);
        // If we get an RLS error, the bucket might already exist
        if (error.message && error.message.includes('row-level security policy')) {
          console.log('Bucket might already exist, proceeding...');
          return { error: null };
        }
        return { error };
      }
    },

    // Initialize the image_groups table
    initializeImageGroupsTable: async () => {
      try {
        // Check if the table exists by trying to get a record
        const { count, error: countError } = await supabase
          .from('image_groups')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Error checking image_groups table:', countError);
          
          // Create default groups if the table doesn't exist or is empty
          const defaultGroups = [
            { name: 'Family', description: 'Family photos' },
            { name: 'Friends', description: 'Photos with friends' },
            { name: 'Memories', description: 'Special memories' }
          ];
          
          for (const group of defaultGroups) {
            await content.gallery.createImageGroup(group.name, group.description);
          }
        } else if (count === 0) {
          // Table exists but is empty, create default groups
          const defaultGroups = [
            { name: 'Family', description: 'Family photos' },
            { name: 'Friends', description: 'Photos with friends' },
            { name: 'Memories', description: 'Special memories' }
          ];
          
          for (const group of defaultGroups) {
            await content.gallery.createImageGroup(group.name, group.description);
          }
        }
        
        return { error: null };
      } catch (error) {
        console.error('Exception initializing image groups table:', error);
        return { error };
      }
    },
    
    // Get all image groups
    getImageGroups: async () => {
      try {
        const { data, error } = await supabase
          .from('image_groups')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching image groups:', error);
          return { groups: [], error };
        }
        
        return { groups: data || [], error: null };
      } catch (error) {
        console.error('Exception fetching image groups:', error);
        return { groups: [], error };
      }
    },
    
    // Create a new image group
    createImageGroup: async (name, description = '') => {
      try {
        if (!name) {
          return { error: new Error('Group name is required') };
        }
        
        const { data, error } = await supabase
          .from('image_groups')
          .insert([{ name, description }])
          .select();
          
        if (error) {
          console.error('Error creating image group:', error);
          return { group: null, error };
        }
        
        return { group: data?.[0] || null, error: null };
      } catch (error) {
        console.error('Exception creating image group:', error);
        return { group: null, error };
      }
    },
    
    // Delete an image group
    deleteImageGroup: async (groupId) => {
      try {
        const { error } = await supabase
          .from('image_groups')
          .delete()
          .eq('id', groupId);
          
        if (error) {
          console.error('Error deleting image group:', error);
          return { error };
        }
        
        // Also update any images that were in this group to have no group
        const { error: updateError } = await supabase
          .from('image_metadata')
          .update({ group_id: null })
          .eq('group_id', groupId);
          
        if (updateError) {
          console.error('Error updating images after group deletion:', updateError);
        }
        
        return { error: null };
      } catch (error) {
        console.error('Exception deleting image group:', error);
        return { error };
      }
    },

    // List all images in the gallery
    async listImages(groupId = null) {
      try {
        // Ensure the bucket exists
        await ensureStorageBucketExists();

        // Get all files from storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('gallary_images')
          .list();

        if (storageError) {
          console.error('Error listing images from storage:', storageError);
          throw storageError;
        }

        console.log('Storage data:', storageData);

        // Get all metadata
        const { data: metadataData, error: metadataError } = await supabase
          .from('image_metadata')
          .select('*, group:group_id(*)');

        if (metadataError) {
          console.error('Error fetching image metadata:', metadataError);
          // Continue anyway, we'll just use the storage data
        }

        console.log('Metadata data:', metadataData);

        // Create a map of filename to metadata
        const metadataMap = {};
        if (metadataData) {
          metadataData.forEach(item => {
            metadataMap[item.filename] = item;
          });
        }

        // Get URLs and combine with metadata
        let images = await Promise.all(
          storageData.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('gallary_images')
              .getPublicUrl(file.name);

            // Get metadata for this image if it exists
            const metadata = metadataMap[file.name] || {};
            
            return {
              name: file.name,
              url: publicUrl,
              created_at: file.created_at || new Date().toISOString(),
              caption: metadata.caption || '',
              group_id: metadata.group_id || null,
              group: metadata.group || null
            };
          })
        );

        // Filter by group if needed
        if (groupId) {
          images = images.filter(img => img.group_id === groupId);
        }

        // Sort by creation date, newest first
        images.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        console.log('Processed images:', images);
        return { data: images, error: null };
      } catch (error) {
        console.error('Error in listImages:', error);
        return { data: [], error };
      }
    },

    // Upload an image to the gallery
    uploadImage: async (file, caption = '', groupId = null) => {
      try {
        console.log('Starting image upload process...');
        console.log('File:', file.name, 'Caption:', caption, 'GroupId:', groupId);
        
        // Ensure the bucket exists
        console.log('Ensuring storage bucket exists...');
        await ensureStorageBucketExists();
        console.log('Storage bucket check completed');

        // Upload the file to storage
        console.log('Uploading file to storage bucket...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallary_images')
          .upload(file.name, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading image to storage:', uploadError);
          throw uploadError;
        }

        console.log('Image uploaded successfully to storage:', uploadData);

        // Save metadata to the database
        console.log('Saving metadata to database...');
        console.log('Metadata to save:', {
          filename: file.name,
          caption: caption || '',
          group_id: groupId || null,
          created_at: new Date().toISOString()
        });
        
        const { data: metadataData, error: metadataError } = await supabase
          .from('image_metadata')
          .upsert({
            filename: file.name,
            caption: caption || '',
            group_id: groupId || null,
            created_at: new Date().toISOString()
          }, { onConflict: 'filename' });

        if (metadataError) {
          console.error('Error saving image metadata:', metadataError);
          console.error('Error details:', JSON.stringify(metadataError));
          // Don't throw here, we still uploaded the image successfully
        } else {
          console.log('Image metadata saved successfully:', metadataData);
        }

        // Get the public URL
        console.log('Generating public URL...');
        const { data: { publicUrl } } = supabase.storage
          .from('gallary_images')
          .getPublicUrl(file.name);
        console.log('Public URL generated:', publicUrl);

        return {
          url: publicUrl,
          name: file.name,
          caption,
          group_id: groupId
        };
      } catch (error) {
        console.error('Error in uploadImage:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
    },
    
    // Update image metadata (caption, group)
    updateImageMetadata: async (filename, caption = null, groupId = null) => {
      try {
        // Check if metadata exists for this image
        const { data: existingData, error: checkError } = await supabase
          .from('image_metadata')
          .select('*')
          .eq('filename', filename)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking existing metadata:', checkError);
          return { error: checkError };
        }
        
        // Prepare update data
        const updateData = {};
        if (caption !== null) updateData.caption = caption;
        if (groupId !== null) updateData.group_id = groupId;
        
        let result;
        
        if (existingData) {
          // Update existing record
          result = await supabase
            .from('image_metadata')
            .update(updateData)
            .eq('filename', filename)
            .select();
        } else {
          // Insert new record
          result = await supabase
            .from('image_metadata')
            .insert([{
              filename,
              ...updateData
            }])
            .select();
        }
        
        if (result.error) {
          console.error('Error updating image metadata:', result.error);
          return { error: result.error };
        }
        
        return { data: result.data?.[0] || null, error: null };
      } catch (error) {
        console.error('Exception updating image metadata:', error);
        return { error };
      }
    },

    async deleteImage(filename) {
      try {
        if (!filename) {
          throw new Error('No filename provided');
        }

        console.log('Deleting image:', filename);

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('gallary_images')
          .remove([filename]);

        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
          throw storageError;
        }

        // Delete metadata
        const { error: metadataError } = await supabase
          .from('image_metadata')
          .delete()
          .eq('filename', filename);

        if (metadataError) {
          console.error('Error deleting image metadata:', metadataError);
          // Don't throw, we already deleted the image from storage
        }

        return { success: true };
      } catch (error) {
        console.error('Error in deleteImage:', error);
        throw error;
      }
    }
  }
};

// Add this function to ensure the storage bucket exists
export async function ensureStorageBucketExists() {
  const bucketName = 'gallary_images';
  
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError };
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`);
      
      // Create the bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return { success: false, error: createError };
      }
      
      console.log(`Storage bucket ${bucketName} created successfully`);
      
      // Create policies for the bucket
      await createBucketPolicies(bucketName);
      
      return { success: true, data };
    } else {
      console.log(`Storage bucket ${bucketName} already exists`);
      return { success: true };
    }
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    return { success: false, error };
  }
}

// Helper function to create policies for a bucket
async function createBucketPolicies(bucketName) {
  try {
    // Create policy for public read access
    await supabase.storage.from(bucketName).createPolicy('Public Read Access', {
      name: 'Public Read Access',
      definition: {
        statements: [
          {
            effect: 'allow',
            action: 'select',
            principal: '*'
          }
        ]
      }
    });
    
    // Create policy for authenticated users to upload
    await supabase.storage.from(bucketName).createPolicy('Authenticated Upload', {
      name: 'Authenticated Upload',
      definition: {
        statements: [
          {
            effect: 'allow',
            action: 'insert',
            principal: 'authenticated'
          }
        ]
      }
    });
    
    // Create policy for authenticated users to delete
    await supabase.storage.from(bucketName).createPolicy('Authenticated Delete', {
      name: 'Authenticated Delete',
      definition: {
        statements: [
          {
            effect: 'allow',
            action: 'delete',
            principal: 'authenticated'
          }
        ]
      }
    });
    
    console.log(`Policies created for bucket ${bucketName}`);
  } catch (error) {
    console.error('Error creating bucket policies:', error);
  }
}

export const testRLSPolicies = async () => {
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
};
