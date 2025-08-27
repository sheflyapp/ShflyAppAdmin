import React, { createContext, useContext, useState, useEffect } from 'react';
import callAPI from '../services/callAPI';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set up callAPI interceptor for token expiration
  useEffect(() => {
    const interceptor = callAPI.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('adminToken');
          setUser(null);
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      callAPI.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    console.log('🔄 Checking for existing token on page load...');
    const token = localStorage.getItem('adminToken');
    console.log('🔍 Token found in localStorage:', token ? 'YES' : 'NO');
    if (token) {
      console.log('🔑 Token found, checking auth...');
      checkAuthStatus();
    } else {
      console.log('❌ No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  // Set up periodic token refresh (every 5 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshAuth();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status with token...');
      
      const response = await callAPI.get('/api/auth/user');
      console.log('✅ Auth check response:', response.data);
      
      if (response.data && response.data.userType === 'admin') {
        console.log('👑 User is admin, setting authenticated state');
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.log('❌ User is not admin, removing token');
        // User is not admin, remove token and redirect to login
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          headers: error.config?.headers
        }
      });
      
      // Only remove token on 401/403 errors, not on network errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('🚫 Removing token due to 401/403 error');
        localStorage.removeItem('adminToken');
      }
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login with:', { email, password });
      
      const response = await callAPI.post('/api/auth/login', { email, password });
      console.log('✅ Login response received:', response.data);
      
      const { token, user: userData } = response.data;
      
      // Check if user is admin
      if (userData.userType !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      console.log('🔑 Token received:', token);
      console.log('👤 User data received:', userData);
      
      // Store token
      localStorage.setItem('adminToken', token);
      console.log('💾 Token saved to localStorage');
      
      // Set user state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('✅ Login state updated successfully');
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await callAPI.put('/api/users/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await callAPI.put('/api/users/password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      throw error;
    }
  };

  const refreshAuth = async () => {
    try {
      await checkAuthStatus();
    } catch (error) {
      console.error('Failed to refresh auth:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


