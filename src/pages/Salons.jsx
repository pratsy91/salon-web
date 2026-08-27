import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import api, { errorMessage } from '../api/client';
import { ApiError, EmptyState, Loading } from '../components/StateViews';

const ACTIONS = ['ASSIGN', 'RENEW', 'UPGRADE'];

const BLANK_SALON = {
  name: '',
  email: '',
  phone: '',
  address: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
  latitude: '',
  longitude: '',
  allowedRadius: '200',
};

function AssignPlanDialog({ salon, plans, onClose, onDone }) {
  const [planId, setPlanId] = useState(salon?.currentPlan?._id || '');
  const [action, setAction] = useState(salon?.currentPlan ? 'RENEW' : 'ASSIGN');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/salons/${salon.id}/subscription`, { planId, action });
      onDone();
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Could not update the subscription.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(salon)} onClose={onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Subscription · {salon.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Plan" value={planId} onChange={(e) => setPlanId(e.target.value)} required fullWidth>
              {plans.map((plan) => (
                <MenuItem key={plan._id} value={plan._id}>
                  {plan.name} · ₹{plan.price} · {plan.durationInDays} days
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Action" value={action} onChange={(e) => setAction(e.target.value)} fullWidth>
              {ACTIONS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving || !planId}>
            {saving ? 'Applying…' : 'Apply'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function CreateSalonDialog({ open, onClose, onDone }) {
  const [form, setForm] = useState(BLANK_SALON);
  const [error, setError] = useState(null);
  const [locationHint, setLocationHint] = useState(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [createdLogin, setCreatedLogin] = useState(null);

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const useMyLocation = () => {
    setError(null);
    setLocationHint(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser. Enter coordinates manually from Google Maps.');
      return;
    }

    setLocating(true);
    setLocationHint('Requesting location… This can take a few attempts (10–15 clicks), especially indoors. Please wait or retry if it fails.');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        }));
        setLocationHint('Location captured successfully.');
        setError(null);
        setLocating(false);
      },
      (geoError) => {
        const messages = {
          1: 'Location permission was denied. Allow location access and click “Use my location” again, or enter coordinates manually from Google Maps.',
          2: 'Location is unavailable right now. Click “Use my location” again — it often takes a few attempts (10–15 clicks) — or paste coordinates from Google Maps.',
          3: 'Timed out while getting location. Click “Use my location” again (a few attempts / 10–15 clicks are normal), or enter coordinates manually from Google Maps.',
        };
        setError(
          messages[geoError.code]
          || 'Could not get your current location. Retry a few times (10–15 clicks), or set latitude/longitude manually from Google Maps.'
        );
        setLocationHint('Tip: GPS can need a few attempts (10–15 clicks). You can also copy coordinates from Google Maps (steps below).');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.latitude || !form.longitude) {
      setError('Latitude and longitude are required. Use “Use my location” (a few attempts / 10–15 clicks if needed) or enter them manually from Google Maps.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/salons', {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPassword: form.ownerPassword,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        allowedRadius: Number(form.allowedRadius || 200),
      });
      const ownerEmail = form.ownerEmail;
      setForm(BLANK_SALON);
      setLocationHint(null);
      setCreatedLogin({
        ownerEmail,
        stylist: data.defaultStaffLogin || null,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err, 'Could not create the salon.'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(BLANK_SALON);
    setError(null);
    setLocationHint(null);
    setCreatedLogin(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{createdLogin ? 'Salon created' : 'Create salon'}</DialogTitle>
        <DialogContent>
          {createdLogin ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="success">
                Salon created successfully. Use the credentials below to sign in.
              </Alert>

              <Typography variant="subtitle2">Owner login</Typography>
              <Typography variant="body2"><strong>Email:</strong> {createdLogin.ownerEmail}</Typography>
              <Typography variant="body2">
                <strong>Password:</strong> the password you entered when creating this salon
              </Typography>

              {createdLogin.stylist && (
                <>
                  <Typography variant="subtitle2" sx={{ pt: 1 }}>Default stylist login</Typography>
                  <Typography variant="body2"><strong>Name:</strong> {createdLogin.stylist.name}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {createdLogin.stylist.email}</Typography>
                  <Typography variant="body2"><strong>Password:</strong> {createdLogin.stylist.password}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Use the stylist credentials on the mobile app (Receptionist). Assign a plan to this salon before they can check in.
                  </Typography>
                </>
              )}
            </Stack>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {locationHint && (
                <Alert severity={error ? 'warning' : 'info'} sx={{ mb: 2 }}>{locationHint}</Alert>
              )}
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Salon details</Typography>
                <TextField label="Salon name" value={form.name} onChange={update('name')} required fullWidth />
                <TextField label="Email" type="email" value={form.email} onChange={update('email')} fullWidth />
                <TextField label="Phone" value={form.phone} onChange={update('phone')} fullWidth />
                <TextField label="Address" value={form.address} onChange={update('address')} fullWidth />

                <Typography variant="subtitle2" color="text.secondary">Owner login</Typography>
                <TextField label="Owner name" value={form.ownerName} onChange={update('ownerName')} required fullWidth />
                <TextField label="Owner email" type="email" value={form.ownerEmail} onChange={update('ownerEmail')} required fullWidth />
                <TextField
                  label="Owner password"
                  type="password"
                  value={form.ownerPassword}
                  onChange={update('ownerPassword')}
                  required
                  fullWidth
                  helperText="At least 6 characters"
                />

                <Typography variant="subtitle2" color="text.secondary">Geo-fence</Typography>
                <Alert severity="info" variant="outlined">
                  GPS may need a few attempts (10–15 clicks) before latitude and longitude appear.
                  After 10–15 tries, if you still don’t get coordinates, set them manually from Google Maps:
                  open Google Maps → long-press (or right-click) the salon location → copy the two
                  numbers shown (latitude, longitude) → paste them into the fields below.
                </Alert>
                <Button
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  onClick={useMyLocation}
                  disabled={locating}
                >
                  {locating ? 'Getting location…' : 'Use my location'}
                </Button>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Latitude"
                    value={form.latitude}
                    onChange={update('latitude')}
                    required
                    fullWidth
                    placeholder="e.g. 24.885617"
                    helperText="Editable — paste from Google Maps if needed"
                  />
                  <TextField
                    label="Longitude"
                    value={form.longitude}
                    onChange={update('longitude')}
                    required
                    fullWidth
                    placeholder="e.g. 74.618053"
                    helperText="Editable — paste from Google Maps if needed"
                  />
                </Stack>
                <TextField
                  label="Allowed radius (metres)"
                  type="number"
                  value={form.allowedRadius}
                  onChange={update('allowedRadius')}
                  required
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {createdLogin ? (
            <Button variant="contained" onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Creating…' : 'Create salon'}
              </Button>
            </>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function Salons() {
  const [salons, setSalons] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = () => {
    api.get('/salons').then(({ data }) => setSalons(data.salons)).catch((err) => { setError(err); setSalons([]); });
  };

  useEffect(() => {
    load();
    api.get('/plans').then(({ data }) => setPlans(data.plans)).catch(() => {});
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Salons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Create salon
        </Button>
      </Stack>

      <ApiError error={error} />

      {salons === null ? (
        <Loading />
      ) : salons.length === 0 ? (
        <EmptyState title="No salons yet" hint="Create the first salon to get started." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Salon</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Valid till</TableCell>
                <TableCell>Allowed radius</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salons.map((salon) => (
                <TableRow key={salon.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{salon.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{salon.email}</Typography>
                  </TableCell>
                  <TableCell>{salon.currentPlan?.name || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={salon.subscriptionStatus === 'ACTIVE' ? 'success' : 'error'}
                      label={salon.subscriptionStatus}
                    />
                  </TableCell>
                  <TableCell>
                    {salon.subscriptionEndDate ? new Date(salon.subscriptionEndDate).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>{salon.allowedRadius}m</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSelected(salon)}>Manage plan</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateSalonDialog open={createOpen} onClose={() => setCreateOpen(false)} onDone={load} />

      {selected && (
        <AssignPlanDialog salon={selected} plans={plans} onClose={() => setSelected(null)} onDone={load} />
      )}
    </Box>
  );
}
