-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Enable RLS on leave_requests table
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Attendance policies (public access for now - can be restricted later)
CREATE POLICY "Allow all access to attendance"
ON public.attendance
FOR ALL
USING (true)
WITH CHECK (true);

-- Leave requests policies (public access for now - can be restricted later)
CREATE POLICY "Allow all access to leave_requests"
ON public.leave_requests
FOR ALL
USING (true)
WITH CHECK (true);