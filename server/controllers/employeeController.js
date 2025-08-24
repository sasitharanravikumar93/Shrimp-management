
const Employee = require('../models/Employee');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
  const employee = new Employee({
    name: req.body.name,
    role: req.body.role,
    hireDate: req.body.hireDate,
    status: req.body.status
  });

  try {
    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single employee
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee == null) {
      return res.status(404).json({ message: 'Cannot find employee' });
    }
    res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee == null) {
      return res.status(404).json({ message: 'Cannot find employee' });
    }

    if (req.body.name != null) {
      employee.name = req.body.name;
    }
    if (req.body.role != null) {
      employee.role = req.body.role;
    }
    if (req.body.hireDate != null) {
      employee.hireDate = req.body.hireDate;
    }
    if (req.body.status != null) {
      employee.status = req.body.status;
    }

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee == null) {
      return res.status(404).json({ message: 'Cannot find employee' });
    }

    await employee.remove();
    res.json({ message: 'Deleted Employee' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
