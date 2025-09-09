import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SeedDemoData = () => {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('seed-demo-data');
      
      if (error) throw error;

      setSeeded(true);
      toast({
        title: "Demo data seeded successfully!",
        description: `Added ${data.data.contacts} contacts, ${data.data.interactions} interactions, and ${data.data.tasks} tasks.`,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to seed demo data';
      setError(errorMessage);
      toast({
        title: "Error seeding demo data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (seeded) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Demo Data Ready
          </CardTitle>
          <CardDescription>
            Your account now has sample contacts, interactions, and tasks to explore the platform.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Seed Demo Data
        </CardTitle>
        <CardDescription>
          Add sample contacts, interactions, and tasks to test the platform features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          This will add:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>5 sample business contacts</li>
            <li>Recent interaction history</li>
            <li>Sample tasks and follow-ups</li>
            <li>Gamification progress</li>
          </ul>
        </div>

        <Button 
          onClick={handleSeedData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Data...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Add Demo Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};