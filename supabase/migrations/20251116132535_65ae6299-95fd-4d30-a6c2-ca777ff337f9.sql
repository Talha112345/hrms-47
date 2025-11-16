-- Create required enum types
DO $$ BEGIN
  CREATE TYPE public.employee_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.department_type AS ENUM ('Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'IT', 'Customer Service');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Timestamp trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  emergency_contact text NOT NULL,
  department department_type NOT NULL,
  position text NOT NULL,
  join_date date NOT NULL,
  status employee_status NOT NULL DEFAULT 'ACTIVE',
  manager_id text NULL,
  salary numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- No broad public policies; access goes through backend functions using service role

-- Trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_employees_updated_at'
  ) THEN
    CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
