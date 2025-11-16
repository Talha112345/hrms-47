-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'LEAVE')),
  check_in TIME,
  check_out TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('ANNUAL', 'SICK', 'EMERGENCY', 'CASUAL', 'MATERNITY', 'PATERNITY')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  number_of_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approver_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger for attendance updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for leave_requests updated_at
CREATE TRIGGER update_leave_requests_updated_at
BEFORE UPDATE ON public.leave_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();