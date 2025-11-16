import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Calendar, Clock, DollarSign, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    monthlyPayroll: 0
  });

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);

  // Fetch dashboard stats
  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
    fetchAttendance();
    fetchPayroll();
    fetchPerformanceReviews();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('employees', {
        body: { method: 'GET' }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        setEmployees(data.data.employees || []);
        setStats(prev => ({ ...prev, totalEmployees: data.data.employees?.length || 0 }));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('leaves', {
        body: { method: 'GET' }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        setLeaves(data.data.leaves || []);
        const pending = data.data.leaves?.filter((l: any) => l.status === 'PENDING').length || 0;
        setStats(prev => ({ ...prev, pendingLeaves: pending }));
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.functions.invoke('attendance', {
        body: { method: 'GET', date: today }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        setAttendance(data.data.attendance || []);
        setStats(prev => ({ ...prev, todayAttendance: data.data.attendance?.length || 0 }));
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const fetchPayroll = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase.functions.invoke('payroll', {
        body: { method: 'GET', month: currentMonth, year: currentYear }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        const payrollData = data.data.payroll || [];
        setPayroll(payrollData);
        
        // Calculate total monthly payroll amount
        const totalAmount = payrollData.reduce((sum: number, record: any) => 
          sum + (Number(record.net_salary) || 0), 0
        );
        setStats(prev => ({ ...prev, monthlyPayroll: totalAmount }));
      }
    } catch (error) {
      console.error("Error fetching payroll:", error);
    }
  };

  const fetchPerformanceReviews = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('performance', {
        body: { method: 'GET' }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        setPerformanceReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      method: 'POST',
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      emergencyContact: formData.get("emergencyContact"),
      department: formData.get("department"),
      position: formData.get("position"),
      joinDate: formData.get("joinDate"),
      managerId: formData.get("managerId") || null,
      salary: Number(formData.get("salary")) || 0
    };

    try {
      const { data, error } = await supabase.functions.invoke('employees', {
        body: payload
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        toast.success("Employee created successfully!");
        fetchEmployees();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(data?.message || "Failed to create employee");
      }
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast.error(error.message || "Error creating employee");
    }
  };

  const handleLeaveRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      method: 'CREATE',
      employeeId: formData.get("employeeId"),
      leaveType: formData.get("leaveType"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      reason: formData.get("reason")
    };

    try {
      const { data, error } = await supabase.functions.invoke('leaves', {
        body: payload
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        toast.success("Leave request submitted successfully!");
        fetchLeaveRequests();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(data?.message || "Failed to submit leave request");
      }
    } catch (error: any) {
      console.error("Error submitting leave:", error);
      toast.error(error.message || "Error submitting leave request");
    }
  };

  const handleAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      employeeId: formData.get("employeeId"),
      date: formData.get("date"),
      status: formData.get("status"),
      checkIn: formData.get("checkIn") || null,
      checkOut: formData.get("checkOut") || null,
      notes: formData.get("notes") || null
    };

    try {
      const { data, error } = await supabase.functions.invoke('attendance', {
        method: 'POST',
        body: payload
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        toast.success("Attendance marked successfully!");
        fetchAttendance();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(data?.message || "Failed to mark attendance");
      }
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      toast.error(error.message || "Error marking attendance");
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const month = Number(formData.get("month"));
    const year = Number(formData.get("year"));

    try {
      const { data, error } = await supabase.functions.invoke('payroll', {
        body: { method: 'GENERATE', month, year }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        toast.success(`Payroll generated for ${data.data.total} employees!`);
        fetchPayroll();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(data?.message || "Failed to generate payroll");
      }
    } catch (error: any) {
      console.error("Error generating payroll:", error);
      toast.error(error.message || "Failed to generate payroll");
    }
  };

  const handleApproveLeave = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const { data, error } = await supabase.functions.invoke('leaves', {
        body: { method: 'UPDATE_STATUS', id: leaveId, status }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        toast.success(`Leave request ${status.toLowerCase()}!`);
        fetchLeaveRequests();
      } else {
        toast.error(data?.message || "Failed to update leave status");
      }
    } catch (error: any) {
      console.error("Error updating leave:", error);
      toast.error(error.message || "Failed to update leave status");
    }
  };

  const handleCreatePerformanceReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      employeeId: formData.get("employeeId"),
      reviewerId: formData.get("reviewerId"),
      reviewPeriod: formData.get("reviewPeriod"),
      rating: Number(formData.get("rating")),
      feedback: formData.get("feedback"),
      goals: [],
      kpis: []
    };

    try {
      const { data, error } = await supabase.functions.invoke('performance', {
        body: { method: 'CREATE', ...payload }
      });
      
      if (error) throw error;
      
      if (data?.status === "success") {
        toast.success("Performance review created successfully!");
        fetchPerformanceReviews();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(data?.message || "Failed to create review");
      }
    } catch (error: any) {
      console.error("Error creating review:", error);
      toast.error(error.message || "Failed to create review");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-foreground">HRMS Dashboard</h1>
          <p className="text-muted-foreground mt-1">Enterprise Information System - Final Phase</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Pending Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.pendingLeaves}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.todayAttendance}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monthly Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">${stats.monthlyPayroll.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Employee</CardTitle>
                <CardDescription>Add a new employee to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input id="emergencyContact" name="emergencyContact" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select name="department" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="HR">Human Resources</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" name="position" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Join Date</Label>
                      <Input id="joinDate" name="joinDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerId">Manager ID (Optional)</Label>
                      <Input id="managerId" name="managerId" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Monthly Salary ($)</Label>
                      <Input id="salary" name="salary" type="number" min="0" step="0.01" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Create Employee</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee List</CardTitle>
                <CardDescription>All registered employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No employees found</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {employees.map((emp: any) => (
                        <Card key={emp.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{emp.first_name} {emp.last_name}</CardTitle>
                            <CardDescription>{emp.position}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <p><span className="font-medium">ID:</span> {emp.employee_id}</p>
                            <p><span className="font-medium">Email:</span> {emp.email}</p>
                            <p><span className="font-medium">Department:</span> {emp.department}</p>
                            <p><span className="font-medium">Status:</span> <span className="text-success font-medium">{emp.status}</span></p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Tab */}
          <TabsContent value="leave" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Leave Request</CardTitle>
                <CardDescription>Apply for leave</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLeaveRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input id="employeeId" name="employeeId" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaveType">Leave Type</Label>
                      <Select name="leaveType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                          <SelectItem value="SICK">Sick Leave</SelectItem>
                          <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                          <SelectItem value="CASUAL">Casual Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" name="endDate" type="date" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Input id="reason" name="reason" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Submit Request</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Pending and approved leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaves.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No leave requests found</p>
                  ) : (
                    leaves.map((leave: any) => (
                      <Card key={leave.id} className="border-l-4" style={{ borderLeftColor: leave.status === 'PENDING' ? 'hsl(var(--warning))' : leave.status === 'APPROVED' ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-medium">Employee ID: {leave.employee_id}</p>
                              <p className="text-sm text-muted-foreground">{leave.leave_type} - {leave.number_of_days} days</p>
                              <p className="text-sm">{leave.start_date} to {leave.end_date}</p>
                              <p className="text-sm text-muted-foreground">{leave.reason}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                leave.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                                leave.status === 'APPROVED' ? 'bg-success/10 text-success' :
                                'bg-destructive/10 text-destructive'
                              }`}>
                                {leave.status}
                              </div>
                              {leave.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="default" onClick={() => handleApproveLeave(leave.id, 'APPROVED')}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleApproveLeave(leave.id, 'REJECTED')}>
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Attendance</CardTitle>
                <CardDescription>Check-in employee attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAttendance} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="attendanceEmployeeId">Employee ID</Label>
                      <Input id="attendanceEmployeeId" name="employeeId" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="HALF_DAY">Half Day</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                          <SelectItem value="LEAVE">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in Time (Optional)</Label>
                      <Input id="checkIn" name="checkIn" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out Time (Optional)</Label>
                      <Input id="checkOut" name="checkOut" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input id="notes" name="notes" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Record Attendance</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance</CardTitle>
                <CardDescription>Attendance records for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendance.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No attendance records found</p>
                  ) : (
                    <div className="space-y-2">
                      {attendance.map((record: any) => (
                        <Card key={record.id} className="border-l-4" style={{ borderLeftColor: record.status === 'PRESENT' ? 'hsl(var(--success))' : record.status === 'ABSENT' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))' }}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Employee ID: {record.employee_id}</p>
                                <p className="text-sm text-muted-foreground">Date: {record.date}</p>
                                {record.check_in && <p className="text-sm">Check-in: {record.check_in}</p>}
                                {record.check_out && <p className="text-sm">Check-out: {record.check_out}</p>}
                                {record.notes && <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                record.status === 'PRESENT' ? 'bg-success/10 text-success' :
                                record.status === 'ABSENT' ? 'bg-destructive/10 text-destructive' :
                                'bg-warning/10 text-warning'
                              }`}>
                                {record.status}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Payroll</CardTitle>
                <CardDescription>Generate monthly payroll for employees</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGeneratePayroll} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month">Month</Label>
                      <Select name="month" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" name="year" type="number" defaultValue={new Date().getFullYear()} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Generate Payroll</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Records</CardTitle>
                <CardDescription>Current month payroll details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payroll.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No payroll records found</p>
                  ) : (
                    <div className="space-y-2">
                      {payroll.map((record: any) => (
                        <Card key={record.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{record.employee_name}</p>
                                  <p className="text-sm text-muted-foreground">{record.position} - {record.department}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  record.status === 'PAID' ? 'bg-success/10 text-success' :
                                  record.status === 'APPROVED' ? 'bg-primary/10 text-primary' :
                                  'bg-warning/10 text-warning'
                                }`}>
                                  {record.status}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Base Salary</p>
                                  <p className="font-medium">${Number(record.base_salary).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Allowances</p>
                                  <p className="font-medium text-success">+${Number(record.allowances).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Deductions</p>
                                  <p className="font-medium text-destructive">-${Number(record.deductions).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Net Salary</p>
                                  <p className="font-bold text-primary">${Number(record.net_salary).toFixed(2)}</p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">Present Days: {record.present_days} | Month: {record.month}/{record.year}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Performance Review</CardTitle>
                <CardDescription>Evaluate employee performance and set KPIs</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePerformanceReview} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="perfEmployeeId">Employee ID</Label>
                      <Input id="perfEmployeeId" name="employeeId" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviewerId">Reviewer (Manager)</Label>
                      <Select name="reviewerId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp: any) => (
                            <SelectItem key={emp.id} value={emp.employee_id}>
                              {emp.first_name} {emp.last_name} - {emp.employee_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviewPeriod">Review Period</Label>
                      <Input id="reviewPeriod" name="reviewPeriod" placeholder="Q1 2024" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (1-5)</Label>
                      <Input id="rating" name="rating" type="number" min="1" max="5" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="feedback">Feedback</Label>
                      <Input id="feedback" name="feedback" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Create Review</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Reviews</CardTitle>
                <CardDescription>Recent employee performance evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceReviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No performance reviews found</p>
                  ) : (
                    <div className="space-y-2">
                      {performanceReviews.map((review: any) => (
                        <Card key={review.id} className="border-l-4 border-l-accent">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="font-medium">Employee ID: {review.employee_id}</p>
                                <p className="text-sm text-muted-foreground">Review Period: {review.review_period}</p>
                                <p className="text-sm text-muted-foreground">Reviewer: {review.reviewer_id}</p>
                                {review.feedback && <p className="text-sm mt-2">{review.feedback}</p>}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  <Award className="h-5 w-5 text-warning" />
                                  <span className="text-2xl font-bold">{review.rating}/5</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{review.status}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-warning">{stats.pendingLeaves}</div>
                    <Calendar className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-success">{stats.todayAttendance}</div>
                    <Clock className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-primary">
                      ${stats.monthlyPayroll.toLocaleString()}
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution by Department</CardTitle>
                <CardDescription>Overview of workforce across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'IT', 'Customer Service'].map(dept => {
                    const count = employees.filter((e: any) => e.department === dept).length;
                    const percentage = stats.totalEmployees > 0 ? (count / stats.totalEmployees) * 100 : 0;
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{dept}</span>
                          <span className="text-muted-foreground">{count} employees ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Leave Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Request Status</CardTitle>
                  <CardDescription>Current leave request breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['PENDING', 'APPROVED', 'REJECTED'].map(status => {
                      const count = leaves.filter((l: any) => l.status === status).length;
                      const color = status === 'PENDING' ? 'text-warning' : 
                                   status === 'APPROVED' ? 'text-success' : 'text-destructive';
                      return (
                        <div key={status} className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium">{status}</span>
                          <span className={`text-2xl font-bold ${color}`}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Types Distribution</CardTitle>
                  <CardDescription>Breakdown by leave type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['ANNUAL', 'SICK', 'EMERGENCY', 'CASUAL'].map(type => {
                      const count = leaves.filter((l: any) => l.leave_type === type).length;
                      return (
                        <div key={type} className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium">{type}</span>
                          <span className="text-2xl font-bold text-primary">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance & Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>Today's attendance status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE'].map(status => {
                      const count = attendance.filter((a: any) => a.status === status).length;
                      const color = status === 'PRESENT' ? 'text-success' : 
                                   status === 'ABSENT' ? 'text-destructive' : 'text-warning';
                      return (
                        <div key={status} className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium">{status.replace('_', ' ')}</span>
                          <span className={`text-2xl font-bold ${color}`}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Ratings</CardTitle>
                  <CardDescription>Employee performance distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = performanceReviews.filter((r: any) => r.rating === rating).length;
                      const avgRating = performanceReviews.length > 0 
                        ? (performanceReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / performanceReviews.length).toFixed(1)
                        : 'N/A';
                      return (
                        <div key={rating} className="flex justify-between items-center pb-2 border-b">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rating} Stars</span>
                            <Award className="h-4 w-4 text-warning" />
                          </div>
                          <span className="text-2xl font-bold text-primary">{count}</span>
                        </div>
                      );
                    })}
                    <div className="pt-2 text-center">
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <p className="text-3xl font-bold text-primary">
                        {performanceReviews.length > 0 
                          ? (performanceReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / performanceReviews.length).toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payroll Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Current month payroll breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Base Salary</p>
                    <p className="text-2xl font-bold text-primary">
                      ${payroll.reduce((sum: number, r: any) => sum + (Number(r.base_salary) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 bg-success/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Allowances</p>
                    <p className="text-2xl font-bold text-success">
                      ${payroll.reduce((sum: number, r: any) => sum + (Number(r.allowances) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Deductions</p>
                    <p className="text-2xl font-bold text-destructive">
                      ${payroll.reduce((sum: number, r: any) => sum + (Number(r.deductions) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Payroll</p>
                    <p className="text-2xl font-bold text-primary">
                      ${payroll.reduce((sum: number, r: any) => sum + (Number(r.net_salary) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Employees Processed</span>
                    <span className="font-medium">{payroll.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending Payments</span>
                    <span className="font-medium text-warning">
                      {payroll.filter((r: any) => r.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed Payments</span>
                    <span className="font-medium text-success">
                      {payroll.filter((r: any) => r.status === 'PAID').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Total Employees</span>
                    <span className="font-bold">{stats.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Pending Leaves</span>
                    <span className="font-bold text-warning">{stats.pendingLeaves}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Active Employees</span>
                    <span className="font-bold text-success">{employees.filter((e: any) => e.status === 'ACTIVE').length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    System Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-medium">Version:</span> 1.0.0</p>
                  <p><span className="font-medium">API Status:</span> <span className="text-success">Connected</span></p>
                  <p><span className="font-medium">Database:</span> MongoDB</p>
                  <p><span className="font-medium">Last Sync:</span> {new Date().toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
