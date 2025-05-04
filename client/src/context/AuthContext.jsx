import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../config/supabase';
import API_ENDPOINTS from '../config/api';

// Create context
const AuthContext = createContext();

// Create a hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Register a new user
  const register = async (email, password, name) => {
    try {
      setError(null);
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
        email,
        password,
        name,
      });
      return { data: response.data, error: null };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { data: null, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { user, session } = response.data;

      // Set auth state
      setCurrentUser(user);
      setSession(session);

      // Store token in localStorage for persistence
      localStorage.setItem('supabaseToken', session.access_token);

      // Set authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;

      return { data: response.data, error: null };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { data: null, error: err.response?.data?.message || 'Login failed' };
    }
  };

  // Logout a user
  const logout = async () => {
    try {
      setError(null);
      await axios.post(API_ENDPOINTS.AUTH.LOGOUT);

      // Clear auth state
      setCurrentUser(null);
      setSession(null);

      // Remove token from localStorage
      localStorage.removeItem('supabaseToken');

      // Remove authorization header
      delete axios.defaults.headers.common['Authorization'];

      return { error: null };
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed');
      return { error: err.response?.data?.message || 'Logout failed' };
    }
  };

  // Reset password
  const resetPassword = async email => {
    try {
      setError(null);
      const response = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
      });
      return { data: response.data, error: null };
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      return { data: null, error: err.response?.data?.message || 'Password reset failed' };
    }
  };

  // Check if user is logged in on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        // Check for token in localStorage
        const token = localStorage.getItem('supabaseToken');

        if (token) {
          // Set the authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Verify token with backend
          const response = await axios.post(API_ENDPOINTS.AUTH.VERIFY_TOKEN, {
            token,
          });
          setCurrentUser(response.data);

          // Recreate session object
          setSession({
            access_token: token,
          });
        }
      } catch (err) {
        console.error('Error loading user:', err);
        // If the token is invalid, clear it
        localStorage.removeItem('supabaseToken');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Context value
  const value = {
    currentUser,
    session,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    setError,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
