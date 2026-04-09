import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading application...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
