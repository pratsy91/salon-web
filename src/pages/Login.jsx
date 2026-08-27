import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";

const DEMO_PASSWORD = "Password@123";

const ROLE_OPTIONS = [
  { id: "super_admin", label: "Super Admin", email: "superadmin@salon.test" },
  { id: "owner", label: "Owner", email: "owner@glow.test" },
  { id: "receptionist", label: "Receptionist", email: null },
  { id: "owner_expired", label: "Owner (expired)", email: "owner@urban.test" },
];

const GLOW_STAFF = [
  { name: "Aisha Khan", email: "reception@glow.test" },
  { name: "Vikram Rao", email: "vikram@glow.test" },
  { name: "Neha Joshi", email: "neha@glow.test" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState("owner");
  const [staffEmail, setStaffEmail] = useState(GLOW_STAFF[0].email);
  const [email, setEmail] = useState("owner@glow.test");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const applyCredentials = (nextEmail) => {
    setEmail(nextEmail);
    setPassword(DEMO_PASSWORD);
  };

  const handleRoleChange = (event) => {
    const nextRole = event.target.value;
    setRoleId(nextRole);
    const option = ROLE_OPTIONS.find((item) => item.id === nextRole);
    if (nextRole === "receptionist") {
      setStaffEmail(GLOW_STAFF[0].email);
      applyCredentials(GLOW_STAFF[0].email);
    } else if (option?.email) {
      applyCredentials(option.email);
    }
  };

  const handleStaffChange = (event) => {
    const nextEmail = event.target.value;
    setStaffEmail(nextEmail);
    applyCredentials(nextEmail);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === "SUPER_ADMIN" ? "/plans" : "/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Unable to sign in."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: "linear-gradient(135deg, #6d4aff 0%, #ff5c8a 100%)",
      }}
    >
      <Card sx={{ width: 420, maxWidth: "100%" }} elevation={8}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5">Salon CRM</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 3 }}
          >
            Sign in to your salon workspace
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoFocus
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={`Demo password: ${DEMO_PASSWORD}`}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Testing credentials
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              label="Role"
              value={roleId}
              onChange={handleRoleChange}
              fullWidth
              size="small"
            >
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {roleId === "receptionist" && (
              <TextField
                select
                label="Glow staff member"
                value={staffEmail}
                onChange={handleStaffChange}
                fullWidth
                size="small"
              >
                {GLOW_STAFF.map((staff) => (
                  <MenuItem key={staff.email} value={staff.email}>
                    {staff.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
