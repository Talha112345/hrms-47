const Employee = require('../models/Employee');
const { validateEmployee } = require('../validators/employeeValidator');

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    // Validate input
    const validation = validateEmployee(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const employee = new Employee(req.body);
    await employee.save();

    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: {
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        status: employee.status,
        joinDate: employee.joinDate,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee with this email already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Employee.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        employees,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    // Get manager details if exists
    let managerDetails = null;
    if (employee.managerId) {
      const manager = await Employee.findOne({ employeeId: employee.managerId });
      if (manager) {
        managerDetails = {
          managerId: manager.employeeId,
          name: `${manager.firstName} ${manager.lastName}`,
          email: manager.email
        };
      }
    }

    res.json({
      status: 'success',
      data: {
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        department: employee.department,
        position: employee.position,
        joinDate: employee.joinDate,
        status: employee.status,
        managerId: employee.managerId,
        managerName: managerDetails?.name || null,
        managerEmail: managerDetails?.email || null,
        skills: employee.skills || []
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ employeeId: req.params.employeeId });

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get leave balance
exports.getLeaveBalance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    // Mock leave balance data - in real implementation, this would be calculated from leave records
    const leaveBalances = [
      {
        leaveType: 'ANNUAL',
        totalAllowed: 20,
        used: 5,
        remaining: 15
      },
      {
        leaveType: 'SICK',
        totalAllowed: 10,
        used: 2,
        remaining: 8
      },
      {
        leaveType: 'EMERGENCY',
        totalAllowed: 5,
        used: 0,
        remaining: 5
      }
    ];

    res.json({
      status: 'success',
      data: {
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        year: new Date().getFullYear(),
        leaveBalances,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get training history
exports.getTrainingHistory = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    // Mock training history - in real implementation, this would be fetched from training records
    const trainingHistory = [
      {
        programId: 'TRN-1001',
        title: 'Advanced Microservices Architecture',
        category: 'Technical',
        startDate: '2025-11-01',
        endDate: '2025-11-15',
        status: 'COMPLETED',
        certificateIssued: true,
        certificateId: 'CERT-001-2025'
      }
    ];

    res.json({
      status: 'success',
      data: {
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        totalTrainings: trainingHistory.length,
        completedTrainings: trainingHistory.filter(t => t.status === 'COMPLETED').length,
        trainings: trainingHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
