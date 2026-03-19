
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// GET all employees
router.get('/', employeeController.getAllEmployees);

// POST a new employee
router.post('/', employeeController.createEmployee);

// GET a single employee
router.get('/:id', employeeController.getEmployeeById);

// PATCH to update an employee
router.patch('/:id', employeeController.updateEmployee);

// DELETE an employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
