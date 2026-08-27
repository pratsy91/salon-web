import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/PersonAdd';
import api, { errorMessage } from '../api/client';
import { ApiError, EmptyState, Loading } from '../components/StateViews';

export default function Clients() {
  const [clients, setClients] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get('/clients', { params: search ? { search } : {} });
      setClients(data.clients);
    } catch (err) {
      setError(err);
      setClients([]);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await api.post('/clients', form);
      setForm({ name: '', phone: '', email: '' });
      setOpen(false);
      load();
    } catch (err) {
      setFormError(errorMessage(err, 'Could not save the client.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Clients</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            label="Search name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add client
          </Button>
        </Stack>
      </Stack>

      <ApiError error={error} />

      {clients === null ? (
        <Loading />
      ) : clients.length === 0 ? (
        <EmptyState title="No clients yet" hint="Add your first client to start booking appointments." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Added</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client._id} hover>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email || '—'}</TableCell>
                  <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleCreate}>
          <DialogTitle>Add client</DialogTitle>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
              <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required fullWidth />
              <TextField label="Email (optional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
