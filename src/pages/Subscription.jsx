import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Chip, Divider, Grid, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import api from '../api/client';
import { ApiError, EmptyState, Loading } from '../components/StateViews';

function Detail({ label, value }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value}</Typography>
    </Box>
  );
}

export default function Subscription() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/me/subscription').then(({ data: body }) => setData(body)).catch(setError);
  }, []);

  if (error) return <ApiError error={error} />;
  if (!data) return <Loading />;

  const { salon, isActive, daysRemaining, history } = data;
  const plan = salon.currentPlan;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Subscription</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Typography variant="h6">{plan ? plan.name : 'No plan'}</Typography>
                <Chip size="small" color={isActive ? 'success' : 'error'} label={salon.subscriptionStatus} />
              </Stack>

              {plan && (
                <>
                  <Detail label="Price" value={`₹${plan.price}`} />
                  <Detail label="Duration" value={`${plan.durationInDays} days`} />
                  <Detail label="Staff limit" value={plan.maxStaff} />
                  <Detail label="Appointment limit" value={plan.maxAppointments} />
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Detail
                label="Started"
                value={salon.subscriptionStartDate ? new Date(salon.subscriptionStartDate).toLocaleDateString() : '—'}
              />
              <Detail
                label={isActive ? 'Renews on' : 'Expired on'}
                value={salon.subscriptionEndDate ? new Date(salon.subscriptionEndDate).toLocaleDateString() : '—'}
              />
              {isActive && daysRemaining !== null && <Detail label="Days remaining" value={daysRemaining} />}

              {!isActive && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  Your subscription has expired. Please contact the administrator to renew your plan.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Typography variant="h6" sx={{ mb: 1 }}>History</Typography>
          {history.length === 0 ? (
            <EmptyState title="No subscription history yet" />
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell><Chip size="small" variant="outlined" label={row.action} /></TableCell>
                      <TableCell>{row.planId?.name}</TableCell>
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
        </Grid>
      </Grid>
    </Box>
  );
}
