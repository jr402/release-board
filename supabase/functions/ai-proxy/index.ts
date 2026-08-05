// Supabase Edge Function: ai-proxy
//
// Proxies AI requests (Anthropic Claude, OpenAI ChatGPT) so the API keys
// stay server-side and are never exposed to the browser.
//
// Deploy: paste this file into Supabase Dashboard → Edge Functions → New function
// (name it exactly "ai-proxy"). Then set the API key env vars:
//   - Edge Functions → Secrets → add ANTHROPIC_API_KEY
//   - Edge Functions → Secrets → add OPENAI_API_KEY
// (Supabase auto-injects SUPABASE_URL and SUPABASE_ANON_KEY.)
//
// IMPORTANT: disable "Verify JWT" on this function in Supabase Dashboard
// (we do our own JWT check below).

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
    // 1) Auth check — caller must be a logged-in member
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user?.email) return json({ error: "Invalid session" }, 401);

    // 2) Membership check (any role can use AI)
    const { data: member, error: memberError } = await callerClient
      .from("members")
      .select("role")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();
    if (memberError) return json({ error: memberError.message }, 500);
    if (!member)      return json({ error: "Not a member" }, 403);

    // 3) Read input
    const body = await req.json().catch(() => ({}));
    const provider = body.provider;            // "anthropic" | "openai"
    const model    = body.model || "";
    const prompt   = body.prompt || "";
    const imageDataUrl = body.image || null;   // optional data:... URL
    const maxTokens = Math.min(body.maxTokens || 200, 1024);

    if (!prompt) return json({ error: "Missing prompt" }, 400);

    // 4) Route to the right provider
    if (provider === "anthropic") {
      const key = Deno.env.get("ANTHROPIC_API_KEY");
      if (!key) return json({ error: "ANTHROPIC_API_KEY not configured on server" }, 500);
      const content: unknown[] = [];
      if (imageDataUrl) {
        const m = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (m) {
          content.push({
            type: "image",
            source: { type: "base64", media_type: m[1], data: m[2] },
          });
        }
      }
      content.push({ type: "text", text: prompt });

      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-haiku-4-5",
          max_tokens: maxTokens,
          messages: [{ role: "user", content }],
        }),
      });
      const text = await r.text();
      if (!r.ok) return json({ error: `Claude (${r.status}): ${text}` }, r.status);
      const data = JSON.parse(text);
      return json({ text: data.content?.[0]?.text || "" });
    }

    if (provider === "openai") {
      const key = Deno.env.get("OPENAI_API_KEY");
      if (!key) return json({ error: "OPENAI_API_KEY not configured on server" }, 500);
      const content: unknown[] = [{ type: "text", text: prompt }];
      if (imageDataUrl) content.push({ type: "image_url", image_url: { url: imageDataUrl } });

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          max_tokens: maxTokens,
          messages: [{ role: "user", content }],
        }),
      });
      const text = await r.text();
      if (!r.ok) return json({ error: `OpenAI (${r.status}): ${text}` }, r.status);
      const data = JSON.parse(text);
      return json({ text: data.choices?.[0]?.message?.content || "" });
    }

    return json({ error: "Unknown provider — use 'anthropic' or 'openai'" }, 400);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
