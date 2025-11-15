# HRMS Database Documentation

## Database Overview
**Database Name**: `hrms_db`  
**Database Type**: MongoDB (NoSQL Document Database)  
**Connection String**: `mongodb://localhost:27017/hrms_db`

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                      HRMS DATABASE SCHEMA                       │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────┐
│      EMPLOYEE          │◄──────────────┐
├────────────────────────┤               │
│ employeeId (PK)        │               │
│ firstName              │               │ managerId (FK)
│ lastName               │               │
│ email (UNIQUE)         │               │
│ phone                  │               │
│ address                │               │
│ emergencyContact       │               │
│ department             │               │
│ position               │               │
│ joinDate               │               │
│ status                 │               │
│ managerId (FK)         │───────────────┘
│ salary                 │
│ skills[]               │
│ createdAt              │
│ updatedAt              │
└────────────┬───────────┘
             │
             │ employeeId
             │
     ┌───────┼────────┬──────────┬──────────┐
     │       │        │          │          │
     ▼       ▼        ▼          ▼          ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ LEAVE   │ │ATTENDANCE│ │ PAYROLL  │ │PERFORMANCE│
│REQUEST  │ │          │ │          │ │  REVIEW   │
└─────────┘ └──────────┘ └──────────┘ └──────────┘

┌──────────────────────┐      ┌────────────────────┐
│   LEAVE_REQUEST      │      │    ATTENDANCE      │
├──────────────────────┤      ├────────────────────┤
│ requestId (PK)       │      │ recordId (PK)      │
│ employeeId (FK)      │      │ employeeId (FK)    │
│ employeeName         │      │ employeeName       │
│ leaveType            │      │ date               │
│ startDate            │      │ checkInTime        │
│ endDate              │      │ checkOutTime       │
│ numberOfDays         │      │ location           │
│ reason               │      │ status             │
│ status               │      │ workingHours       │
│ requestDate          │      │ timestamp          │
│ approver {}          │      │ createdAt          │
│ approverId           │      └────────────────────┘
│ approvalDate         │
│ comments             │      ┌────────────────────┐
│ createdAt            │      │     PAYROLL        │
│ updatedAt            │      ├────────────────────┤
└──────────────────────┘      │ batchId (PK)       │
                              │ month              │
┌──────────────────────┐      │ year               │
│   TRAINING_PROGRAM   │      │ payrollRecords[]   │
├──────────────────────┤      │   - employeeId     │
│ programId (PK)       │      │   - employeeName   │
│ title                │      │   - department     │
│ category             │      │   - baseSalary     │
│ duration             │      │   - allowances     │
│ deliveryMode         │      │   - deductions     │
│ startDate            │      │   - tax            │
│ endDate              │      │   - netSalary      │
│ instructor           │      │   - workingDays    │
│ capacity             │      │   - presentDays    │
│ enrolled             │      │   - leaveDays      │
└──────────────────────┘      │   - paymentStatus  │
                              │ totalEmployees     │
                              │ totalAmount        │
                              │ status             │
                              │ createdAt          │
                              └────────────────────┘
```

---

## Collection Schemas

### 1. Employee Collection

**Collection Name**: `employees`

```javascript
{
  _id: ObjectId,
  employeeId: String,          // Auto-generated: EMP-{timestamp}
  firstName: String,           // Required
  lastName: String,            // Required
  email: String,               // Required, Unique
  phone: String,               // Required
  address: String,             // Required
  emergencyContact: String,    // Required
  department: String,          // Required, Enum
  position: String,            // Required
  joinDate: Date,              // Required
  status: String,              // Enum: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED
  managerId: String,           // Foreign Key -> Employee.employeeId
  salary: Number,              // Default: 0
  skills: [
    {
      name: String,
      level: String            // Enum: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
  ],
  createdAt: Date,             // Auto-generated
  updatedAt: Date              // Auto-updated
}
```

**Indexes:**
- `employeeId` (Unique)
- `email` (Unique)

**Sample Document:**
```json
{
  "_id": "65f8a1b2c3d4e5f6g7h8i9j0",
  "employeeId": "EMP-1729700000001",
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "ahmed.khan@company.com",
  "phone": "+92-300-1234567",
  "address": "123 Main Street, Rawalpindi",
  "emergencyContact": "+92-300-7654321",
  "department": "Engineering",
  "position": "Software Engineer",
  "joinDate": "2025-11-01T00:00:00.000Z",
  "status": "ACTIVE",
  "managerId": "EMP-001",
  "salary": 50000,
  "skills": [
    { "name": "Java", "level": "ADVANCED" },
    { "name": "Spring Boot", "level": "INTERMEDIATE" }
  ],
  "createdAt": "2025-10-23T10:30:00.000Z",
  "updatedAt": "2025-10-23T10:30:00.000Z"
}
```

---

### 2. Leave Request Collection

**Collection Name**: `leaverequests`

```javascript
{
  _id: ObjectId,
  requestId: String,           // Auto-generated: LR-{timestamp}
  employeeId: String,          // Foreign Key
  employeeName: String,
  leaveType: String,           // Enum: ANNUAL, SICK, EMERGENCY, CASUAL, MATERNITY, PATERNITY
  startDate: String,           // Format: YYYY-MM-DD
  endDate: String,             // Format: YYYY-MM-DD
  numberOfDays: Number,        // Min: 1
  reason: String,              // Required
  status: String,              // Enum: PENDING, APPROVED, REJECTED, CANCELLED
  requestDate: Date,           // Auto-generated
  approver: {
    managerId: String,
    name: String
  },
  approverId: String,
  approvalDate: Date,
  comments: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `requestId` (Unique)
- `employeeId`

**Sample Document:**
```json
{
  "_id": "65f8a1b2c3d4e5f6g7h8i9j1",
  "requestId": "LR-1729700100001",
  "employeeId": "EMP-1729700000001",
  "employeeName": "Ahmed Khan",
  "leaveType": "ANNUAL",
  "startDate": "2025-11-15",
  "endDate": "2025-11-17",
  "numberOfDays": 3,
  "reason": "Family wedding",
  "status": "APPROVED",
  "requestDate": "2025-10-23T10:35:00.000Z",
  "approver": {
    "managerId": "EMP-001",
    "name": "Sarah Ahmad"
  },
  "approverId": "EMP-001",
  "approvalDate": "2025-10-23T11:00:00.000Z",
  "comments": "Approved for the specified dates",
  "createdAt": "2025-10-23T10:35:00.000Z",
  "updatedAt": "2025-10-23T11:00:00.000Z"
}
```

---

### 3. Attendance Collection

**Collection Name**: `attendances`

```javascript
{
  _id: ObjectId,
  recordId: String,            // Auto-generated: ATT-{timestamp}
  employeeId: String,          // Foreign Key
  employeeName: String,
  date: String,                // Format: YYYY-MM-DD
  checkInTime: String,         // Format: HH:MM:SS
  checkOutTime: String,        // Format: HH:MM:SS
  location: String,
  status: String,              // Enum: PRESENT, ABSENT, HALF_DAY, LATE, ON_LEAVE
  workingHours: Number,        // Calculated
  timestamp: Date,
  createdAt: Date
}
```

**Indexes:**
- `recordId` (Unique)
- `employeeId`
- `date`

**Sample Document:**
```json
{
  "_id": "65f8a1b2c3d4e5f6g7h8i9j2",
  "recordId": "ATT-1729700200001",
  "employeeId": "EMP-1729700000001",
  "employeeName": "Ahmed Khan",
  "date": "2025-10-23",
  "checkInTime": "09:00:00",
  "checkOutTime": "17:00:00",
  "location": "Head Office",
  "status": "PRESENT",
  "workingHours": 8,
  "timestamp": "2025-10-23T09:00:00.000Z",
  "createdAt": "2025-10-23T09:00:00.000Z"
}
```

---

### 4. Payroll Collection

**Collection Name**: `payrolls`

```javascript
{
  _id: ObjectId,
  batchId: String,             // Format: PAYROLL-{MONTH}-{YEAR}
  month: Number,               // 1-12
  year: Number,
  payrollRecords: [
    {
      employeeId: String,
      employeeName: String,
      department: String,
      position: String,
      baseSalary: Number,
      allowances: Number,
      deductions: Number,
      tax: Number,
      netSalary: Number,
      workingDays: Number,
      presentDays: Number,
      leaveDays: Number,
      paymentStatus: String,   // Enum: PENDING, PROCESSED, PAID, FAILED
      paymentDate: Date
    }
  ],
  totalEmployees: Number,
  totalAmount: Number,
  status: String,              // Enum: DRAFT, APPROVED, PROCESSED, COMPLETED
  processedBy: String,
  processedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Sample Document:**
```json
{
  "_id": "65f8a1b2c3d4e5f6g7h8i9j3",
  "batchId": "PAYROLL-OCT-2025",
  "month": 10,
  "year": 2025,
  "payrollRecords": [
    {
      "employeeId": "EMP-1729700000001",
      "employeeName": "Ahmed Khan",
      "department": "Engineering",
      "position": "Software Engineer",
      "baseSalary": 50000,
      "allowances": 10000,
      "deductions": 0,
      "tax": 6000,
      "netSalary": 54000,
      "workingDays": 22,
      "presentDays": 22,
      "leaveDays": 0,
      "paymentStatus": "PROCESSED"
    }
  ],
  "totalEmployees": 3,
  "totalAmount": 450000,
  "status": "APPROVED",
  "createdAt": "2025-10-31T00:00:00.000Z",
  "updatedAt": "2025-10-31T00:00:00.000Z"
}
```

---

## Database Operations

### Create Operations

```javascript
// Insert Employee
db.employees.insertOne({
  employeeId: "EMP-1729700000001",
  firstName: "Ahmed",
  lastName: "Khan",
  email: "ahmed.khan@company.com",
  // ... other fields
});

// Insert Leave Request
db.leaverequests.insertOne({
  requestId: "LR-1729700100001",
  employeeId: "EMP-1729700000001",
  leaveType: "ANNUAL",
  // ... other fields
});
```

### Read Operations

```javascript
// Find all active employees
db.employees.find({ status: "ACTIVE" });

// Find employee by ID
db.employees.findOne({ employeeId: "EMP-1729700000001" });

// Find pending leave requests
db.leaverequests.find({ status: "PENDING" });

// Get employee attendance for a month
db.attendances.find({
  employeeId: "EMP-1729700000001",
  date: { $gte: "2025-10-01", $lte: "2025-10-31" }
});
```

### Update Operations

```javascript
// Update employee status
db.employees.updateOne(
  { employeeId: "EMP-1729700000001" },
  { $set: { status: "ON_LEAVE", updatedAt: new Date() } }
);

// Approve leave request
db.leaverequests.updateOne(
  { requestId: "LR-1729700100001" },
  {
    $set: {
      status: "APPROVED",
      approverId: "EMP-001",
      approvalDate: new Date(),
      updatedAt: new Date()
    }
  }
);
```

### Delete Operations

```javascript
// Soft delete employee (update status)
db.employees.updateOne(
  { employeeId: "EMP-1729700000001" },
  { $set: { status: "TERMINATED" } }
);

// Hard delete (not recommended)
db.employees.deleteOne({ employeeId: "EMP-1729700000001" });
```

---

## Relationships

1. **Employee ↔ Employee** (Self-referencing)
   - `managerId` links to another employee's `employeeId`
   - Represents manager-subordinate relationship

2. **Employee → Leave Request** (One-to-Many)
   - One employee can have multiple leave requests
   - `employeeId` is the foreign key

3. **Employee → Attendance** (One-to-Many)
   - One employee can have multiple attendance records
   - `employeeId` is the foreign key

4. **Employee → Payroll Records** (One-to-Many)
   - One employee appears in multiple payroll batches
   - `employeeId` is embedded in payroll records array

---

## Query Examples

### Complex Queries

```javascript
// Get all employees with their leave balances
db.employees.aggregate([
  {
    $lookup: {
      from: "leaverequests",
      localField: "employeeId",
      foreignField: "employeeId",
      as: "leaveRequests"
    }
  },
  {
    $project: {
      employeeId: 1,
      firstName: 1,
      lastName: 1,
      totalLeaves: { $size: "$leaveRequests" },
      approvedLeaves: {
        $size: {
          $filter: {
            input: "$leaveRequests",
            as: "leave",
            cond: { $eq: ["$$leave.status", "APPROVED"] }
          }
        }
      }
    }
  }
]);

// Calculate monthly attendance statistics
db.attendances.aggregate([
  {
    $match: {
      date: { $gte: "2025-10-01", $lte: "2025-10-31" }
    }
  },
  {
    $group: {
      _id: "$employeeId",
      employeeName: { $first: "$employeeName" },
      presentDays: { $sum: 1 },
      totalWorkingHours: { $sum: "$workingHours" }
    }
  }
]);
```

---

## Backup and Restore

```bash
# Backup database
mongodump --db hrms_db --out /backup/hrms_backup_$(date +%Y%m%d)

# Restore database
mongorestore --db hrms_db /backup/hrms_backup_20251023/hrms_db
```
