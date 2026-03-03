import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all companies (status column only) to compute distribution
    const { data, error } = await supabase
      .from("companies")
      .select("status");

    if (error) throw error;

    // Aggregate status counts
    const statusCounts: Record<string, number> = {};
    let total = 0;
    for (const row of data ?? []) {
      const status = row.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      total++;
    }

    // Build response with counts and percentages
    const distribution = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return new Response(
      JSON.stringify({ total_companies: total, distribution }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
