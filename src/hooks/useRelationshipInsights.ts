import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RelationshipInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_data: Record<string, any>;
  contact_id?: string;
  expires_at?: string;
  created_at: string;
}

export const useRelationshipInsights = () => {
  const [insights, setInsights] = useState<RelationshipInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active insights ordered by priority and creation date
      const { data, error: fetchError } = await supabase
        .from('relationship_insights')
        .select('*')
        .eq('is_dismissed', false)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
        .order('priority', { ascending: false }) // high, medium, low
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw fetchError;
      }

      setInsights((data || []).map(item => ({
        ...item,
        priority: item.priority as 'high' | 'medium' | 'low',
        action_data: item.action_data as Record<string, any>
      })));
    } catch (err: any) {
      console.error('Error fetching relationship insights:', err);
      setError(err.message || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('relationship_insights')
        .update({ is_dismissed: true })
        .eq('id', insightId);

      if (error) {
        throw error;
      }

      // Remove from local state
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (err: any) {
      console.error('Error dismissing insight:', err);
    }
  };

  const generateNewInsights = async () => {
    try {
      setLoading(true);
      
      // Call the generate-insights edge function
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {}
      });

      if (error) {
        throw error;
      }

      // Refresh insights after generation
      await fetchInsights();
      
      return data;
    } catch (err: any) {
      console.error('Error generating insights:', err);
      setError(err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const syncCalendarData = async () => {
    try {
      setLoading(true);
      
      // Call the calendar-sync edge function
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: {}
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Error syncing calendar:', err);
      setError(err.message || 'Failed to sync calendar');
    } finally {
      setLoading(false);
    }
  };

  const syncGmailData = async () => {
    try {
      setLoading(true);
      
      // Call the gmail-sync edge function
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: {}
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Error syncing Gmail:', err);
      setError(err.message || 'Failed to sync Gmail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    fetchInsights,
    dismissInsight,
    generateNewInsights,
    syncCalendarData,
    syncGmailData,
  };
};