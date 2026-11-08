// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  console.log('🛡️ ProtectedRoute check - Token:', token ? 'EXISTS' : 'MISSING');
  console.log('🛡️ Current path:', window.location.pathname);

  if (!token) {
    console.log('🛡️ Redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('🛡️ Allowing access to protected route');
  return children;
};

export default ProtectedRoute;