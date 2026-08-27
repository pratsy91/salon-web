import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";

function homeForRole(role) {
  return role === "SUPER_ADMIN" ? "/plans" : "/";
}

export default function ProtectedRoute({ allow, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Wrong role must not bounce Super Admin to "/" (dashboard) — that route
  // rejects them and used to cause a blank redirect loop.
  if (allow && !allow.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return children;
}
