const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Attendance operations
router.post('/checkin', attendanceController.recordCheckIn);
router.post('/checkout', attendanceController.recordCheckOut);
router.get('/employee/:employeeId', attendanceController.getEmployeeAttendance);
router.get('/date/:date', attendanceController.getAttendanceByDate);

module.exports = router;
