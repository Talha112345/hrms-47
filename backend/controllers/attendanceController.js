const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Record check-in
exports.recordCheckIn = async (req, res) => {
  try {
    const { employeeId, date, checkInTime, location } = req.body;

    // Validate required fields
    if (!employeeId || !date || !checkInTime || !location) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    // Check if attendance already recorded for this date
    const existingAttendance = await Attendance.findOne({ employeeId, date });
    if (existingAttendance) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance already recorded for this date'
      });
    }

    const attendance = new Attendance({
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date,
      checkInTime,
      location
    });

    await attendance.save();

    res.status(201).json({
      status: 'success',
      message: 'Check-in recorded successfully',
      data: {
        recordId: attendance.recordId,
        employeeId: attendance.employeeId,
        employeeName: attendance.employeeName,
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        location: attendance.location,
        status: attendance.status,
        timestamp: attendance.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Record check-out
exports.recordCheckOut = async (req, res) => {
  try {
    const { employeeId, date, checkOutTime } = req.body;

    if (!employeeId || !date || !checkOutTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    const attendance = await Attendance.findOne({ employeeId, date });
    
    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Check-in record not found for this date'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Check-out already recorded'
      });
    }

    // Calculate working hours
    const checkIn = new Date(`${date}T${attendance.checkInTime}`);
    const checkOut = new Date(`${date}T${checkOutTime}`);
    const workingHours = (checkOut - checkIn) / (1000 * 60 * 60);

    attendance.checkOutTime = checkOutTime;
    attendance.workingHours = workingHours;
    await attendance.save();

    res.json({
      status: 'success',
      message: 'Check-out recorded successfully',
      data: {
        recordId: attendance.recordId,
        employeeId: attendance.employeeId,
        employeeName: attendance.employeeName,
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        workingHours: workingHours.toFixed(2),
        status: attendance.status
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employee attendance
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    const query = { employeeId };
    
    // If month and year provided, filter by them
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 });

    res.json({
      status: 'success',
      data: {
        employeeId,
        totalRecords: records.length,
        records
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const records = await Attendance.find({ date })
      .sort({ checkInTime: 1 });

    res.json({
      status: 'success',
      data: {
        date,
        totalPresent: records.length,
        records
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
