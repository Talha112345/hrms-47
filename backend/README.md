# HRMS Backend API

## Overview
Complete backend implementation for the Human Resource Management System (HRMS) with RESTful APIs.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Architecture**: MVC Pattern

## Project Structure
```
backend/
├── server.js              # Main server file
├── models/                # Database models
│   ├── Employee.js
│   ├── LeaveRequest.js
│   ├── Attendance.js
│   └── Payroll.js
├── controllers/           # Business logic
│   ├── employeeController.js
│   ├── leaveController.js
│   ├── attendanceController.js
│   ├── payrollController.js
│   ├── performanceController.js
│   ├── trainingController.js
│   └── recruitmentController.js
├── routes/               # API routes
│   ├── employeeRoutes.js
│   ├── leaveRoutes.js
│   ├── attendanceRoutes.js
│   ├── payrollRoutes.js
│   ├── performanceRoutes.js
│   ├── trainingRoutes.js
│   └── recruitmentRoutes.js
├── validators/           # Input validation
│   ├── employeeValidator.js
│   └── leaveValidator.js
└── package.json

```

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up MongoDB:
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGODB_URI in server.js if needed
```

3. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Employee Management
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees` - Get all employees
- `GET /api/v1/employees/:employeeId` - Get employee by ID
- `PUT /api/v1/employees/:employeeId` - Update employee
- `DELETE /api/v1/employees/:employeeId` - Delete employee
- `GET /api/v1/employees/:employeeId/leave-balance` - Get leave balance
- `GET /api/v1/employees/:employeeId/training-history` - Get training history

### Leave Management
- `POST /api/v1/leave/requests` - Submit leave request
- `GET /api/v1/leave/requests` - Get all leave requests
- `GET /api/v1/leave/requests/:requestId` - Get leave request by ID
- `PUT /api/v1/leave/requests/:requestId/status` - Approve/reject leave
- `DELETE /api/v1/leave/requests/:requestId` - Cancel leave request

### Attendance Management
- `POST /api/v1/attendance/checkin` - Record check-in
- `POST /api/v1/attendance/checkout` - Record check-out
- `GET /api/v1/attendance/employee/:employeeId` - Get employee attendance
- `GET /api/v1/attendance/date/:date` - Get attendance by date

### Payroll Management
- `POST /api/v1/payroll/generate` - Generate payroll
- `GET /api/v1/payroll/batch/:batchId` - Get payroll batch
- `GET /api/v1/payroll/employee/:employeeId` - Get employee payslips

### Performance Management
- `POST /api/v1/performance/reviews` - Create performance review
- `GET /api/v1/performance/reviews/:reviewId` - Get review by ID
- `GET /api/v1/performance/employee/:employeeId/reviews` - Get employee reviews

### Training Management
- `POST /api/v1/training/enrollments` - Enroll in training
- `GET /api/v1/training/enrollments/:enrollmentId` - Get enrollment by ID
- `GET /api/v1/training/programs` - Get all programs

### Recruitment Management
- `POST /api/v1/recruitment/applications` - Submit application
- `GET /api/v1/recruitment/applications` - Get all applications
- `POST /api/v1/recruitment/interviews` - Schedule interview
- `GET /api/v1/recruitment/interviews/:interviewId` - Get interview by ID

## Database Schema

### Employee Collection
```javascript
{
  employeeId: String (unique),
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  address: String,
  emergencyContact: String,
  department: String,
  position: String,
  joinDate: Date,
  status: String,
  managerId: String,
  salary: Number,
  skills: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### LeaveRequest Collection
```javascript
{
  requestId: String (unique),
  employeeId: String,
  employeeName: String,
  leaveType: String,
  startDate: String,
  endDate: String,
  numberOfDays: Number,
  reason: String,
  status: String,
  approver: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Collection
```javascript
{
  recordId: String (unique),
  employeeId: String,
  employeeName: String,
  date: String,
  checkInTime: String,
  checkOutTime: String,
  location: String,
  status: String,
  workingHours: Number,
  timestamp: Date
}
```

### Payroll Collection
```javascript
{
  batchId: String,
  month: Number,
  year: Number,
  payrollRecords: Array,
  totalEmployees: Number,
  totalAmount: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling
All APIs return consistent error responses:
```javascript
{
  status: "error",
  message: "Error description",
  errors: [] // Optional validation errors
}
```

## Health Check
`GET /health` - Check API and database status

## Running Tests
```bash
npm test
```

## Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
