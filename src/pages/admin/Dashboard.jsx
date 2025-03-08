import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  // Get admin info from direct login if needed
  useEffect(() => {
    try {
      // Check if we're using direct login
      const usingDirectLogin = localStorage.getItem('usingDirectLogin');
      if (usingDirectLogin === 'true') {
        const fakeUser = JSON.parse(localStorage.getItem('fakeAdminUser'));
        if (fakeUser && fakeUser.email) {
          setAdminEmail(fakeUser.email);
        }
      } else if (user && user.email) {
        setAdminEmail(user.email);
      } else {
        setAdminEmail('Admin User');
      }
    } catch (e) {
      console.error("Error getting admin info:", e);
      setAdminEmail('Admin User');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      // Clear direct login if it exists
      localStorage.removeItem('fakeAdminUser');
      localStorage.removeItem('usingDirectLogin');
      
      const { success } = await logout();
      if (success) {
        toast.success('Logged out successfully');
        navigate('/admin/login');
      } else {
        toast.error('Failed to log out');
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Error during logout');
      
      // Force redirect to login page
      navigate('/admin/login');
    }
  };

  // Navigation items for the admin dashboard
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Gallery Management', path: '/admin/gallery' },
    { name: 'Guestbook Moderation', path: '/admin/guestbook' },
  ];

  // Check if the current path matches the nav item path
  const isActive = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-funeral-darkest text-white">
      {/* Admin Header */}
      <header className="bg-funeral-dark shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold">Memorial Admin</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(item.path)
                          ? 'bg-funeral-accent text-white'
                          : 'text-gray-300 hover:bg-funeral-medium hover:text-white'
                      } transition-colors`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center">
                <span className="text-sm text-gray-300 mr-4">
                  {adminEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-funeral-medium hover:text-white transition-colors"
                >
                  Logout
                </button>
                <Link
                  to="/"
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-funeral-medium hover:text-white transition-colors"
                >
                  View Site
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-funeral-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-funeral-accent text-white'
                      : 'text-gray-300 hover:bg-funeral-medium hover:text-white'
                  } transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-funeral-medium pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-300">
                  {adminEmail}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-funeral-medium hover:text-white transition-colors"
                >
                  Logout
                </button>
                <Link
                  to="/"
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-funeral-medium hover:text-white transition-colors"
                >
                  View Site
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {location.pathname === '/admin/dashboard' ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-funeral-dark rounded-lg h-96 p-6">
              <h2 className="text-2xl font-bold mb-6">Welcome to the Admin Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-funeral-dark p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Gallery Management</h3>
                  <p className="text-gray-300 mb-4">Upload, manage, and delete images in the memorial gallery.</p>
                  <Link
                    to="/admin/gallery"
                    className="inline-block px-4 py-2 bg-funeral-accent text-white rounded-md hover:bg-funeral-medium transition-colors"
                  >
                    Manage Gallery
                  </Link>
                </div>
                <div className="bg-funeral-dark p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Guestbook Moderation</h3>
                  <p className="text-gray-300 mb-4">Review and moderate guestbook entries and comments.</p>
                  <Link
                    to="/admin/guestbook"
                    className="inline-block px-4 py-2 bg-funeral-accent text-white rounded-md hover:bg-funeral-medium transition-colors"
                  >
                    Moderate Guestbook
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard; 