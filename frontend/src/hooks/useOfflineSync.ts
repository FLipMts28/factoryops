import { useEffect } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { indexedDBService } from '../services/indexedDB';
import { annotationsApi } from '../services/api';

export const useOfflineSync = () => {
  const { isOnline, setOnlineStatus, setPendingSyncCount, decrementPendingSync } = useOfflineStore();

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      console.log('🌐 Back online - syncing data...');
      syncOfflineData();
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      console.log('📡 Offline mode activated');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize IndexedDB
    indexedDBService.init();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    if (!isOnline) return;

    try {
      const pendingItems = await indexedDBService.getPendingSync();
      setPendingSyncCount(pendingItems.length);

      for (const item of pendingItems) {
        try {
          if (item.type === 'annotation') {
            if (item.action === 'create') {
              await annotationsApi.create(item.data);
            } else if (item.action === 'update') {
              await annotationsApi.update(item.data.id, item.data);
            } else if (item.action === 'delete') {
              await annotationsApi.delete(item.data.id);
            }
          }

          // Remove from pending sync after successful sync
          await indexedDBService.removePendingSync(item.id);
          decrementPendingSync();
        } catch (error) {
          console.error('Failed to sync item:', error);
        }
      }

      console.log('✅ Offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  return { syncOfflineData };
};