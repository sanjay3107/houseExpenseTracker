import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute component
 * Only allows access to a route if the user is authenticated
 * Otherwise redirects to the login page
 */
const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  // If still loading auth state, return null or a loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
