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

  // Fetch dashboard stats
  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('employees', {
        method: 'GET'
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
      // Mock data for now - implement leave endpoint later
      setLeaves([]);
      setStats(prev => ({ ...prev, pendingLeaves: 0 }));
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      emergencyContact: formData.get("emergencyContact"),
      department: formData.get("department"),
      position: formData.get("position"),
      joinDate: formData.get("joinDate"),
      managerId: formData.get("managerId") || null
    };

    try {
      const { data, error } = await supabase.functions.invoke('employees', {
        method: 'POST',
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
    toast.info("Leave management will be implemented soon");
  };

  const handleAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.info("Attendance tracking will be implemented soon");
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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
                        <Card key={emp._id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{emp.firstName} {emp.lastName}</CardTitle>
                            <CardDescription>{emp.position}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <p><span className="font-medium">ID:</span> {emp.employeeId}</p>
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
                    <div className="space-y-2">
                      <Label htmlFor="numberOfDays">Number of Days</Label>
                      <Input id="numberOfDays" name="numberOfDays" type="number" required />
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
                      <Card key={leave._id} className="border-l-4" style={{ borderLeftColor: leave.status === 'PENDING' ? 'hsl(var(--warning))' : leave.status === 'APPROVED' ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-medium">{leave.employeeName}</p>
                              <p className="text-sm text-muted-foreground">{leave.leaveType} - {leave.numberOfDays} days</p>
                              <p className="text-sm">{leave.startDate} to {leave.endDate}</p>
                              <p className="text-sm text-muted-foreground">{leave.reason}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              leave.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                              leave.status === 'APPROVED' ? 'bg-success/10 text-success' :
                              'bg-destructive/10 text-destructive'
                            }`}>
                              {leave.status}
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
                      <Label htmlFor="checkInTime">Check-in Time</Label>
                      <Input id="checkInTime" name="checkInTime" type="time" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Record Attendance</Button>
                </form>
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
