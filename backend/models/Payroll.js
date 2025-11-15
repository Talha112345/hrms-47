const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  payrollRecords: [{
    employeeId: {
      type: String,
      required: true
    },
    employeeName: {
      type: String,
      required: true
    },
    department: String,
    position: String,
    baseSalary: {
      type: Number,
      required: true
    },
    allowances: {
      type: Number,
      default: 0
    },
    deductions: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    netSalary: {
      type: Number,
      required: true
    },
    workingDays: {
      type: Number,
      default: 22
    },
    presentDays: {
      type: Number,
      default: 22
    },
    leaveDays: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'PAID', 'FAILED'],
      default: 'PENDING'
    },
    paymentDate: Date
  }],
  totalEmployees: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'PROCESSED', 'COMPLETED'],
    default: 'DRAFT'
  },
  processedBy: String,
  processedDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payroll', payrollSchema);
