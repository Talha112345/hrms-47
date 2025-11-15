const Employee = require('../models/Employee');

// Mock performance review model (not persisted to keep it simple)
const performanceReviews = [];

// Create performance review
exports.createPerformanceReview = async (req, res) => {
  try {
    const { employeeId, reviewerId, reviewPeriod, reviewType, kpis, managerFeedback, selfAssessment } = req.body;

    if (!employeeId || !reviewerId || !reviewPeriod) {
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

    // Check if reviewer exists
    const reviewer = await Employee.findOne({ employeeId: reviewerId });
    if (!reviewer) {
      return res.status(404).json({
        status: 'error',
        message: 'Reviewer not found'
      });
    }

    // Calculate overall score
    let totalScore = 0;
    let totalWeightage = 0;
    
    if (kpis && kpis.length > 0) {
      kpis.forEach(kpi => {
        const achievement = (kpi.actualValue / kpi.targetValue) * 100;
        totalScore += (achievement * kpi.weightage);
        totalWeightage += kpi.weightage;
      });
    }

    const overallScore = totalWeightage > 0 ? (totalScore / totalWeightage).toFixed(2) : 0;

    const reviewId = `REV-${Date.now()}`;
    const review = {
      reviewId,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      reviewerId,
      reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
      reviewPeriod,
      reviewType: reviewType || 'QUARTERLY',
      kpis: kpis || [],
      managerFeedback,
      selfAssessment,
      overallScore,
      status: 'COMPLETED',
      reviewDate: new Date().toISOString(),
      createdAt: new Date()
    };

    performanceReviews.push(review);

    res.status(201).json({
      status: 'success',
      message: 'Performance review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = performanceReviews.find(r => r.reviewId === reviewId);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance review not found'
      });
    }

    res.json({
      status: 'success',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employee reviews
exports.getEmployeeReviews = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const reviews = performanceReviews.filter(r => r.employeeId === employeeId);

    res.json({
      status: 'success',
      data: {
        employeeId,
        totalReviews: reviews.length,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
