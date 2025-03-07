import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, supabase } from './supabase';
import toast from 'react-hot-toast';

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
        console.log("Checking for existing session...");
        const { session } = await auth.getSession();
        console.log("Session check result:", session ? "Session found" : "No session");
        
        if (session) {
          const { user: currentUser } = await auth.getUser();
          console.log("Current user:", currentUser?.email);
          setUser(currentUser);
          
          // For development/testing - consider all logged in users as admins
          setIsAdmin(true);
          console.log("Admin status set to true for testing");
          
          // Uncomment this for production use
          // Check if user is admin
          // const adminStatus = await auth.isAdmin();
          // setIsAdmin(adminStatus);
          // console.log("Admin status:", adminStatus);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        toast.error('Authentication error: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (session) {
        const { user: currentUser } = await auth.getUser();
        console.log("User from auth change:", currentUser?.email);
        setUser(currentUser);
        
        // For development/testing - consider all logged in users as admins
        setIsAdmin(true);
        console.log("Admin status set to true for testing");
        
        // Uncomment this for production use
        // Check if user is admin
        // const adminStatus = await auth.isAdmin();
        // setIsAdmin(adminStatus);
        // console.log("Admin status:", adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
        console.log("User signed out or no session");
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
      console.log("Attempting login for:", email);
      setLoading(true);
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        toast.error(`Login failed: ${error.message}`);
        return { success: false, error };
      }
      
      console.log("Login successful:", data);
      
      // Manually set user and admin status for immediate effect
      if (data && data.user) {
        setUser(data.user);
        setIsAdmin(true);
        console.log("Manually set user and admin status after login");
      }
      
      toast.success('Login successful!');
      
      return { success: true };
    } catch (error) {
      console.error('Error during login process:', error);
      toast.error(`Login error: ${error.message}`);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("Attempting logout");
      setLoading(true);
      const { error } = await auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(`Logout failed: ${error.message}`);
        return { success: false, error };
      }
      
      // Manually clear user and admin status for immediate effect
      setUser(null);
      setIsAdmin(false);
      
      console.log("Logout successful");
      toast.success('Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Error during logout process:', error);
      toast.error(`Logout error: ${error.message}`);
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
  
  console.log("RequireAdmin check - User:", user?.email, "IsAdmin:", isAdmin, "Loading:", loading);
  
  // For development purposes, create a fake user if none exists
  useEffect(() => {
    if (!loading && !user) {
      console.log("No user found in RequireAdmin, creating fake user for development");
      // This is just for development to bypass the authentication check
      const fakeUser = { email: 'dev@example.com', id: 'fake-id' };
      localStorage.setItem('fakeAdminUser', JSON.stringify(fakeUser));
    }
  }, [loading, user]);
  
  // Get fake user from localStorage if in development
  const getFakeUser = () => {
    if (process.env.NODE_ENV === 'development') {
      try {
        return JSON.parse(localStorage.getItem('fakeAdminUser'));
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  const fakeUser = getFakeUser();
  
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
  
  // For development/testing - allow access with fake user
  if (!user && !fakeUser) {
    console.log("Access denied - no user or fake user found");
    return (
      <div className="flex justify-center items-center min-h-screen bg-funeral-darkest text-white">
        <div className="text-center max-w-md p-8 bg-funeral-dark rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-6">You need to be logged in to access this page.</p>
          <a href="/admin/login" className="bg-funeral-accent text-white px-6 py-3 rounded-lg hover:bg-funeral-medium transition-all text-lg font-medium shadow-lg border border-funeral-medium">
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  
  console.log("Access granted to admin area");
  return children;
} 