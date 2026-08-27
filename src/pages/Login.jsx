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

const fieldSx = {
  "& .MuiInputBase-input": { fontSize: 16 },
};

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
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "center",
        overflowX: "hidden",
        overflowY: "auto",
        px: { xs: 1.5, sm: 2 },
        py: { xs: 2, sm: 4 },
        background: "linear-gradient(135deg, #6d4aff 0%, #ff5c8a 100%)",
      }}
    >
      <Card
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 420,
          my: { xs: 0, sm: "auto" },
          borderRadius: { xs: 2, sm: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 }, "&:last-child": { pb: { xs: 2, sm: 4 } } }}>
          <Typography variant="h5" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
            Salon CRM
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: { xs: 2, sm: 3 } }}
          >
            Sign in to your salon workspace
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
                inputProps={{ inputMode: "email" }}
                sx={fieldSx}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                sx={fieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="large"
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
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Testing credentials
          </Typography>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <TextField
              select
              label="Role"
              value={roleId}
              onChange={handleRoleChange}
              fullWidth
              size="small"
              sx={fieldSx}
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
                sx={fieldSx}
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
