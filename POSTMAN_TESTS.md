# Postman Test Cases for HRMS API

## Setup
- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`

---

## Test Case 1: Employee Registration

### Purpose
Validate employee creation with all required fields and ensure proper validation.

### Endpoint
`POST /api/v1/employees`

### Test Steps

#### Step 1: Create Valid Employee
**Request:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "ahmed.khan@company.com",
  "phone": "+92-300-1234567",
  "address": "123 Main Street, Rawalpindi",
  "emergencyContact": "+92-300-7654321",
  "department": "Engineering",
  "position": "Software Engineer",
  "joinDate": "2025-11-01",
  "managerId": null,
  "salary": 50000
}
```

**Expected Response (Status: 201):**
```json
{
  "status": "success",
  "message": "Employee created successfully",
  "data": {
    "employeeId": "EMP-1729700000001",
    "firstName": "Ahmed",
    "lastName": "Khan",
    "email": "ahmed.khan@company.com",
    "department": "Engineering",
    "position": "Software Engineer",
    "status": "ACTIVE",
    "joinDate": "2025-11-01",
    "createdAt": "2025-10-23T10:30:00Z"
  }
}
```

#### Step 2: Validation - Missing Required Field
**Request:**
```json
{
  "firstName": "John",
  "email": "john@company.com"
}
```

**Expected Response (Status: 400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "Last name is required",
    "Phone number is required",
    "Department is required",
    "Position is required",
    "Join date is required"
  ]
}
```

#### Step 3: Validation - Duplicate Email
**Request:**
```json
{
  "firstName": "Another",
  "lastName": "User",
  "email": "ahmed.khan@company.com",
  "phone": "+92-300-1111111",
  "address": "Some address",
  "emergencyContact": "+92-300-2222222",
  "department": "HR",
  "position": "Manager",
  "joinDate": "2025-11-01"
}
```

**Expected Response (Status: 400):**
```json
{
  "status": "error",
  "message": "Employee with this email already exists"
}
```

### Validation Points
✅ Status code is 201 for successful creation  
✅ Response contains employeeId  
✅ All required fields are returned  
✅ Validation errors are returned for invalid data  
✅ Duplicate email is rejected  

---

## Test Case 2: Leave Request Submission & Approval

### Purpose
Test the complete leave request workflow from submission to approval/rejection.

### Endpoint
`POST /api/v1/leave/requests`

### Test Steps

#### Step 1: Submit Leave Request
**Request:**
```json
{
  "employeeId": "EMP-1729700000001",
  "leaveType": "ANNUAL",
  "startDate": "2025-11-15",
  "endDate": "2025-11-17",
  "numberOfDays": 3,
  "reason": "Family wedding"
}
```

**Expected Response (Status: 201):**
```json
{
  "status": "success",
  "message": "Leave request submitted successfully",
  "data": {
    "requestId": "LR-1729700100001",
    "employeeId": "EMP-1729700000001",
    "employeeName": "Ahmed Khan",
    "leaveType": "ANNUAL",
    "startDate": "2025-11-15",
    "endDate": "2025-11-17",
    "numberOfDays": 3,
    "status": "PENDING",
    "requestDate": "2025-10-23T10:35:00Z",
    "approver": {
      "managerId": null,
      "name": null
    }
  }
}
```

#### Step 2: Approve Leave Request
**Endpoint:** `PUT /api/v1/leave/requests/LR-1729700100001/status`

**Request:**
```json
{
  "approverId": "EMP-001",
  "action": "APPROVED",
  "comments": "Approved for the specified dates"
}
```

**Expected Response (Status: 200):**
```json
{
  "status": "success",
  "message": "Leave request approved successfully",
  "data": {
    "requestId": "LR-1729700100001",
    "employeeId": "EMP-1729700000001",
    "employeeName": "Ahmed Khan",
    "leaveType": "ANNUAL",
    "startDate": "2025-11-15",
    "endDate": "2025-11-17",
    "status": "APPROVED",
    "approvedBy": "Manager Name",
    "approvalDate": "2025-10-23T11:00:00Z",
    "comments": "Approved for the specified dates"
  }
}
```

#### Step 3: Error - Invalid Action
**Request:**
```json
{
  "approverId": "EMP-001",
  "action": "PENDING"
}
```

**Expected Response (Status: 400):**
```json
{
  "status": "error",
  "message": "Invalid action. Must be APPROVED or REJECTED"
}
```

### Validation Points
✅ Leave request is created with PENDING status  
✅ Approval updates status correctly  
✅ Only valid actions (APPROVED/REJECTED) are accepted  
✅ Already processed requests cannot be updated  
✅ Approver ID is validated  

---

## Test Case 3: Attendance Recording

### Purpose
Validate attendance check-in and check-out functionality with working hours calculation.

### Endpoint
`POST /api/v1/attendance/checkin`

### Test Steps

#### Step 1: Record Check-in
**Request:**
```json
{
  "employeeId": "EMP-1729700000001",
  "date": "2025-10-23",
  "checkInTime": "09:00:00",
  "location": "Head Office"
}
```

**Expected Response (Status: 201):**
```json
{
  "status": "success",
  "message": "Check-in recorded successfully",
  "data": {
    "recordId": "ATT-1729700200001",
    "employeeId": "EMP-1729700000001",
    "employeeName": "Ahmed Khan",
    "date": "2025-10-23",
    "checkInTime": "09:00:00",
    "location": "Head Office",
    "status": "PRESENT",
    "timestamp": "2025-10-23T09:00:00Z"
  }
}
```

#### Step 2: Record Check-out
**Endpoint:** `POST /api/v1/attendance/checkout`

**Request:**
```json
{
  "employeeId": "EMP-1729700000001",
  "date": "2025-10-23",
  "checkOutTime": "17:00:00"
}
```

**Expected Response (Status: 200):**
```json
{
  "status": "success",
  "message": "Check-out recorded successfully",
  "data": {
    "recordId": "ATT-1729700200001",
    "employeeId": "EMP-1729700000001",
    "employeeName": "Ahmed Khan",
    "date": "2025-10-23",
    "checkInTime": "09:00:00",
    "checkOutTime": "17:00:00",
    "workingHours": "8.00",
    "status": "PRESENT"
  }
}
```

#### Step 3: Error - Duplicate Check-in
**Request:**
```json
{
  "employeeId": "EMP-1729700000001",
  "date": "2025-10-23",
  "checkInTime": "09:00:00",
  "location": "Head Office"
}
```

**Expected Response (Status: 400):**
```json
{
  "status": "error",
  "message": "Attendance already recorded for this date"
}
```

#### Step 4: Get Employee Attendance
**Endpoint:** `GET /api/v1/attendance/employee/EMP-1729700000001?month=10&year=2025`

**Expected Response (Status: 200):**
```json
{
  "status": "success",
  "data": {
    "employeeId": "EMP-1729700000001",
    "totalRecords": 20,
    "records": [
      {
        "recordId": "ATT-1729700200001",
        "employeeId": "EMP-1729700000001",
        "employeeName": "Ahmed Khan",
        "date": "2025-10-23",
        "checkInTime": "09:00:00",
        "checkOutTime": "17:00:00",
        "workingHours": 8,
        "status": "PRESENT"
      }
    ]
  }
}
```

### Validation Points
✅ Check-in creates new attendance record  
✅ Check-out updates existing record  
✅ Working hours are calculated correctly  
✅ Duplicate check-ins are prevented  
✅ Attendance history can be retrieved by date range  

---

## Additional Test Scenarios

### Payroll Generation
**Endpoint:** `POST /api/v1/payroll/generate`
**Purpose:** Test automated salary calculation with deductions and taxes

### Performance Reviews
**Endpoint:** `POST /api/v1/performance/reviews`
**Purpose:** Validate KPI scoring and review creation

### Training Enrollment
**Endpoint:** `POST /api/v1/training/enrollments`
**Purpose:** Test training program enrollment with capacity validation

### Recruitment Interview Scheduling
**Endpoint:** `POST /api/v1/recruitment/interviews`
**Purpose:** Validate interview scheduling with multiple interviewers

---

## Common Error Scenarios to Test

1. **Invalid Employee ID** (404)
2. **Missing Required Fields** (400)
3. **Invalid Date Formats** (400)
4. **Unauthorized Access** (403)
5. **Server Errors** (500)

---

## Postman Collection Structure

```
HRMS API Tests
├── Employee Management
│   ├── Create Employee (Valid)
│   ├── Create Employee (Invalid)
│   ├── Get All Employees
│   ├── Get Employee by ID
│   └── Update Employee
├── Leave Management
│   ├── Submit Leave Request
│   ├── Approve Leave
│   ├── Reject Leave
│   └── Get Leave Balance
├── Attendance Management
│   ├── Check-in
│   ├── Check-out
│   └── Get Attendance Report
└── Payroll & Others
    ├── Generate Payroll
    ├── Create Performance Review
    ├── Enroll in Training
    └── Schedule Interview
```

---

## Test Execution Log Template

```
Test Run: [Date/Time]
Environment: [Development/Testing]
Base URL: http://localhost:3000/api/v1

Test Case 1: Employee Registration
✅ Valid employee creation - PASS
✅ Missing fields validation - PASS
✅ Duplicate email check - PASS

Test Case 2: Leave Request Workflow
✅ Submit leave request - PASS
✅ Approve leave - PASS
✅ Invalid action - PASS

Test Case 3: Attendance Recording
✅ Check-in - PASS
✅ Check-out - PASS
✅ Duplicate check-in - PASS
✅ Get attendance history - PASS

Total Tests: 11
Passed: 11
Failed: 0
Success Rate: 100%
```
