-- Insert sample subscription plans if they don't exist
INSERT INTO public.subscription_plans (plan_id, name, description, price_monthly, stripe_price_id, features, limits, is_active) 
VALUES 
  ('personal_pro', 'Personal Pro', 'Perfect for individual professionals', 997, 'price_personal_pro_test', 
   '{"gmail_integration": true, "calendar_integration": true, "relationship_scoring": true, "analytics": true, "mobile_access": true}'::jsonb,
   '{"oracle_queries": 100, "contacts": 500, "team_members": 1}'::jsonb, true),
  ('business', 'Business', 'Ideal for growing teams', 2997, 'price_business_test',
   '{"gmail_integration": true, "calendar_integration": true, "relationship_scoring": true, "analytics": true, "mobile_access": true, "linkedin_integration": true, "team_collaboration": true, "priority_support": true}'::jsonb,
   '{"oracle_queries": -1, "contacts": -1, "team_members": 5}'::jsonb, true),
  ('enterprise', 'Enterprise', 'For large organizations', 9997, 'price_enterprise_test',
   '{"gmail_integration": true, "calendar_integration": true, "relationship_scoring": true, "analytics": true, "mobile_access": true, "linkedin_integration": true, "team_collaboration": true, "priority_support": true, "custom_integrations": true, "dedicated_manager": true}'::jsonb,
   '{"oracle_queries": -1, "contacts": -1, "team_members": -1}'::jsonb, true)
ON CONFLICT (plan_id) DO UPDATE SET
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  updated_at = now();