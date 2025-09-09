import { useState, useEffect } from 'react';

export const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    const updateConnectionType = () => {
      // @ts-ignore - connection is experimental
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectionType);
      updateConnectionType();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  return { isOnline, connectionType };
};

export const useOfflineSync = () => {
  const { isOnline } = useNetwork();
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  const addPendingAction = (action: any) => {
    if (!isOnline) {
      setPendingActions(prev => [...prev, action]);
      localStorage.setItem('pendingActions', JSON.stringify([...pendingActions, action]));
    }
  };

  const syncPendingActions = async () => {
    if (isOnline && pendingActions.length > 0) {
      try {
        // Process pending actions
        for (const action of pendingActions) {
          // Execute the action
          await action.execute();
        }
        setPendingActions([]);
        localStorage.removeItem('pendingActions');
      } catch (error) {
        console.error('Failed to sync pending actions:', error);
      }
    }
  };

  useEffect(() => {
    // Load pending actions from localStorage on mount
    const stored = localStorage.getItem('pendingActions');
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline]);

  return { addPendingAction, pendingActions: pendingActions.length };
};