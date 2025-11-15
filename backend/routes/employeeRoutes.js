const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Employee CRUD operations
router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);
router.get('/:employeeId', employeeController.getEmployeeById);
router.put('/:employeeId', employeeController.updateEmployee);
router.delete('/:employeeId', employeeController.deleteEmployee);

// Leave balance
router.get('/:employeeId/leave-balance', employeeController.getLeaveBalance);

// Training history
router.get('/:employeeId/training-history', employeeController.getTrainingHistory);

module.exports = router;
