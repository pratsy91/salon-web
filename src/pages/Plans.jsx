import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api, { errorMessage } from '../api/client';
import { ApiError, EmptyState, Loading } from '../components/StateViews';
import ResponsiveDialog from '../components/ResponsiveDialog';

const BLANK = {
  name: '',
  price: '',
  durationInDays: '',
  maxStaff: '',
  maxAppointments: '',
  isActive: true,
};

function toForm(plan) {
  return {
    name: plan.name,
    price: String(plan.price),
    durationInDays: String(plan.durationInDays),
    maxStaff: String(plan.maxStaff),
    maxAppointments: String(plan.maxAppointments),
    isActive: Boolean(plan.isActive),
  };
}

export default function Plans() {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'create' | plan object
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isOpen = Boolean(editing);
  const isEdit = editing && editing !== 'create';

  const load = () => {
    api.get('/plans').then(({ data }) => setPlans(data.plans)).catch((err) => { setError(err); setPlans([]); });
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(BLANK);
    setFormError(null);
    setEditing('create');
  };

  const openEdit = (plan) => {
    setForm(toForm(plan));
    setFormError(null);
    setEditing(plan);
  };

  const closeDialog = () => {
    setEditing(null);
    setFormError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: form.price,
        durationInDays: form.durationInDays,
        maxStaff: form.maxStaff,
        maxAppointments: form.maxAppointments,
      };

      if (isEdit) {
        await api.patch(`/plans/${editing._id}`, { ...payload, isActive: form.isActive });
      } else {
        await api.post('/plans', payload);
      }

      closeDialog();
      load();
    } catch (err) {
      setFormError(errorMessage(err, isEdit ? 'Could not update the plan.' : 'Could not create the plan.'));
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, type = 'number') => (
    <TextField
      label={label}
      type={type}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      required
      fullWidth
    />
  );

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Plans</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          fullWidth
          sx={{ width: { sm: 'auto' } }}
        >
          Create plan
        </Button>
      </Stack>

      <ApiError error={error} />

      {plans === null ? (
        <Loading />
      ) : plans.length === 0 ? (
        <EmptyState title="No plans yet" hint="Create the first subscription plan." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="right">Max staff</TableCell>
                <TableCell align="right">Max appointments</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan._id} hover>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell align="right">₹{plan.price}</TableCell>
                  <TableCell align="right">{plan.durationInDays} days</TableCell>
                  <TableCell align="right">{plan.maxStaff}</TableCell>
                  <TableCell align="right">{plan.maxAppointments}</TableCell>
                  <TableCell>
                    <Chip size="small" color={plan.isActive ? 'success' : 'default'} label={plan.isActive ? 'Active' : 'Inactive'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(plan)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ResponsiveDialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{isEdit ? 'Edit plan' : 'Create plan'}</DialogTitle>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              {field('name', 'Plan name', 'text')}
              {field('price', 'Price (₹)')}
              {field('durationInDays', 'Duration in days')}
              {field('maxStaff', 'Max staff')}
              {field('maxAppointments', 'Max appointments')}
              {isEdit && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                  }
                  label={form.isActive ? 'Active (can be assigned to salons)' : 'Inactive (cannot be assigned)'}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create')}
            </Button>
          </DialogActions>
        </Box>
      </ResponsiveDialog>
    </Box>
  );
}
