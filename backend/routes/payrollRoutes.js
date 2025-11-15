const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// Payroll operations
router.post('/generate', payrollController.generatePayroll);
router.get('/batch/:batchId', payrollController.getPayrollBatch);
router.get('/employee/:employeeId', payrollController.getEmployeePayslips);

module.exports = router;
