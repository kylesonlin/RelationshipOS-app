import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Badge } from './badge';
import { Wifi, WifiOff } from 'lucide-react';

export const ConnectionStatus = ({ className }: { className?: string }) => {
  const isOnline = useOnlineStatus();

  return (
    <Badge 
      variant={isOnline ? "secondary" : "destructive"} 
      className={className}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </>
      )}
    </Badge>
  );
};