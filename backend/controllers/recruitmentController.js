const Employee = require('../models/Employee');

// Mock recruitment data (not persisted to keep it simple)
const applications = [];
const interviews = [];

// Submit application
exports.submitApplication = async (req, res) => {
  try {
    const { position, firstName, lastName, email, phone, experience, education, skills } = req.body;

    if (!position || !firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    const applicationId = `APP-${Date.now()}`;
    const application = {
      applicationId,
      position,
      candidateName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone,
      experience: experience || 0,
      education,
      skills: skills || [],
      status: 'SUBMITTED',
      applicationDate: new Date().toISOString(),
      createdAt: new Date()
    };

    applications.push(application);

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const { status, position } = req.query;

    let filteredApplications = applications;

    if (status) {
      filteredApplications = filteredApplications.filter(a => a.status === status);
    }

    if (position) {
      filteredApplications = filteredApplications.filter(a => a.position === position);
    }

    res.json({
      status: 'success',
      data: {
        applications: filteredApplications,
        total: filteredApplications.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId, interviewType, scheduledDate, duration, location, interviewers, meetingLink, instructions } = req.body;

    if (!applicationId || !interviewType || !scheduledDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Find application
    const application = applications.find(a => a.applicationId === applicationId);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Get interviewer details
    const interviewerDetails = [];
    if (interviewers && interviewers.length > 0) {
      for (const interviewerId of interviewers) {
        const employee = await Employee.findOne({ employeeId: interviewerId });
        if (employee) {
          interviewerDetails.push({
            employeeId: employee.employeeId,
            name: `${employee.firstName} ${employee.lastName}`
          });
        }
      }
    }

    const interviewId = `INT-${Date.now()}`;
    const interview = {
      interviewId,
      applicationId,
      candidateName: application.candidateName,
      interviewType,
      scheduledDate,
      duration: duration || 60,
      location,
      meetingLink,
      instructions,
      interviewers: interviewerDetails,
      status: 'SCHEDULED',
      emailSent: true,
      createdAt: new Date()
    };

    interviews.push(interview);

    // Update application status
    application.status = 'INTERVIEW_SCHEDULED';

    res.status(201).json({
      status: 'success',
      message: 'Interview scheduled successfully',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = interviews.find(i => i.interviewId === interviewId);

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    res.json({
      status: 'success',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
