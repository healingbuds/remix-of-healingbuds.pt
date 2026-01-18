import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DRGREEN_API_URL = "https://api.drgreennft.com/api/v1";

// Sign payload using the private key
async function signPayload(payload: string, privateKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + privateKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return base64Encode(hashBuffer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Signing error:", error);
    throw new Error(`Failed to sign payload: ${message}`);
  }
}

// Make authenticated request to Dr Green API
async function drGreenRequest(
  endpoint: string,
  method: string,
  body?: object
): Promise<Response> {
  const apiKey = Deno.env.get("DRGREEN_API_KEY");
  const privateKey = Deno.env.get("DRGREEN_PRIVATE_KEY");
  
  if (!apiKey || !privateKey) {
    throw new Error("Dr Green API credentials not configured");
  }
  
  const payload = body ? JSON.stringify(body) : "";
  const signature = await signPayload(payload, privateKey);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-apikey": apiKey,
    "x-auth-signature": signature,
  };
  
  const url = `${DRGREEN_API_URL}${endpoint}`;
  console.log(`Dr Green API request: ${method} ${url}`);
  
  const response = await fetch(url, {
    method,
    headers,
    body: payload || undefined,
  });
  
  return response;
}

// Actions that require authentication and ownership verification
const PROTECTED_ACTIONS = [
  'create-client',
  'get-client',
  'update-client',
  'create-cart',
  'update-cart',
  'get-cart',
  'create-order',
  'get-order',
  'update-order',
  'get-orders',
  'create-payment',
  'get-payment',
];

// Actions that are public (read-only catalog data)
const PUBLIC_ACTIONS = [
  'get-strains',
  'get-all-strains',
  'get-strain',
];

// Verify user owns the drgreen_client record
async function verifyClientOwnership(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  clientId: string
): Promise<{ valid: boolean; error?: string }> {
  const { data, error } = await supabaseClient
    .from('drgreen_clients')
    .select('user_id, drgreen_client_id')
    .eq('drgreen_client_id', clientId)
    .single();

  if (error || !data) {
    console.error("Client lookup error:", error);
    return { valid: false, error: 'Client not found' };
  }

  const clientRecord = data as { user_id: string; drgreen_client_id: string };

  if (clientRecord.user_id !== userId) {
    console.warn(`Ownership verification failed: user ${userId} tried to access client owned by ${clientRecord.user_id}`);
    return { valid: false, error: 'Forbidden: You do not own this resource' };
  }

  return { valid: true };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Remove "drgreen-proxy" from path
    const apiPath = pathParts.slice(1).join("/");
    
    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        body = await req.json();
      } catch {
        body = undefined;
      }
    }
    
    // Route handling
    const action = body?.action || apiPath;
    
    console.log(`Processing action: ${action}`, { method: req.method });
    
    // Check if action requires authentication
    const requiresAuth = PROTECTED_ACTIONS.includes(action);
    const isPublic = PUBLIC_ACTIONS.includes(action);
    
    if (!requiresAuth && !isPublic) {
      return new Response(
        JSON.stringify({ error: "Unknown action", action }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let userId: string | null = null;
    let supabaseClient: ReturnType<typeof createClient> | null = null;
    
    // Authenticate protected actions
    if (requiresAuth) {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        console.warn("Missing authorization header for protected action:", action);
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create Supabase client with user's auth token
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      // Verify the user's JWT
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        console.warn("Authentication failed:", authError?.message);
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid authentication token' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      userId = user.id;
      console.log(`Authenticated user: ${userId} for action: ${action}`);
      
      // Verify ownership for actions that access client resources
      const actionsRequiringClientOwnership = [
        'get-client', 'update-client', 
        'get-orders', 'create-order',
        'get-cart', 'update-cart', 'create-cart',
      ];
      
      if (actionsRequiringClientOwnership.includes(action)) {
        const clientId = body?.clientId || body?.data?.clientId;
        
        if (clientId) {
          const ownership = await verifyClientOwnership(supabaseClient, userId, clientId);
          
          if (!ownership.valid) {
            console.warn(`Ownership check failed for user ${userId} on client ${clientId}`);
            return new Response(
              JSON.stringify({ error: ownership.error }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
      
      // For create-client, ensure user doesn't already have a client record
      if (action === 'create-client') {
        const { data: existingClient } = await supabaseClient
          .from('drgreen_clients')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        if (existingClient) {
          return new Response(
            JSON.stringify({ error: 'Client record already exists for this user' }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }
    
    let response: Response;
    
    switch (action) {
      // Client operations (protected)
      case "create-client": {
        response = await drGreenRequest("/clients", "POST", body.data);
        break;
      }
      
      case "get-client": {
        response = await drGreenRequest(`/clients/${body.clientId}`, "GET");
        break;
      }
      
      case "update-client": {
        response = await drGreenRequest(`/clients/${body.clientId}`, "PUT", body.data);
        break;
      }
      
      // Strain/Product operations (public)
      case "get-strains": {
        const countryCode = body?.countryCode || "PRT";
        console.log(`Fetching strains for country: ${countryCode}`);
        response = await drGreenRequest(`/strains?countryCode=${countryCode}`, "GET");
        break;
      }
      
      case "get-all-strains": {
        console.log("Fetching all strains (no country filter)");
        response = await drGreenRequest("/strains", "GET");
        break;
      }
      
      case "get-strain": {
        response = await drGreenRequest(`/strains/${body.strainId}`, "GET");
        break;
      }
      
      // Cart operations (protected)
      case "create-cart": {
        response = await drGreenRequest("/carts", "POST", body.data);
        break;
      }
      
      case "update-cart": {
        response = await drGreenRequest(`/carts/${body.cartId}`, "PUT", body.data);
        break;
      }
      
      case "get-cart": {
        response = await drGreenRequest(`/carts/${body.cartId}`, "GET");
        break;
      }
      
      // Order operations (protected)
      case "create-order": {
        // Server-side eligibility check before creating order
        if (supabaseClient && body?.clientId) {
          const { data: clientData, error: clientError } = await supabaseClient
            .from('drgreen_clients')
            .select('is_kyc_verified, admin_approval')
            .eq('drgreen_client_id', body.clientId)
            .single();
          
          if (clientError || !clientData) {
            return new Response(
              JSON.stringify({ error: 'Client verification failed' }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          const client = clientData as { is_kyc_verified: boolean | null; admin_approval: string | null };
          
          if (!client.is_kyc_verified || client.admin_approval !== 'VERIFIED') {
            console.warn(`Order blocked: Client ${body.clientId} not verified (KYC: ${client.is_kyc_verified}, Approval: ${client.admin_approval})`);
            return new Response(
              JSON.stringify({ error: 'Medical verification required before placing orders' }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        response = await drGreenRequest("/orders", "POST", body.data);
        break;
      }
      
      case "get-order": {
        response = await drGreenRequest(`/orders/${body.orderId}`, "GET");
        break;
      }
      
      case "update-order": {
        response = await drGreenRequest(`/orders/${body.orderId}`, "PATCH", body.data);
        break;
      }
      
      case "get-orders": {
        response = await drGreenRequest(`/orders?clientId=${body.clientId}`, "GET");
        break;
      }
      
      // Payment operations (protected)
      case "create-payment": {
        response = await drGreenRequest("/payments", "POST", body.data);
        break;
      }
      
      case "get-payment": {
        response = await drGreenRequest(`/payments/${body.paymentId}`, "GET");
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action", action }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    const data = await response.json();
    console.log(`Dr Green API response status: ${response.status}`);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Dr Green proxy error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
