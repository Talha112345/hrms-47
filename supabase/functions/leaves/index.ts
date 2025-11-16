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

    const url = new URL(req.url);
    const method = req.method;

    // GET leave requests
    if (method === 'GET') {
      const employeeId = url.searchParams.get('employeeId');
      const status = url.searchParams.get('status');

      let query = supabaseClient
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (employeeId) query = query.eq('employee_id', employeeId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { leaves: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Create leave request
    if (method === 'POST') {
      const body = await req.json();
      const { employeeId, leaveType, startDate, endDate, reason } = body;

      // Validation
      const errors = [];
      if (!employeeId?.trim()) errors.push('Employee ID is required');
      if (!leaveType) errors.push('Leave type is required');
      if (!['ANNUAL', 'SICK', 'EMERGENCY', 'CASUAL', 'MATERNITY', 'PATERNITY'].includes(leaveType)) {
        errors.push('Invalid leave type');
      }
      if (!startDate) errors.push('Start date is required');
      if (!endDate) errors.push('End date is required');
      if (!reason?.trim()) errors.push('Reason is required');

      // Validate date range
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
          errors.push('End date must be after start date');
        }
      }

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ status: 'error', message: errors.join(', ') }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate number of days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const { data, error } = await supabaseClient
        .from('leave_requests')
        .insert([{
          employee_id: employeeId,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          number_of_days: numberOfDays,
          reason,
          status: 'PENDING'
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { leave: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT - Update leave request status
    if (method === 'PUT') {
      const body = await req.json();
      const { leaveId, status, approverComments } = body;

      if (!leaveId) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Leave ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Invalid status' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updateData: any = { status };
      if (approverComments) updateData.approver_comments = approverComments;

      const { data, error } = await supabaseClient
        .from('leave_requests')
        .update(updateData)
        .eq('id', leaveId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { leave: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'error', message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in leaves function:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
