import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth'; // Assuming you have an auth hook

/*
const withAuth = (WrappedComponent) => {
  return function WithAuthComponent(props) {
    // const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
      return <div>Loading...</div>; // You can replace this with a proper loading component
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth; */
