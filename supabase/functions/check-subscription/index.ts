import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_KEY");
    if (!stripeKey) throw new Error("STRIPE_KEY is not set");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabase.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: null,
        plan_id: null,
        subscription_status: 'inactive',
        is_trial: false,
        subscription_start: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan_id: null,
        subscription_status: 'inactive',
        is_trial: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    let subscriptionData = {
      subscribed: false,
      plan_id: null,
      subscription_status: 'inactive',
      is_trial: false,
      trial_end: null,
      subscription_start: null,
      subscription_end: null,
    };

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const isActive = ['active', 'trialing'].includes(subscription.status);
      
      logStep("Subscription found", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        isActive 
      });

      // Get plan info from subscription
      const priceId = subscription.items.data[0].price.id;
      const amount = subscription.items.data[0].price.unit_amount || 0;
      
      let planId = 'personal_pro'; // default
      if (amount === 29900) planId = 'business';
      else if (amount === 59900) planId = 'enterprise';

      subscriptionData = {
        subscribed: isActive,
        plan_id: planId,
        subscription_status: subscription.status,
        is_trial: subscription.status === 'trialing',
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      };

      // Mark trial as used if subscription exists
      if (subscription.status === 'trialing' || subscription.trial_end) {
        subscriptionData.trial_used = true;
      }
    }

    // Update subscriber record
    await supabase.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      plan_id: subscriptionData.plan_id,
      stripe_subscription_id: subscriptions.data[0]?.id || null,
      subscription_status: subscriptionData.subscription_status,
      is_trial: subscriptionData.is_trial,
      trial_end: subscriptionData.trial_end,
      subscription_start: subscriptionData.subscription_start,
      subscription_end: subscriptionData.subscription_end,
      trial_used: subscriptionData.trial_used || false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", subscriptionData);

    return new Response(JSON.stringify(subscriptionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-subscription function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});