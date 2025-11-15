const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'IT', 'Customer Service']
  },
  position: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'],
    default: 'ACTIVE'
  },
  managerId: {
    type: String,
    default: null
  },
  salary: {
    type: Number,
    default: 0
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate employee ID before saving
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const timestamp = Date.now();
    this.employeeId = `EMP-${timestamp}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
