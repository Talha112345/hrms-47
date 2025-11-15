const Employee = require('../models/Employee');

// Mock training data (not persisted to keep it simple)
const trainingEnrollments = [];
const trainingPrograms = [
  {
    programId: 'TRN-1001',
    title: 'Advanced Microservices Architecture',
    category: 'Technical',
    duration: 40,
    deliveryMode: 'Online',
    startDate: '2025-11-01',
    endDate: '2025-11-15',
    instructor: 'Dr. Sarah Johnson',
    capacity: 30,
    enrolled: 12
  },
  {
    programId: 'TRN-1002',
    title: 'Leadership and Management Skills',
    category: 'Soft Skills',
    duration: 24,
    deliveryMode: 'In-Person',
    startDate: '2025-11-05',
    endDate: '2025-11-12',
    instructor: 'Prof. Ahmed Khan',
    capacity: 20,
    enrolled: 8
  }
];

// Enroll in training
exports.enrollInTraining = async (req, res) => {
  try {
    const { employeeId, programId, enrolledBy, priority, reason } = req.body;

    if (!employeeId || !programId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID and Program ID are required'
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

    // Check if program exists
    const program = trainingPrograms.find(p => p.programId === programId);
    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Training program not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = trainingEnrollments.find(
      e => e.employeeId === employeeId && e.program.programId === programId
    );
    
    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee already enrolled in this program'
      });
    }

    const enrollmentId = `ENR-${Date.now()}`;
    const enrollment = {
      enrollmentId,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      program,
      enrolledBy,
      priority: priority || 'MEDIUM',
      reason,
      enrollmentDate: new Date().toISOString(),
      status: 'ENROLLED',
      certificateEligible: true,
      createdAt: new Date()
    };

    trainingEnrollments.push(enrollment);

    res.status(201).json({
      status: 'success',
      message: 'Employee enrolled in training program successfully',
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get enrollment by ID
exports.getEnrollmentById = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = trainingEnrollments.find(e => e.enrollmentId === enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found'
      });
    }

    res.json({
      status: 'success',
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all programs
exports.getAllPrograms = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        programs: trainingPrograms,
        total: trainingPrograms.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
