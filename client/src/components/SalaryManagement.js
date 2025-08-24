
import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Button, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, createExpense } from '../services/api';
import { useSeason } from '../context/SeasonContext';
import { useForm, Controller } from 'react-hook-form';

const SalaryManagement = () => {
  const { selectedSeason } = useSeason();
  const [openEmployeeForm, setOpenEmployeeForm] = useState(false);
  const [openSalaryForm, setOpenSalaryForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data: employees, loading, refetch } = useApiData(getEmployees, []);
  const { mutate: createEmployeeMutation } = useApiMutation(createEmployee);
  const { mutate: updateEmployeeMutation } = useApiMutation(updateEmployee);
  const { mutate: deleteEmployeeMutation } = useApiMutation(deleteEmployee);
  const { mutate: createExpenseMutation } = useApiMutation(createExpense);

  const { control: employeeControl, handleSubmit: handleEmployeeSubmit, reset: resetEmployeeForm } = useForm();
  const { control: salaryControl, handleSubmit: handleSalarySubmit, reset: resetSalaryForm } = useForm();

  const handleSaveEmployee = async (data) => {
    try {
      if (editingEmployee) {
        await updateEmployeeMutation(editingEmployee._id, data);
      } else {
        await createEmployeeMutation(data);
      }
      refetch();
      setOpenEmployeeForm(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Failed to save employee', error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployeeMutation(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete employee', error);
      }
    }
  };

  const handleLogSalary = (employee) => {
    setSelectedEmployee(employee);
    resetSalaryForm({
      date: new Date().toISOString().split('T')[0],
      mainCategory: 'Salary',
      subCategory: 'Salary',
      employee: employee._id,
      season: selectedSeason?._id,
      description: `Salary for ${employee.name}`
    });
    setOpenSalaryForm(true);
  };

  const handleSaveSalary = async (data) => {
    try {
      await createExpenseMutation(data);
      setOpenSalaryForm(false);
    } catch (error) {
      console.error('Failed to log salary', error);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Salary Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingEmployee(null); resetEmployeeForm(); setOpenEmployeeForm(true); }}>
          Add Employee
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees?.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleLogSalary(employee)}>Log Salary</Button>
                  <IconButton onClick={() => { setEditingEmployee(employee); resetEmployeeForm(employee); setOpenEmployeeForm(true);}}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteEmployee(employee._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Employee Form Dialog */}
      <Dialog open={openEmployeeForm} onClose={() => setOpenEmployeeForm(false)}>
        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <form onSubmit={handleEmployeeSubmit(handleSaveEmployee)}>
          <DialogContent>
            <Controller name="name" control={employeeControl} render={({ field }) => <TextField {...field} label="Name" fullWidth margin="dense" />} />
            <Controller name="role" control={employeeControl} render={({ field }) => <TextField {...field} label="Role" fullWidth margin="dense" />} />
            <Controller name="status" control={employeeControl} defaultValue="Active" render={({ field }) => <TextField {...field} select label="Status" fullWidth margin="dense"><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField>} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEmployeeForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Salary Form Dialog */}
      <Dialog open={openSalaryForm} onClose={() => setOpenSalaryForm(false)}>
        <DialogTitle>Log Salary for {selectedEmployee?.name}</DialogTitle>
        <form onSubmit={handleSalarySubmit(handleSaveSalary)}>
          <DialogContent>
            <Controller name="date" control={salaryControl} render={({ field }) => <TextField {...field} type="date" label="Date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} />} />
            <Controller name="amount" control={salaryControl} render={({ field }) => <TextField {...field} type="number" label="Amount" fullWidth margin="dense" />} />
            <Controller name="description" control={salaryControl} render={({ field }) => <TextField {...field} label="Description" fullWidth margin="dense" />} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSalaryForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Salary</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default SalaryManagement;
