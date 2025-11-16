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

    // Create performance review
    if (method === 'CREATE') {
      const { employeeId, reviewerId, reviewPeriod, kpis, goals, feedback, rating } = params;

      const errors = [];
      if (!employeeId) errors.push('Employee ID is required');
      if (!reviewerId) errors.push('Reviewer ID is required');
      if (!reviewPeriod) errors.push('Review period is required');
      if (!rating || rating < 1 || rating > 5) errors.push('Rating must be between 1-5');

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ status: 'error', message: errors.join(', ') }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('performance_reviews')
        .insert([{
          employee_id: employeeId,
          reviewer_id: reviewerId,
          review_period: reviewPeriod,
          kpis: kpis || [],
          goals: goals || [],
          feedback: feedback || '',
          rating,
          status: 'COMPLETED'
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { review: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get performance reviews
    if (method === 'GET') {
      const { employeeId, reviewId } = params;

      let query = supabaseClient
        .from('performance_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (employeeId) query = query.eq('employee_id', employeeId);
      if (reviewId) query = query.eq('id', reviewId);

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: 'success', data: { reviews: data } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get employee KPI summary
    if (method === 'GET_KPI_SUMMARY') {
      const { employeeId } = params;

      if (!employeeId) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Employee ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get all reviews for employee
      const { data: reviews, error: reviewError } = await supabaseClient
        .from('performance_reviews')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (reviewError) throw reviewError;

      // Calculate summary
      const avgRating = reviews?.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

      return new Response(
        JSON.stringify({
          status: 'success',
          data: {
            employeeId,
            totalReviews: reviews?.length || 0,
            averageRating: avgRating.toFixed(2),
            latestReview: reviews?.[0] || null,
            reviews: reviews || []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'error', message: 'Invalid method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in performance function:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
