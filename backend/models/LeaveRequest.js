const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: ['ANNUAL', 'SICK', 'EMERGENCY', 'CASUAL', 'MATERNITY', 'PATERNITY']
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approver: {
    managerId: String,
    name: String
  },
  approverId: String,
  approvalDate: Date,
  comments: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate request ID before saving
leaveRequestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const timestamp = Date.now();
    this.requestId = `LR-${timestamp}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
