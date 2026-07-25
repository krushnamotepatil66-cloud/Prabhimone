import { Navigate } from "react-router-dom";
import { getAccessToken } from "../api/client";

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * If no access_token is found in localStorage, redirects to /login.
 */
function ProtectedRoute({ children }) {
  const token = getAccessToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
