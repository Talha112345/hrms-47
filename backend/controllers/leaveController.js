const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const { validateLeaveRequest } = require('../validators/leaveValidator');

// Submit leave request
exports.submitLeaveRequest = async (req, res) => {
  try {
    // Validate input
    const validation = validateLeaveRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    // Get manager details
    let approver = { managerId: null, name: null };
    if (employee.managerId) {
      const manager = await Employee.findOne({ employeeId: employee.managerId });
      if (manager) {
        approver = {
          managerId: manager.employeeId,
          name: `${manager.firstName} ${manager.lastName}`
        };
      }
    }

    const leaveRequest = new LeaveRequest({
      ...req.body,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      approver
    });

    await leaveRequest.save();

    res.status(201).json({
      status: 'success',
      message: 'Leave request submitted successfully',
      data: {
        requestId: leaveRequest.requestId,
        employeeId: leaveRequest.employeeId,
        employeeName: leaveRequest.employeeName,
        leaveType: leaveRequest.leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        numberOfDays: leaveRequest.numberOfDays,
        status: leaveRequest.status,
        requestDate: leaveRequest.requestDate,
        approver: leaveRequest.approver
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all leave requests
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status, employeeId, leaveType } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (employeeId) query.employeeId = employeeId;
    if (leaveType) query.leaveType = leaveType;

    const requests = await LeaveRequest.find(query)
      .select('-__v')
      .sort({ requestDate: -1 });

    res.json({
      status: 'success',
      data: {
        requests,
        total: requests.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get leave request by ID
exports.getLeaveRequestById = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({ requestId: req.params.requestId });
    
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave request not found'
      });
    }

    res.json({
      status: 'success',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update leave status (approve/reject)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { approverId, action, comments } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action. Must be APPROVED or REJECTED'
      });
    }

    const request = await LeaveRequest.findOne({ requestId: req.params.requestId });
    
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        status: 'error',
        message: 'Leave request has already been processed'
      });
    }

    // Get approver details
    const approver = await Employee.findOne({ employeeId: approverId });
    if (!approver) {
      return res.status(404).json({
        status: 'error',
        message: 'Approver not found'
      });
    }

    request.status = action;
    request.approverId = approverId;
    request.approvalDate = new Date();
    request.comments = comments || `${action.toLowerCase()} for the specified dates`;
    request.updatedAt = new Date();

    await request.save();

    res.json({
      status: 'success',
      message: `Leave request ${action.toLowerCase()} successfully`,
      data: {
        requestId: request.requestId,
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        leaveType: request.leaveType,
        startDate: request.startDate,
        endDate: request.endDate,
        status: request.status,
        approvedBy: `${approver.firstName} ${approver.lastName}`,
        approvalDate: request.approvalDate,
        comments: request.comments
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Cancel leave request
exports.cancelLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({ requestId: req.params.requestId });
    
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel processed leave request'
      });
    }

    request.status = 'CANCELLED';
    request.updatedAt = new Date();
    await request.save();

    res.json({
      status: 'success',
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
