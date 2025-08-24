
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  mainCategory: { 
    type: String, 
    required: true,
    enum: ['Culture', 'Farm', 'Salary'] 
  },
  subCategory: { type: String, required: true },
  description: { type: String },
  season: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
  pond: { type: Schema.Types.ObjectId, ref: 'Pond' },
  receiptUrl: { type: String },
  employee: { type: Schema.Types.ObjectId, ref: 'Employee' }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
