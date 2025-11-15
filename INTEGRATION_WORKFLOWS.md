# Internal Module Integration Workflows

## Overview
This document describes the internal integrations between different HRMS modules, showing how data flows between Employee, Leave, Attendance, Payroll, and other subsystems.

---

## Integration 1: Leave Management ↔ Employee Management

### Workflow Description
When an employee submits a leave request, the system automatically validates employee existence, fetches manager details, and updates leave balance.

### Data Flow Diagram

```
┌─────────────────┐
│   EMPLOYEE      │
│   SUBMITS       │
│   LEAVE         │
│   REQUEST       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Leave Request Controller           │
│  1. Validate employeeId             │
│  2. Fetch employee details          │
│  3. Get manager information         │
│  4. Check leave eligibility         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Employee Database Query            │
│  - Find employee by employeeId      │
│  - Retrieve manager details         │
│  - Get department information       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Leave Request Database             │
│  - Create new leave request         │
│  - Store employee name              │
│  - Link to manager (approver)       │
│  - Set status to PENDING            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Notification (Future Enhancement)  │
│  - Email to employee                │
│  - Alert to manager                 │
└─────────────────────────────────────┘
```

### Implementation Code

**Leave Controller Integration:**
```javascript
// In leaveController.js - submitLeaveRequest()

// Step 1: Validate employee exists
const employee = await Employee.findOne({ 
  employeeId: req.body.employeeId 
});

if (!employee) {
  return res.status(404).json({
    status: 'error',
    message: 'Employee not found'
  });
}

// Step 2: Get manager details for approval workflow
let approver = { managerId: null, name: null };
if (employee.managerId) {
  const manager = await Employee.findOne({ 
    employeeId: employee.managerId 
  });
  if (manager) {
    approver = {
      managerId: manager.employeeId,
      name: `${manager.firstName} ${manager.lastName}`
    };
  }
}

// Step 3: Create leave request with integrated data
const leaveRequest = new LeaveRequest({
  ...req.body,
  employeeName: `${employee.firstName} ${employee.lastName}`,
  approver
});

await leaveRequest.save();
```

### Integration Points

1. **Employee → Leave Request**
   - Employee ID validation
   - Employee name auto-population
   - Manager assignment

2. **Leave Request → Employee Balance**
   - Leave balance deduction (when approved)
   - Leave type validation against eligibility
   - Annual leave quota tracking

### Business Rules

- Employee must exist and be ACTIVE
- Leave request cannot exceed available balance
- Manager approval required for all leave types
- Emergency leaves auto-approved for urgent situations
- Leave balance updated upon approval

---

## Integration 2: Payroll ↔ Attendance

### Workflow Description
Payroll generation automatically fetches attendance records to calculate present days, deductions for absences, and final net salary.

### Data Flow Diagram

```
┌─────────────────────┐
│  PAYROLL            │
│  GENERATION         │
│  TRIGGERED          │
│  (Month/Year)       │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Payroll Controller                  │
│  1. Get all active employees         │
│  2. For each employee:               │
│     - Fetch attendance records       │
│     - Calculate present days         │
│     - Calculate working hours        │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Employee Database Query             │
│  - Find all ACTIVE employees         │
│  - Get salary information            │
│  - Retrieve department details       │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Attendance Database Query           │
│  - Get attendance for month/year     │
│  - Count present days                │
│  - Calculate total working hours     │
│  - Identify leave days               │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Salary Calculation Engine           │
│  - Base Salary                       │
│  - + Allowances (20%)                │
│  - - Tax (10%)                       │
│  - - Deductions (absent days)        │
│  = Net Salary                        │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Payroll Database                    │
│  - Create payroll batch              │
│  - Store employee records            │
│  - Set status to APPROVED            │
└──────────────────────────────────────┘
```

### Implementation Code

**Payroll Controller Integration:**
```javascript
// In payrollController.js - generatePayroll()

// Step 1: Get all active employees
const employees = await Employee.find({ status: 'ACTIVE' });

// Step 2: Process each employee
for (const employee of employees) {
  // Fetch attendance records for the month
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
  
  const attendanceRecords = await Attendance.find({
    employeeId: employee.employeeId,
    date: { $gte: startDate, $lte: endDate }
  });

  // Step 3: Calculate attendance metrics
  const presentDays = attendanceRecords.length;
  const workingDays = 22; // Standard working days
  const leaveDays = workingDays - presentDays;

  // Step 4: Calculate salary components
  const baseSalary = employee.salary || 50000;
  const allowances = baseSalary * 0.20; // 20% allowances
  const grossSalary = baseSalary + allowances;
  const tax = grossSalary * 0.10; // 10% tax
  const deductions = leaveDays * (baseSalary / workingDays);
  const netSalary = grossSalary - tax - deductions;

  // Step 5: Create payroll record
  payrollRecords.push({
    employeeId: employee.employeeId,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    department: employee.department,
    position: employee.position,
    baseSalary,
    allowances,
    deductions,
    tax,
    netSalary,
    workingDays,
    presentDays,
    leaveDays,
    paymentStatus: 'PENDING'
  });
}

// Step 6: Create payroll batch
const payroll = new Payroll({
  batchId: `PAYROLL-${monthName}-${year}`,
  month,
  year,
  payrollRecords,
  totalEmployees: employees.length,
  totalAmount: totalAmount,
  status: 'APPROVED'
});

await payroll.save();
```

### Integration Points

1. **Employee → Payroll**
   - Employee salary information
   - Department and position details
   - Active status validation

2. **Attendance → Payroll**
   - Present days calculation
   - Leave days tracking
   - Working hours validation

3. **Leave → Payroll**
   - Approved leave deduction
   - Leave without pay calculation
   - Leave balance impact

### Calculation Formula

```
Gross Salary = Base Salary + Allowances
Allowances = Base Salary × 20%
Tax = Gross Salary × 10%
Deductions = (Leave Days × Base Salary) ÷ Working Days
Net Salary = Gross Salary - Tax - Deductions
```

### Business Rules

- Only ACTIVE employees included in payroll
- Standard working days = 22 per month
- Allowances fixed at 20% of base salary
- Tax fixed at 10% of gross salary
- Unpaid leave deducted proportionally
- Approved leaves don't affect salary

---

## Integration 3: Training ↔ Skills (Employee Management)

### Workflow Description
When an employee completes training, their skill profile is automatically updated to reflect new competencies.

### Data Flow Diagram

```
┌─────────────────┐
│   EMPLOYEE      │
│   ENROLLS IN    │
│   TRAINING      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Training Controller                │
│  1. Validate employee exists        │
│  2. Check training program          │
│  3. Create enrollment record        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Training Enrollment Database       │
│  - Store enrollment details         │
│  - Set status to ENROLLED           │
└────────┬────────────────────────────┘
         │
         │ (On Completion)
         ▼
┌─────────────────────────────────────┐
│  Employee Skills Update             │
│  - Add new skill to profile         │
│  - Set skill level                  │
│  - Issue certificate                │
└─────────────────────────────────────┘
```

### Implementation Code

**Training Completion Handler:**
```javascript
// When training is marked complete
async function completeTraining(enrollmentId) {
  const enrollment = await Training.findOne({ enrollmentId });
  const employee = await Employee.findOne({ 
    employeeId: enrollment.employeeId 
  });

  // Update employee skills
  const newSkill = {
    name: enrollment.program.title,
    level: 'INTERMEDIATE'  // Or based on training level
  };

  employee.skills.push(newSkill);
  await employee.save();

  // Update enrollment status
  enrollment.status = 'COMPLETED';
  enrollment.certificateIssued = true;
  enrollment.certificateId = `CERT-${Date.now()}`;
  await enrollment.save();
}
```

---

## Additional Integration Scenarios

### 4. Performance Review → Training Recommendations
- Low performance scores trigger training suggestions
- Skill gaps identified and matched with programs
- Automated enrollment for mandatory training

### 5. Recruitment → Employee Onboarding
- Successful candidate automatically becomes employee
- Interview feedback linked to initial performance baseline
- Application data pre-fills employee profile

### 6. Leave → Attendance
- Approved leaves marked in attendance system
- Leave days counted as "ON_LEAVE" status
- Prevents duplicate attendance marking

---

## Integration Benefits

1. **Data Consistency**: Single source of truth across modules
2. **Automation**: Reduced manual data entry and errors
3. **Real-time Updates**: Immediate reflection of changes
4. **Audit Trail**: Complete tracking of data flow
5. **Business Intelligence**: Integrated reporting and analytics

---

## Future Enhancements

1. **Real-time Notifications**
   - Email/SMS alerts for approvals
   - Push notifications for mobile apps

2. **Advanced Analytics**
   - Predictive leave patterns
   - Attrition risk analysis
   - Performance trend forecasting

3. **External Integrations**
   - Biometric attendance devices
   - Banking systems for payroll
   - Government tax systems

4. **Workflow Automation**
   - Auto-approval rules
   - Escalation mechanisms
   - SLA monitoring
