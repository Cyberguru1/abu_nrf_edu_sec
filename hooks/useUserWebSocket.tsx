import { useState, useEffect, useRef, useCallback } from 'react';

export interface ExitConfirmationData {
  pending_id: string;
  token: string;
  message: string;
  plateNumber?: string;
  vehicleName?: string;
}

export interface WebSocketMessage {
  type: 'exit_confirmation' | 'security_alert' | 'response' | 'connection_ack' | 'pong';
  pending_id?: string;
  token?: string;
  message?: string;
  confirmed?: boolean;
  plateNumber?: string;
  vehicleName?: string;
}

export const useUserWebSocket = (url: string, token: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [exitConfirmation, setExitConfirmation] = useState<ExitConfirmationData | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification_sound.mp3');
      audio.play().catch(error => console.error("Audio play failed:", error));
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  }, []);

  const startPingInterval = useCallback(() => {
    // Clear any existing interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    // Send ping every 30 seconds
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
          console.log('🏓 Ping sent');
        } catch (error) {
          console.error('Failed to send ping:', error);
        }
      }
    }, 30000);
  }, []);

  const stopPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!token) {
      console.log('No token available for WebSocket connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const wsUrl = `${url}?token=${token}`;
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        startPingInterval();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          
          // Handle different message types
          switch (message.type) {
            case 'connection_ack':
              console.log('✅ Connection acknowledged by server');
              break;

            case 'pong':
              console.log('🏓 Pong received');
              break;

            case 'exit_confirmation':
              console.log('🚗 Exit confirmation request received');
              setExitConfirmation({
                pending_id: message.pending_id || '',
                token: message.token || '',
                message: message.message || 'Are you the one leaving the premises?',
                plateNumber: message.plateNumber,
                vehicleName: message.vehicleName,
              });
              playNotificationSound();
              break;

            case 'security_alert':
              console.log('🚨 Security alert received');
              if (message.message) {
                setSecurityAlerts(prev => [...prev, message.message!]);
              }
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        stopPingInterval();
        
        // Auto-reconnect if not a clean close and haven't exceeded max attempts
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts && token) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`⏳ Scheduling reconnection attempt ${reconnectAttemptsRef.current} in ${delay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          setConnectionStatus('error');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('⚠️ WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, token, startPingInterval, stopPingInterval, playNotificationSound]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopPingInterval();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, [stopPingInterval]);

  const sendResponse = useCallback((pendingId: string, token: string, confirmed: boolean): boolean => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket is not connected');
      return false;
    }

    try {
      const response: WebSocketMessage = {
        type: 'response',
        pending_id: pendingId,
        token: token,
        confirmed: confirmed,
      };
      
      wsRef.current.send(JSON.stringify(response));
      console.log('✉️ Response sent:', response);
      return true;
    } catch (error) {
      console.error('Failed to send response:', error);
      return false;
    }
  }, []);

  const clearExitConfirmation = useCallback(() => {
    setExitConfirmation(null);
  }, []);

  const clearSecurityAlert = useCallback((index: number) => {
    setSecurityAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Connect when token is available
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token]); // Only reconnect when token changes

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    disconnect();
    setTimeout(() => {
      reconnectAttemptsRef.current = 0;
      connect();
    }, 100);
  }, [disconnect, connect]);

  return {
    isConnected,
    connectionStatus,
    exitConfirmation,
    securityAlerts,
    sendResponse,
    clearExitConfirmation,
    clearSecurityAlert,
    connect,
    disconnect,
    reconnect,
  };
};