const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');

// Recruitment operations
router.post('/applications', recruitmentController.submitApplication);
router.get('/applications', recruitmentController.getAllApplications);
router.post('/interviews', recruitmentController.scheduleInterview);
router.get('/interviews/:interviewId', recruitmentController.getInterviewById);

module.exports = router;
