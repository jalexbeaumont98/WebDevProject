import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.token) {
    // not logged in → send to /login and remember where they tried to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}