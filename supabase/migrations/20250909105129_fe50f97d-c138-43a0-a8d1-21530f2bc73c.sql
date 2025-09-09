-- Create AI settings table for user AI mode preferences
CREATE TABLE public.user_ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  ai_mode TEXT NOT NULL DEFAULT 'platform' CHECK (ai_mode IN ('platform', 'user')),
  openai_api_key_encrypted TEXT,
  monthly_platform_usage INTEGER DEFAULT 0,
  monthly_platform_limit INTEGER DEFAULT 100,
  usage_reset_date DATE DEFAULT CURRENT_DATE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_ai_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI settings" 
ON public.user_ai_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI settings" 
ON public.user_ai_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings" 
ON public.user_ai_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_ai_settings_updated_at
BEFORE UPDATE ON public.user_ai_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create AI usage tracking table
CREATE TABLE public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ai_mode TEXT NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  request_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for usage logs
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for usage logs
CREATE POLICY "Users can view their own AI usage logs" 
ON public.ai_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage logs" 
ON public.ai_usage_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_ai_settings_user_id ON public.user_ai_settings(user_id);
CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_logs_user_month ON public.ai_usage_logs(user_id, date_trunc('month', created_at));