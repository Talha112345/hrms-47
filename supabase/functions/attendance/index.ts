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

    // GET attendance records
    if (method === 'GET') {
      const employeeId = url.searchParams.get('employeeId');
      const date = url.searchParams.get('date');

      let query = supabaseClient
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (employeeId) query = query.eq('employee_id', employeeId);
      if (date) query = query.eq('date', date);

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { attendance: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Mark attendance
    if (method === 'POST') {
      const body = await req.json();
      const { employeeId, date, status, checkIn, checkOut, notes } = body;

      // Validation
      const errors = [];
      if (!employeeId?.trim()) errors.push('Employee ID is required');
      if (!date) errors.push('Date is required');
      if (!status) errors.push('Status is required');
      if (!['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'LEAVE'].includes(status)) {
        errors.push('Invalid status');
      }

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ status: 'error', message: errors.join(', ') }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if attendance already exists for this employee and date
      const { data: existing } = await supabaseClient
        .from('attendance')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('date', date)
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Attendance already marked for this date' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('attendance')
        .insert([{
          employee_id: employeeId,
          date,
          status,
          check_in: checkIn || null,
          check_out: checkOut || null,
          notes: notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { attendance: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'error', message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in attendance function:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
