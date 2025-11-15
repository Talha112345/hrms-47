const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Generate payroll
exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        status: 'error',
        message: 'Month and year are required'
      });
    }

    // Get all active employees
    const employees = await Employee.find({ status: 'ACTIVE' });

    if (employees.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No active employees found'
      });
    }

    const payrollRecords = [];
    let totalAmount = 0;

    for (const employee of employees) {
      // Calculate attendance
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      const attendanceRecords = await Attendance.find({
        employeeId: employee.employeeId,
        date: { $gte: startDate, $lte: endDate }
      });

      const presentDays = attendanceRecords.length;
      const workingDays = 22; // Standard working days
      const leaveDays = workingDays - presentDays;

      // Calculate salary components
      const baseSalary = employee.salary || 50000;
      const allowances = baseSalary * 0.20; // 20% allowances
      const grossSalary = baseSalary + allowances;
      const tax = grossSalary * 0.10; // 10% tax
      const deductions = leaveDays * (baseSalary / workingDays);
      const netSalary = grossSalary - tax - deductions;

      payrollRecords.push({
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        position: employee.position,
        baseSalary,
        allowances,
        deductions,
        tax,
        netSalary,
        workingDays,
        presentDays,
        leaveDays,
        paymentStatus: 'PENDING'
      });

      totalAmount += netSalary;
    }

    const batchId = `PAYROLL-${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][month - 1]}-${year}`;

    const payroll = new Payroll({
      batchId,
      month,
      year,
      payrollRecords,
      totalEmployees: employees.length,
      totalAmount,
      status: 'APPROVED'
    });

    await payroll.save();

    res.status(201).json({
      status: 'success',
      message: 'Payroll generated successfully',
      data: {
        batchId: payroll.batchId,
        month: payroll.month,
        year: payroll.year,
        totalEmployees: payroll.totalEmployees,
        totalAmount: payroll.totalAmount,
        status: payroll.status,
        generatedDate: payroll.createdAt,
        records: payroll.payrollRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get payroll batch
exports.getPayrollBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const payroll = await Payroll.findOne({ batchId });

    if (!payroll) {
      return res.status(404).json({
        status: 'error',
        message: 'Payroll batch not found'
      });
    }

    res.json({
      status: 'success',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employee payslips
exports.getEmployeePayslips = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const payrolls = await Payroll.find({
      'payrollRecords.employeeId': employeeId
    }).select('batchId month year payrollRecords');

    const payslips = payrolls.map(payroll => {
      const record = payroll.payrollRecords.find(r => r.employeeId === employeeId);
      return {
        batchId: payroll.batchId,
        month: payroll.month,
        year: payroll.year,
        ...record._doc
      };
    });

    res.json({
      status: 'success',
      data: {
        employeeId,
        payslips
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
