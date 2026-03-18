import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, CircularProgress,
  Chip, IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, LocalHospital as HealthIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useSeason } from '../context/SeasonContext';
import { getHealthLogs, createHealthLog, updateHealthLog, deleteHealthLog, getPonds } from '../services/api';

const HealthLogPage = () => {
  const { selectedSeason } = useSeason();
  const [logs, setLogs] = useState([]);
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      pondId: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      severity: 'Low',
      status: 'Open',
      notes: ''
    }
  });

  useEffect(() => {
    if (selectedSeason?.id) {
      fetchData();
    }
  }, [selectedSeason]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, pondsRes] = await Promise.all([
        getHealthLogs(selectedSeason.id),
        getPonds(selectedSeason.id)
      ]);
      setLogs(logsRes);
      setPonds(pondsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    reset();
    setEditingId(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (log) => {
    reset({
      pondId: log.pondId._id || log.pondId,
      symptoms: log.symptoms,
      diagnosis: log.diagnosis || '',
      treatment: log.treatment || '',
      severity: log.severity,
      status: log.status,
      notes: log.notes || ''
    });
    setEditingId(log._id);
    setOpenModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, seasonId: selectedSeason.id };
      if (editingId) {
        await updateHealthLog(editingId, payload);
      } else {
        await createHealthLog(payload);
      }
      setOpenModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving health log:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this health log?')) {
      try {
        await deleteHealthLog(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const severityColor = (sev) => {
    switch (sev) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'success';
    }
  };

  if (!selectedSeason) return <Container><Typography mt={5}>Select a season first.</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HealthIcon fontSize="large" color="primary" /> Health & Disease Log
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Log Incident
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Pond</TableCell>
                <TableCell>Symptoms</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No health logs found.</TableCell></TableRow>
              ) : logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell>{log.pondId?.name || 'Unknown'}</TableCell>
                  <TableCell>{log.symptoms}</TableCell>
                  <TableCell>{log.diagnosis || '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={log.severity} color={severityColor(log.severity)} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={log.status} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(log)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(log._id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingId ? 'Edit Health Log' : 'Log Health Incident'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Controller
                name="pondId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} select label="Pond" fullWidth required>
                    {ponds.map(p => <MenuItem key={p.id || p._id} value={p.id || p._id}>{p.name}</MenuItem>)}
                  </TextField>
                )}
              />
              <Controller
                name="symptoms"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Symptoms" fullWidth required multiline rows={2} />}
              />
              <Controller
                name="diagnosis"
                control={control}
                render={({ field }) => <TextField {...field} label="Diagnosis" fullWidth />}
              />
              <Controller
                name="treatment"
                control={control}
                render={({ field }) => <TextField {...field} label="Treatment" fullWidth />}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Severity" fullWidth>
                      {['Low', 'Medium', 'High', 'Critical'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth>
                      {['Open', 'In Treatment', 'Resolved'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Box>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => <TextField {...field} label="Notes" fullWidth multiline rows={2} />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default HealthLogPage;
