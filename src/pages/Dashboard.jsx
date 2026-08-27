import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import EventIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import api from "../api/client";
import { ApiError, Loading } from "../components/StateViews";
import { useAuth } from "../context/AuthContext";

const TINTS = {
  primary: "#efeaff",
  secondary: "#ffeaf1",
  success: "#e6f6ed",
  warning: "#fdf3e0",
};

function StatCard({ icon, label, value, colour }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: TINTS[colour],
              color: `${colour}.main`,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h5">{value}</Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data: body }) => setData(body))
      .catch(setError);
  }, []);

  if (error) return <ApiError error={error} />;
  if (!data) return <Loading />;

  const { subscription, counts, attendance } = data;

  return (
    <Box>
      <Typography variant="h5" sx={{ wordBreak: 'break-word' }}>
        Good to see you, {user.name.split(" ")[0]}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {data.salon.name} · {data.date}
      </Typography>

      {!subscription.isActive && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            '& .MuiAlert-action': {
              marginRight: 0,
              paddingLeft: 0,
              marginTop: { xs: 1, sm: 0 },
              alignSelf: { xs: 'stretch', sm: 'center' },
              '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
            },
          }}
          action={
            user.role === "SALON_OWNER" ? (
              <Button
                component={RouterLink}
                to="/subscription"
                size="small"
                color="inherit"
              >
                View
              </Button>
            ) : null
          }
        >
          <AlertTitle>Subscription expired</AlertTitle>
          Appointments and clients are locked until an administrator renews the
          plan.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventIcon />}
            label="Appointments today"
            value={counts.todayAppointments}
            colour="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<UpcomingIcon />}
            label="Upcoming"
            value={counts.upcomingAppointments}
            colour="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon />}
            label="Clients"
            value={counts.clients}
            colour="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<BadgeIcon />}
            label="Active staff"
            value={counts.staff}
            colour="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 1 }}
              >
                <Chip
                  size="small"
                  color={subscription.isActive ? "success" : "error"}
                  label={subscription.status}
                />
                {subscription.plan && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={subscription.plan.name}
                  />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {subscription.endDate
                  ? `${subscription.isActive ? "Renews" : "Expired"} on ${new Date(subscription.endDate).toLocaleDateString()}`
                  : "No plan assigned yet."}
                {subscription.isActive && subscription.daysRemaining !== null
                  ? ` · ${subscription.daysRemaining} days remaining`
                  : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your attendance today
              </Typography>
              <Chip
                size="small"
                color={attendance.checkedIn ? "success" : "default"}
                label={attendance.checkedIn ? "Checked in" : "Not checked in"}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {attendance.checkedIn
                  ? `Checked in at ${new Date(attendance.checkInAt).toLocaleTimeString()}`
                  : "Check-in is done from the mobile app, inside the salon geo-fence."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
