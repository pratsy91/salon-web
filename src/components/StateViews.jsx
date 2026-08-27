import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { errorCode, errorMessage } from "../api/client";

export function Loading({ height = 200 }) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", height }}>
      <CircularProgress size={28} />
    </Box>
  );
}

export function ApiError({ error }) {
  if (!error) return null;
  const code = errorCode(error);

  if (code === "SUBSCRIPTION_EXPIRED") {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>Subscription expired</AlertTitle>
        {errorMessage(error)}
      </Alert>
    );
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {errorMessage(error)}
    </Alert>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 5, textAlign: "center", borderStyle: "dashed" }}
    >
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}
