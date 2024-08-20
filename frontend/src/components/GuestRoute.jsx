import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const GuestRoute = ({ redirectPath = '/', children }) => {
  const { isLoggedIn } = useSelector((state) => state.user); // Assuming you have a `user` slice in your Redux store

  if (isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default GuestRoute;
