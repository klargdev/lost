import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Check if user is admin (based on user metadata or email)
  isAdmin: async () => {
    const { user, error } = await auth.getUser();
    if (error || !user) return false;
    
    // Check if user has admin role in metadata
    // You can customize this logic based on your Supabase setup
    return user.app_metadata?.role === 'admin' || 
           user.email?.endsWith('@admin.com'); // Simple check for demo purposes
  }
};

// Content management helpers
export const content = {
  // Delete a guestbook post
  deleteGuestbookPost: async (postId) => {
    const { error } = await supabase
      .from('tributes')
      .delete()
      .eq('id', postId);
    return { error };
  },
  
  // Delete an image from storage
  deleteImage: async (bucket, fileName) => {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([fileName]);
    return { error };
  }
};
