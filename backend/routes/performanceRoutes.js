const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// Performance review operations
router.post('/reviews', performanceController.createPerformanceReview);
router.get('/reviews/:reviewId', performanceController.getReviewById);
router.get('/employee/:employeeId/reviews', performanceController.getEmployeeReviews);

module.exports = router;
