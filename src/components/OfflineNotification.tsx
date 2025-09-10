interface OfflineNotificationProps {
  isOnline: boolean;
}

export const OfflineNotification = ({ isOnline }: OfflineNotificationProps) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-3 text-center text-sm z-50 shadow-lg border-b border-destructive/20">
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 bg-destructive-foreground rounded-full animate-pulse" />
        You're offline. Some features may not work properly.
      </div>
    </div>
  );
};