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

    // GET all employees or single employee
    if (method === 'GET') {
      const employeeId = url.searchParams.get('employeeId');
      const department = url.searchParams.get('department');
      const status = url.searchParams.get('status');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = (page - 1) * limit;

      if (employeeId) {
        // Get single employee
        const { data, error } = await supabaseClient
          .from('employees')
          .select('*')
          .eq('employee_id', employeeId)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ status: 'success', data: { employee: data } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get all employees with filters
      let query = supabaseClient
        .from('employees')
        .select('*', { count: 'exact' });

      if (department) query = query.eq('department', department);
      if (status) query = query.eq('status', status);

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({
          status: 'success',
          data: {
            employees: data,
            pagination: {
              total: count,
              page,
              limit,
              totalPages: Math.ceil((count || 0) / limit)
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Create employee
    if (method === 'POST') {
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        emergencyContact,
        department,
        position,
        joinDate,
        managerId,
        salary
      } = body;

      // Validation
      const errors = [];
      if (!firstName?.trim()) errors.push('First name is required');
      if (!lastName?.trim()) errors.push('Last name is required');
      if (!email?.trim() || !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        errors.push('Valid email is required');
      }
      if (!phone?.trim()) errors.push('Phone number is required');
      if (!address?.trim()) errors.push('Address is required');
      if (!emergencyContact?.trim()) errors.push('Emergency contact is required');
      if (!department?.trim()) errors.push('Department is required');
      if (!position?.trim()) errors.push('Position is required');
      if (!joinDate) errors.push('Join date is required');

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ status: 'error', message: errors.join(', ') }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate unique employee ID
      const employeeId = `EMP-${Date.now()}`;

      const { data, error } = await supabaseClient
        .from('employees')
        .insert([{
          employee_id: employeeId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          address,
          emergency_contact: emergencyContact,
          department,
          position,
          join_date: joinDate,
          manager_id: managerId || null,
          salary: salary || 0,
          status: 'ACTIVE'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ status: 'success', data: { employee: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT - Update employee
    if (method === 'PUT') {
      const body = await req.json();
      const { employeeId, ...updates } = body;

      if (!employeeId) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Employee ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updateData: any = {};
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.address) updateData.address = updates.address;
      if (updates.emergencyContact) updateData.emergency_contact = updates.emergencyContact;
      if (updates.department) updateData.department = updates.department;
      if (updates.position) updateData.position = updates.position;
      if (updates.joinDate) updateData.join_date = updates.joinDate;
      if (updates.managerId !== undefined) updateData.manager_id = updates.managerId;
      if (updates.salary !== undefined) updateData.salary = updates.salary;
      if (updates.status) updateData.status = updates.status;

      const { data, error } = await supabaseClient
        .from('employees')
        .update(updateData)
        .eq('employee_id', employeeId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { employee: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE - Delete employee
    if (method === 'DELETE') {
      const employeeId = url.searchParams.get('employeeId');

      if (!employeeId) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Employee ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseClient
        .from('employees')
        .delete()
        .eq('employee_id', employeeId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', message: 'Employee deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'error', message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in employees function:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
