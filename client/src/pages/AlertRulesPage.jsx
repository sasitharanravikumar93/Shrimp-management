import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, CircularProgress,
  IconButton, Switch
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule } from '../services/api';

const AlertRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      metric: 'dissolvedOxygen',
      condition: '<',
      threshold: 0,
      priority: 'Warning',
      isActive: true
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAlertRules();
      setRules(data);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    reset();
    setEditingId(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (rule) => {
    reset({
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      priority: rule.priority,
      isActive: rule.isActive
    });
    setEditingId(rule._id);
    setOpenModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateAlertRule(editingId, data);
      } else {
        await createAlertRule(data);
      }
      setOpenModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this alert rule?')) {
      try {
        await deleteAlertRule(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      await updateAlertRule(rule._id, { isActive: !rule.isActive });
      fetchData();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="large" color="primary" /> Alert Rules
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          New Rule
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Threshold</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No alert rules configured.</TableCell></TableRow>
              ) : rules.map((rule) => (
                <TableRow key={rule._id}>
                  <TableCell>{rule.metric}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{rule.condition}</TableCell>
                  <TableCell>{rule.threshold}</TableCell>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>
                    <Switch checked={rule.isActive} onChange={() => handleToggleActive(rule)} color="primary" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(rule)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(rule._id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingId ? 'Edit Alert Rule' : 'New Alert Rule'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Controller
                name="metric"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} select label="Metric" fullWidth required>
                    {['pH', 'dissolvedOxygen', 'temperature', 'salinity', 'ammonia'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </TextField>
                )}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Condition" fullWidth>
                      {['<', '>', '<=', '>=', '=='].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>
                  )}
                />
                <Controller
                  name="threshold"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <TextField {...field} label="Threshold Value" type="number" step="0.01" fullWidth required />}
                />
              </Box>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Priority" fullWidth>
                    {['Info', 'Warning', 'Critical'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </TextField>
                )}
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

export default AlertRulesPage;
