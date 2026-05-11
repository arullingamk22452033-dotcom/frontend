import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  if (role?.toLowerCase() !== "admin") {
    return <Navigate to="/staff/dashboard" />;
  }

  return children;
};

export default AdminRoute;