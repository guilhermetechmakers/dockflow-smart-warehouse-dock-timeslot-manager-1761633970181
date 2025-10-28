import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GateWebSocket, offlineStorage } from '@/api/gate';
import type { OfflineEvent } from '@/types/gate';

interface UseGateRealTimeOptions {
  visitId?: string;
  onStatusUpdate?: (data: any) => void;
  onRampAssignment?: (data: any) => void;
  onNoteAdded?: (data: any) => void;
  onFileUploaded?: (data: any) => void;
}

export function useGateRealTime({
  visitId,
  onStatusUpdate,
  onRampAssignment,
  onNoteAdded,
  onFileUploaded,
}: UseGateRealTimeOptions = {}) {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wsConnection, setWsConnection] = useState<GateWebSocket | null>(null);
  const [isReconnecting] = useState(false);
  const syncIntervalRef = useRef<number | null>(null);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // WebSocket connection management
  useEffect(() => {
    if (isOnline && !wsConnection) {
      const ws = new GateWebSocket((data) => {
        console.log('WebSocket message received:', data);
        
        switch (data.type) {
          case 'status_update':
            if (visitId && data.visit_id === visitId) {
              onStatusUpdate?.(data);
              queryClient.invalidateQueries({ queryKey: ['gate-checkin', visitId] });
            }
            break;
            
          case 'ramp_assignment':
            if (visitId && data.visit_id === visitId) {
              onRampAssignment?.(data);
              queryClient.invalidateQueries({ queryKey: ['gate-checkin', visitId] });
            }
            break;
            
          case 'note_added':
            if (visitId && data.visit_id === visitId) {
              onNoteAdded?.(data);
              queryClient.invalidateQueries({ queryKey: ['gate-timeline', visitId] });
            }
            break;
            
          case 'file_uploaded':
            if (visitId && data.visit_id === visitId) {
              onFileUploaded?.(data);
              queryClient.invalidateQueries({ queryKey: ['gate-files', visitId] });
            }
            break;
            
          case 'visit_updated':
            if (visitId && data.visit_id === visitId) {
              queryClient.invalidateQueries({ queryKey: ['gate-checkin', visitId] });
            }
            break;
        }
      });

      ws.connect();
      setWsConnection(ws);
    } else if (!isOnline && wsConnection) {
      wsConnection.disconnect();
      setWsConnection(null);
    }

    return () => {
      if (wsConnection) {
        wsConnection.disconnect();
      }
    };
  }, [isOnline, visitId, onStatusUpdate, onRampAssignment, onNoteAdded, onFileUploaded, queryClient]);

  // Offline sync management
  useEffect(() => {
    if (isOnline) {
      // Start periodic sync of offline events
      syncIntervalRef.current = setInterval(() => {
        syncOfflineEvents();
      }, 30000); // Sync every 30 seconds

      // Initial sync
      syncOfflineEvents();
    } else {
      // Clear sync interval when offline
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline]);

  // Sync offline events when coming back online
  const syncOfflineEvents = useCallback(async () => {
    if (!isOnline) return;

    try {
      const pendingEvents = offlineStorage.getPendingEvents();
      if (pendingEvents.length === 0) return;

      console.log(`Syncing ${pendingEvents.length} offline events...`);
      
      // Process events in batches
      const batchSize = 10;
      for (let i = 0; i < pendingEvents.length; i += batchSize) {
        const batch = pendingEvents.slice(i, i + batchSize);
        
        try {
          // In a real app, this would call the API
          // await gateApi.syncOfflineEvents(batch);
          
          // Mock successful sync
          console.log(`Synced batch of ${batch.length} events`);
          
          // Mark events as completed
          const eventIds = batch.map(event => event.id);
          offlineStorage.removeCompletedEvents(eventIds);
          
          toast.success(`Synced ${batch.length} offline events`);
        } catch (error) {
          console.error('Failed to sync batch:', error);
          
          // Increment retry count for failed events
          batch.forEach(event => {
            offlineStorage.incrementRetryCount(event.id);
          });
        }
      }
    } catch (error) {
      console.error('Failed to sync offline events:', error);
    }
  }, [isOnline]);

  // Store event for offline processing
  const storeOfflineEvent = useCallback((eventType: string, data: any) => {
    const offlineEvent: Omit<OfflineEvent, 'id' | 'timestamp' | 'retry_count' | 'status'> = {
      event_type: eventType,
      data,
      max_retries: 3,
    };

    offlineStorage.storeEvent(offlineEvent);
    
    if (isOnline) {
      // Try to process immediately if online
      syncOfflineEvents();
    } else {
      toast.info('Event queued for offline processing');
    }
  }, [isOnline, syncOfflineEvents]);

  // Send real-time message
  const sendMessage = useCallback((message: any) => {
    if (wsConnection && isOnline) {
      wsConnection.send(message);
    } else {
      // Store for offline processing
      storeOfflineEvent('message', message);
    }
  }, [wsConnection, isOnline, storeOfflineEvent]);

  // Get offline event count
  const getOfflineEventCount = useCallback(() => {
    return offlineStorage.getPendingEvents().length + offlineStorage.getFailedEvents().length;
  }, []);

  // Clear all offline events
  const clearOfflineEvents = useCallback(() => {
    offlineStorage.clearAllEvents();
    toast.success('Offline events cleared');
  }, []);

  // Retry failed events
  const retryFailedEvents = useCallback(async () => {
    const failedEvents = offlineStorage.getFailedEvents();
    if (failedEvents.length === 0) {
      toast.info('No failed events to retry');
      return;
    }

    // Reset status to pending for retry
    failedEvents.forEach(event => {
      offlineStorage.updateEventStatus(event.id, 'pending');
    });

    await syncOfflineEvents();
  }, [syncOfflineEvents]);

  return {
    isOnline,
    isReconnecting,
    sendMessage,
    storeOfflineEvent,
    syncOfflineEvents,
    getOfflineEventCount,
    clearOfflineEvents,
    retryFailedEvents,
  };
}