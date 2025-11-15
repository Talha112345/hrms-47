const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Leave request operations
router.post('/requests', leaveController.submitLeaveRequest);
router.get('/requests', leaveController.getAllLeaveRequests);
router.get('/requests/:requestId', leaveController.getLeaveRequestById);
router.put('/requests/:requestId/status', leaveController.updateLeaveStatus);
router.delete('/requests/:requestId', leaveController.cancelLeaveRequest);

module.exports = router;
