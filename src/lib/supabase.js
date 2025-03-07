import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the Supabase configuration for debugging
console.log("Supabase URL:", supabaseUrl ? "Configured" : "Missing");
console.log("Supabase Anon Key:", supabaseAnonKey ? "Configured" : "Missing");

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
      if (process.env.NODE_ENV === 'development') {
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
      // For development/testing - always return true
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      
      const { user, error } = await auth.getUser();
      if (error || !user) return false;
      
      // Check if user has admin role in metadata
      // You can customize this logic based on your Supabase setup
      return user.app_metadata?.role === 'admin' || 
             user.email?.endsWith('@admin.com'); // Simple check for demo purposes
    } catch (error) {
      console.error("Exception checking admin status:", error);
      return false;
    }
  }
};

// Content management helpers
export const content = {
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
  }
};
