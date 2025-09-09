-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- Price in cents
  stripe_price_id TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the subscription plans
INSERT INTO public.subscription_plans (plan_id, name, description, price_monthly, stripe_price_id, features, limits) VALUES
('personal_pro', 'Personal Pro', 'Perfect for individual professionals', 9900, 'price_personal_pro', 
 '{"oracle_queries": true, "contact_management": true, "gmail_integration": true, "calendar_sync": true}',
 '{"oracle_queries_monthly": 100, "contacts_limit": 500, "users": 1}'),
('business', 'Business', 'Ideal for growing teams', 29900, 'price_business',
 '{"oracle_queries": true, "contact_management": true, "gmail_integration": true, "calendar_sync": true, "linkedin_integration": true, "team_features": true, "advanced_analytics": true}',
 '{"oracle_queries_monthly": -1, "contacts_limit": -1, "users": 5}'),
('enterprise', 'Enterprise', 'For large organizations', 59900, 'price_enterprise',
 '{"oracle_queries": true, "contact_management": true, "gmail_integration": true, "calendar_sync": true, "linkedin_integration": true, "team_features": true, "advanced_analytics": true, "custom_integrations": true, "dedicated_support": true, "priority_support": true}',
 '{"oracle_queries_monthly": -1, "contacts_limit": -1, "users": -1}');

-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  plan_id TEXT REFERENCES public.subscription_plans(plan_id),
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  trial_end TIMESTAMP WITH TIME ZONE,
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  is_trial BOOLEAN DEFAULT false,
  trial_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'oracle_query', 'contact', 'team_member'
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing events table for audit trail
CREATE TABLE public.billing_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'subscription_created', 'payment_succeeded', 'payment_failed', 'trial_started', etc.
  stripe_event_id TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Plans are viewable by everyone" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for subscribers
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage" 
ON public.usage_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for billing_events
CREATE POLICY "Users can view their own billing events" 
ON public.billing_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert billing events" 
ON public.billing_events 
FOR INSERT 
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_stripe_customer_id ON public.subscribers(stripe_customer_id);
CREATE INDEX idx_usage_tracking_user_date ON public.usage_tracking(user_id, usage_date);
CREATE INDEX idx_billing_events_user_id ON public.billing_events(user_id);

-- Create view for current month usage
CREATE VIEW public.current_month_usage AS
SELECT 
  user_id,
  resource_type,
  SUM(usage_count) as total_usage,
  DATE_TRUNC('month', CURRENT_DATE) as month_start
FROM public.usage_tracking 
WHERE usage_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id, resource_type;