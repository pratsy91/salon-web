import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api, { errorMessage } from "../api/client";
import { ApiError, EmptyState, Loading } from "../components/StateViews";
import ResponsiveDialog from "../components/ResponsiveDialog";

const STATUS_COLOURS = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "default",
  COMPLETED: "info",
};

const today = () => new Date().toISOString().slice(0, 10);

function addMinutes(startTime, minutes) {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function CreateAppointmentDialog({ open, onClose, onCreated, refs }) {
  const blank = {
    clientId: "",
    serviceId: "",
    staffId: "",
    date: today(),
    startTime: "10:00",
  };
  const [form, setForm] = useState(blank);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const service = refs.services.find((s) => s._id === form.serviceId);

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/appointments", form);
      setForm(blank);
      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Could not create the appointment."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>New appointment</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Client"
              value={form.clientId}
              onChange={update("clientId")}
              required
              fullWidth
            >
              {refs.clients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Service"
              value={form.serviceId}
              onChange={update("serviceId")}
              required
              fullWidth
            >
              {refs.services.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.name} ({item.durationMinutes} min)
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Staff"
              value={form.staffId}
              onChange={update("staffId")}
              required
              fullWidth
            >
              {refs.staff.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={update("date")}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Start time"
                type="time"
                value={form.startTime}
                onChange={update("startTime")}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                fullWidth
                required
              />
              <TextField
                label="End time"
                type="time"
                value={
                  service
                    ? addMinutes(form.startTime, service.durationMinutes)
                    : ""
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled
                helperText={
                  service
                    ? `Fixed by ${service.name} (${service.durationMinutes} min)`
                    : "Select a service first"
                }
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Booking…" : "Book appointment"}
          </Button>
        </DialogActions>
      </Box>
    </ResponsiveDialog>
  );
}

export default function Appointments() {
  const [date, setDate] = useState(today());
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refs, setRefs] = useState({ clients: [], services: [], staff: [] });
  const [updating, setUpdating] = useState(null); // { id, status }

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get("/appointments", { params: { date } });
      setAppointments(data.appointments);
    } catch (err) {
      setError(err);
      setAppointments([]);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    Promise.all([api.get("/clients"), api.get("/services"), api.get("/staff")])
      .then(([clients, services, staff]) =>
        setRefs({
          clients: clients.data.clients,
          services: services.data.services,
          staff: staff.data.staff,
        }),
      )
      .catch(() => {});
  }, []);

  const canCreate = useMemo(
    () =>
      refs.clients.length > 0 &&
      refs.services.length > 0 &&
      refs.staff.length > 0,
    [refs],
  );

  const changeStatus = async (id, status) => {
    setError(null);
    setUpdating({ id, status });
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setUpdating(null);
    }
  };

  const isUpdating = (id, status) =>
    updating?.id === id && updating?.status === status;

  const rowBusy = (id) => updating?.id === id;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5">Appointments</Typography>
          <Typography variant="body2" color="text.secondary">
            Working hours 09:00–20:00
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            size="small"
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth={true}
            sx={{ minWidth: { sm: 160 } }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={!canCreate}
            fullWidth
            sx={{ width: { sm: 'auto' } }}
          >
            New appointment
          </Button>
        </Stack>
      </Stack>

      <ApiError error={error} />

      {appointments === null ? (
        <Loading />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments for this date"
          hint="Add a client first to create an appointment. Go to Clients, then come back and book."
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {appointment.startTime}–{appointment.endTime}
                  </TableCell>
                  <TableCell>{appointment.clientId?.name}</TableCell>
                  <TableCell>{appointment.serviceId?.name}</TableCell>
                  <TableCell>{appointment.staffId?.name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={STATUS_COLOURS[appointment.status]}
                      label={appointment.status}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={0.5}
                      alignItems="flex-end"
                      justifyContent="flex-end"
                    >
                      {appointment.status === "PENDING" && (
                        <Button
                          size="small"
                          disabled={rowBusy(appointment._id)}
                          onClick={() =>
                            changeStatus(appointment._id, "CONFIRMED")
                          }
                          startIcon={
                            isUpdating(appointment._id, "CONFIRMED") ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : null
                          }
                        >
                          {isUpdating(appointment._id, "CONFIRMED")
                            ? "Confirming…"
                            : "Confirm"}
                        </Button>
                      )}
                      {appointment.status !== "CANCELLED" &&
                        appointment.status !== "COMPLETED" && (
                          <Button
                            size="small"
                            color="error"
                            disabled={rowBusy(appointment._id)}
                            onClick={() =>
                              changeStatus(appointment._id, "CANCELLED")
                            }
                            startIcon={
                              isUpdating(appointment._id, "CANCELLED") ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : null
                            }
                          >
                            {isUpdating(appointment._id, "CANCELLED")
                              ? "Cancelling…"
                              : "Cancel"}
                          </Button>
                        )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateAppointmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={load}
        refs={refs}
      />
    </Box>
  );
}
