import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  Clock,
  Zap,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  variant: 'default' | 'outline' | 'secondary';
  shortcut?: string;
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'add-contact',
      label: 'Add Contact',
      icon: Plus,
      action: () => navigate('/contacts?action=add'),
      variant: 'default',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      icon: Calendar,
      action: () => navigate('/meeting-prep?action=schedule'),
      variant: 'outline'
    },
    {
      id: 'quick-note',
      label: 'Quick Note',
      icon: FileText,
      action: () => {
        // Could open a modal for quick note taking
        navigate('/contacts?action=note');
      },
      variant: 'outline'
    },
    {
      id: 'start-timer',
      label: 'Start Timer',
      icon: Clock,
      action: () => navigate('/time-tracking?action=start'),
      variant: 'secondary'
    },
    {
      id: 'automation',
      label: 'Set Automation',
      icon: Zap,
      action: () => navigate('/follow-up-automation?action=create'),
      variant: 'outline'
    },
    {
      id: 'team-update',
      label: 'Team Update',
      icon: Users,
      action: () => navigate('/team-sharing?action=update'),
      variant: 'outline'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                className={`flex flex-col items-center gap-2 h-auto py-3 hover-scale animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{action.label}</span>
                {action.shortcut && (
                  <span className="text-xs text-muted-foreground opacity-70">
                    {action.shortcut}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};