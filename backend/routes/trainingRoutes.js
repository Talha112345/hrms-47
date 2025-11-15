const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');

// Training operations
router.post('/enrollments', trainingController.enrollInTraining);
router.get('/enrollments/:enrollmentId', trainingController.getEnrollmentById);
router.get('/programs', trainingController.getAllPrograms);

module.exports = router;
