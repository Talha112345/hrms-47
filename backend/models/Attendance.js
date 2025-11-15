const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  recordId: {
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
  date: {
    type: String,
    required: true,
    index: true
  },
  checkInTime: {
    type: String,
    required: true
  },
  checkOutTime: {
    type: String,
    default: null
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'ON_LEAVE'],
    default: 'PRESENT'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate record ID before saving
attendanceSchema.pre('save', async function(next) {
  if (!this.recordId) {
    const timestamp = Date.now();
    this.recordId = `ATT-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
