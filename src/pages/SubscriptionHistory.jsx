import { useEffect, useState } from 'react';
import {
  Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import api from '../api/client';
import { ApiError, EmptyState, Loading } from '../components/StateViews';

const ACTION_COLOURS = { ASSIGN: 'primary', RENEW: 'success', UPGRADE: 'secondary' };

export default function SubscriptionHistory() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/subscriptions/history')
      .then(({ data }) => setHistory(data.history))
      .catch((err) => { setError(err); setHistory([]); });
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Subscription history</Typography>

      <ApiError error={error} />

      {history === null ? (
        <Loading />
      ) : history.length === 0 ? (
        <EmptyState title="No subscription activity yet" hint="Assigning a plan to a salon records an entry here." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Period</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{row.salonId?.name || '—'}</TableCell>
                  <TableCell>{row.planId?.name || '—'}</TableCell>
                  <TableCell><Chip size="small" color={ACTION_COLOURS[row.action]} label={row.action} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(row.startDate).toLocaleDateString()} → {new Date(row.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">₹{row.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
