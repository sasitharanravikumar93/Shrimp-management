import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TaskAlt as TaskIcon
} from '@mui/icons-material';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { useSeason } from '../context/SeasonContext';
import { getTasks, createTask, updateTask, deleteTask, getPonds } from '../services/api';

const TaskManagementPage = () => {
  const { selectedSeason } = useSeason();
  const [tasks, setTasks] = useState([]);
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'General',
      frequency: 'Once',
      dueDate: new Date().toISOString().slice(0, 10),
      pondId: '',
      assignedTo: ''
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
      const [tasksRes, pondsRes] = await Promise.all([
        getTasks(selectedSeason.id),
        getPonds(selectedSeason.id)
      ]);
      setTasks(tasksRes);
      setPonds(pondsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async task => {
    try {
      await updateTask(task._id, { completed: !task.completed });
      fetchData();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleOpenAdd = () => {
    reset();
    setEditingId(null);
    setOpenModal(true);
  };

  const handleOpenEdit = task => {
    reset({
      title: task.title,
      description: task.description || '',
      category: task.category,
      frequency: task.frequency,
      dueDate: new Date(task.dueDate).toISOString().slice(0, 10),
      pondId: task.pondId || '',
      assignedTo: task.assignedTo || ''
    });
    setEditingId(task._id);
    setOpenModal(true);
  };

  const onSubmit = async data => {
    try {
      const payload = { ...data, seasonId: selectedSeason.id };
      if (!payload.pondId) delete payload.pondId; // allow null pond
      if (editingId) {
        await updateTask(editingId, payload);
      } else {
        await createTask(payload);
      }
      setOpenModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  if (!selectedSeason)
    return (
      <Container>
        <Typography mt={5}>Select a season first.</Typography>
      </Container>
    );

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant='h4' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TaskIcon fontSize='large' color='primary' /> Task Management
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenAdd}>
          New Task
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Pending Tasks ({pendingTasks.length})
            </Typography>
            <List>
              {pendingTasks.map(task => (
                <ListItem
                  key={task._id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge='start'
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <React.Fragment>
                        <Typography variant='body2' component='span'>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                        {task.pondId && (
                          <Chip
                            size='small'
                            label={`Pond Data Linked`}
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                        <Chip
                          size='small'
                          label={task.category}
                          sx={{ ml: 1, height: 20 }}
                          variant='outlined'
                          color='primary'
                        />
                        {task.frequency !== 'Once' && (
                          <Chip size='small' label={task.frequency} sx={{ ml: 1, height: 20 }} />
                        )}
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge='end' onClick={() => handleOpenEdit(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge='end' onClick={() => handleDelete(task._id)} color='error'>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {pendingTasks.length === 0 && (
                <Typography variant='body2' color='text.secondary'>
                  No pending tasks.
                </Typography>
              )}
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant='h6' gutterBottom>
              Completed
            </Typography>
            <List sx={{ opacity: 0.7 }}>
              {completedTasks.slice(0, 10).map(task => (
                <ListItem key={task._id}>
                  <ListItemIcon>
                    <Checkbox
                      edge='start'
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ textDecoration: 'line-through' }}>{task.title}</Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingId ? 'Edit Task' : 'New Task'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label='Title' fullWidth required />}
              />
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField {...field} label='Description' fullWidth multiline rows={2} />
                )}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name='category'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label='Category' fullWidth>
                      {['Routine', 'Maintenance', 'Health', 'General'].map(o => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name='frequency'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label='Frequency' fullWidth>
                      {['Once', 'Daily', 'Weekly', 'Monthly'].map(o => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>
              <Controller
                name='dueDate'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Due Date'
                    type='date'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                )}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name='pondId'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label='Related Pond (Optional)' fullWidth>
                      <MenuItem value=''>
                        <em>None</em>
                      </MenuItem>
                      {ponds.map(p => (
                        <MenuItem key={p.id || p._id} value={p.id || p._id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name='assignedTo'
                  control={control}
                  render={({ field }) => <TextField {...field} label='Assign To' fullWidth />}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type='submit' variant='contained'>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default TaskManagementPage;
