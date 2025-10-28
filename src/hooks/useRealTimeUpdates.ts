import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToRealTimeUpdates } from '@/api/dashboard';
import { dashboardKeys } from './useDashboard';
import type { RealTimeUpdate } from '@/types/dashboard';

interface UseRealTimeUpdatesProps {
  warehouseId: string;
  enabled?: boolean;
  onUpdate?: (update: RealTimeUpdate) => void;
}

export function useRealTimeUpdates({ 
  warehouseId, 
  enabled = true, 
  onUpdate 
}: UseRealTimeUpdatesProps) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const connect = useCallback(() => {
    if (!enabled || !warehouseId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = subscribeToRealTimeUpdates(warehouseId, (update) => {
        // Call custom handler if provided
        onUpdate?.(update);

        // Update React Query cache based on update type
        switch (update.type) {
          case 'booking_update':
            // Invalidate bookings queries
            queryClient.invalidateQueries({ 
              queryKey: dashboardKeys.bookings({ warehouse_id: warehouseId, date_range: { start: '', end: '' } })
            });
            break;
            
          case 'dock_status_change':
            // Invalidate dock status queries
            queryClient.invalidateQueries({ 
              queryKey: dashboardKeys.dockStatuses(warehouseId)
            });
            break;
            
          case 'notification':
            // Invalidate notifications queries
            queryClient.invalidateQueries({ 
              queryKey: dashboardKeys.notifications(warehouseId)
            });
            break;
            
          case 'kpi_update':
            // Invalidate KPI queries
            queryClient.invalidateQueries({ 
              queryKey: dashboardKeys.kpis(warehouseId, { start: '', end: '' })
            });
            break;
        }

        // Reset reconnect attempts on successful update
        reconnectAttempts.current = 0;
      });

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && enabled && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [warehouseId, enabled, onUpdate, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounted');
      wsRef.current = null;
    }

    reconnectAttempts.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (enabled && warehouseId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, warehouseId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect,
    disconnect
  };
}