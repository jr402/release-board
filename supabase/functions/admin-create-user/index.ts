// Supabase Edge Function: admin-create-user
//
// Single endpoint used by the Team modal for ANY admin-only user action:
//   action = "create"         → create a new auth user + members row
//   action = "reset_password" → update an existing user's password
//
// Deploy: paste this file into Supabase Dashboard → Edge Functions → New function
// (name it exactly "admin-create-user"). No env vars needed — Supabase auto-injects
// SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    // 1) Validate caller using their JWT
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user?.email) return json({ error: "Invalid session" }, 401);

    // 2) Check caller is admin
    const { data: member, error: memberError } = await callerClient
      .from("members")
      .select("role")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();
    if (memberError) return json({ error: memberError.message }, 500);
    if (member?.role !== "admin") return json({ error: "Forbidden — admin only" }, 403);

    // 3) Parse input
    const body = await req.json().catch(() => ({}));
    const action = body.action || "create";
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    const role = body.role || "";

    if (!email || !email.includes("@")) return json({ error: "Invalid email" }, 400);

    // Admin client (server-side, full powers)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (action === "create") {
      if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
      if (!["admin", "editor", "reader"].includes(role)) return json({ error: "Invalid role" }, 400);

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) return json({ error: createError.message }, 400);

      const { error: insertError } = await adminClient
        .from("members")
        .insert({ email, role });
      if (insertError) {
        await adminClient.auth.admin.deleteUser(created.user!.id);
        return json({ error: insertError.message }, 400);
      }

      return json({ success: true, action: "create", email, role });
    }

    if (action === "reset_password") {
      if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

      // Find the user by email
      const { data: list, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) return json({ error: listError.message }, 500);
      const target = list.users.find((u: any) => u.email?.toLowerCase() === email);
      if (!target) return json({ error: "User not found in auth" }, 404);

      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        target.id,
        { password }
      );
      if (updateError) return json({ error: updateError.message }, 400);

      return json({ success: true, action: "reset_password", email });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
