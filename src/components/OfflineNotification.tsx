interface OfflineNotificationProps {
  isOnline: boolean;
}

export const OfflineNotification = ({ isOnline }: OfflineNotificationProps) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center text-sm z-50">
      You're offline. Some features may not work properly.
    </div>
  );
};