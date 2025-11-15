import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Calendar, Clock, TrendingUp, Shield, Award } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">HRMS Pro</h1>
          </div>
          <Link to="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Enterprise HR Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive Human Resource Management System with complete API integration, 
            database management, and real-time analytics. Built for Assignment 2 - Final Phase.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Launch Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                View Backend Code
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>Complete CRUD operations for employee records</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create, read, update, and delete employee profiles with validation, 
                department assignments, and role management.
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-10 w-10 text-warning mb-2" />
                <CardTitle>Leave Management</CardTitle>
                <CardDescription>Automated leave request and approval workflow</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Submit, track, and approve leave requests with balance tracking 
                and manager notifications.
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-success mb-2" />
                <CardTitle>Attendance Tracking</CardTitle>
                <CardDescription>Real-time attendance check-in/check-out</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Record daily attendance with location tracking, working hours 
                calculation, and monthly reports.
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Payroll Processing</CardTitle>
                <CardDescription>Automated salary calculation and generation</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Generate monthly payroll with attendance integration, tax 
                calculations, and deductions.
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Performance Reviews</CardTitle>
                <CardDescription>KPI tracking and performance evaluation</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create performance reviews with KPI metrics, manager feedback, 
                and self-assessment.
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-success mb-2" />
                <CardTitle>Training & Development</CardTitle>
                <CardDescription>Employee skill development programs</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Enroll employees in training programs, track completion, 
                and manage certifications.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Frontend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• React 18 with TypeScript</p>
                <p>• Tailwind CSS for styling</p>
                <p>• Shadcn UI components</p>
                <p>• React Router for navigation</p>
                <p>• Tanstack Query for data fetching</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Node.js with Express.js</p>
                <p>• MongoDB for database</p>
                <p>• RESTful API architecture</p>
                <p>• MVC design pattern</p>
                <p>• Input validation & error handling</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              HRMS Enterprise Information System - Assignment 2 Final Phase
            </p>
            <p className="text-xs mt-2">
              Submitted to: Sir Hassaan Rabbani
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
