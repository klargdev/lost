# Storage Bucket Policy Setup Instructions

Follow these steps to manually set up the storage bucket and policies in your Supabase dashboard:

## Step 1: Create the Storage Bucket

1. Go to your Supabase dashboard
2. Click on "Storage" in the left sidebar
3. Click on "New Bucket"
4. Enter "gallary_images" as the bucket name
5. Check the "Public bucket" option
6. Click "Create bucket"

## Step 2: Set Up Storage Policies

After creating the bucket, click on the "gallary_images" bucket and go to the "Policies" tab.

### Policy 1: Public Read Access

1. Click "Add Policy"
2. Select "GET" (read) operations
3. For "Policy definition", select "Custom"
4. Enter the following in the policy definition:
   ```sql
   true
   ```
5. Name the policy "Allow public read access for gallary_images"
6. Click "Save"

### Policy 2: Authenticated Upload Access

1. Click "Add Policy"
2. Select "POST" (create) operations
3. For "Policy definition", select "Custom"
4. Enter the following in the policy definition:
   ```sql
   true
   ```
5. Name the policy "Allow authenticated users to upload to gallary_images"
6. Click "Save"

### Policy 3: Anonymous Upload Access (for development)

1. Click "Add Policy"
2. Select "POST" (create) operations
3. For "Policy definition", select "Custom"
4. Enter the following in the policy definition:
   ```sql
   true
   ```
5. For "Allowed roles", select "anon" (anonymous)
6. Name the policy "Allow anonymous users to upload to gallary_images"
7. Click "Save"

### Policy 4: Update Access

1. Click "Add Policy"
2. Select "PUT" (update) operations
3. For "Policy definition", select "Custom"
4. Enter the following in the policy definition:
   ```sql
   true
   ```
5. Name the policy "Allow users to update objects in gallary_images"
6. Click "Save"

### Policy 5: Delete Access

1. Click "Add Policy"
2. Select "DELETE" operations
3. For "Policy definition", select "Custom"
4. Enter the following in the policy definition:
   ```sql
   true
   ```
5. Name the policy "Allow users to delete objects in gallary_images"
6. Click "Save"

## Step 3: Test the Upload

After setting up all the policies, go back to your application and try uploading an image again. The RLS policy error should be resolved.

## Troubleshooting

If you still encounter issues:

1. Make sure all policies are correctly set up
2. Check the browser console for detailed error messages
3. Try restarting your application
4. Verify that your Supabase client is correctly configured with the right URL and API key 