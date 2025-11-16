import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { method, ...params } = body;

    // Generate payroll for a month
    if (method === 'GENERATE') {
      const { month, year } = params;

      if (!month || !year) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Month and year are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch all active employees
      const { data: employees, error: empError } = await supabaseClient
        .from('employees')
        .select('*')
        .eq('status', 'ACTIVE');

      if (empError) throw empError;

      // Calculate payroll for each employee
      const payrollRecords = await Promise.all(employees.map(async (emp: any) => {
        // Get attendance for the month
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const { data: attendance } = await supabaseClient
          .from('attendance')
          .select('*')
          .eq('employee_id', emp.employee_id)
          .gte('date', startDate)
          .lte('date', endDate);

        const presentDays = attendance?.filter((a: any) => 
          ['PRESENT', 'HALF_DAY'].includes(a.status)
        ).length || 0;

        // Calculate salary components
        const baseSalary = emp.salary || 0;
        const allowances = baseSalary * 0.2; // 20% allowances
        const deductions = baseSalary * 0.05; // 5% deductions
        const tax = baseSalary * 0.1; // 10% tax
        const netSalary = baseSalary + allowances - deductions - tax;

        return {
          employee_id: emp.employee_id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          department: emp.department,
          position: emp.position,
          base_salary: baseSalary,
          allowances,
          deductions,
          tax,
          net_salary: netSalary,
          present_days: presentDays,
          month,
          year,
          status: 'PENDING'
        };
      }));

      // Store payroll records
      const { data: payroll, error: payrollError } = await supabaseClient
        .from('payroll')
        .insert(payrollRecords)
        .select();

      if (payrollError) throw payrollError;

      return new Response(
        JSON.stringify({ status: 'success', data: { payroll, total: payrollRecords.length } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payroll records
    if (method === 'GET') {
      const { month, year, employeeId } = params;

      let query = supabaseClient
        .from('payroll')
        .select('*')
        .order('created_at', { ascending: false });

      if (month) query = query.eq('month', month);
      if (year) query = query.eq('year', year);
      if (employeeId) query = query.eq('employee_id', employeeId);

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { payroll: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update payroll status
    if (method === 'UPDATE_STATUS') {
      const { id, status } = params;

      if (!id || !status) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'ID and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('payroll')
        .update({ status, payment_date: status === 'PAID' ? new Date().toISOString() : null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { payroll: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'error', message: 'Invalid method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in payroll function:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
