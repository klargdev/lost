import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, supabase } from './supabase';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user session on initial load
    const checkUser = async () => {
      try {
        const { session } = await auth.getSession();
        if (session) {
          const { user: currentUser } = await auth.getUser();
          setUser(currentUser);
          
          // Check if user is admin
          const adminStatus = await auth.isAdmin();
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { user: currentUser } = await auth.getUser();
        setUser(currentUser);
        
        // Check if user is admin
        const adminStatus = await auth.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signIn(email, password);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Make the provider available to the app
  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected route component
export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-funeral-darkest text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funeral-accent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-funeral-darkest text-white">
        <div className="text-center max-w-md p-8 bg-funeral-dark rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-6">You need to be logged in as an administrator to access this page.</p>
          <a href="/admin/login" className="bg-funeral-accent text-white px-6 py-3 rounded-lg hover:bg-funeral-medium transition-all text-lg font-medium shadow-lg border border-funeral-medium">
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  
  return children;
} 