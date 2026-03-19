
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String },
  hireDate: { type: Date },
  status: { 
    type: String, 
    required: true,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
