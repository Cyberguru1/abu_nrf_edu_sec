// hooks/useWebSocket.ts
import { useEffect, useCallback, useState } from 'react';
import { webSocketService, WebSocketMessage } from '@/services/websocketService';

export const useWebSocket = (onExitConfirmation?: (message: WebSocketMessage) => void) => {
  const [isConnected, setIsConnected] = useState(webSocketService.getConnectionStatus());

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      webSocketService.connect(token);
    }

    const unsubscribeConnection = webSocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    const unsubscribeMessage = webSocketService.onMessage((message) => {
      console.log('WebSocket message in hook:', message); // Debug log
      if (message.type === 'exit_confirmation' && onExitConfirmation) {
        onExitConfirmation(message); // Call the provided callback
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      webSocketService.disconnect();
    };
  }, [onExitConfirmation]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    return webSocketService.sendMessage(message);
  }, []);

  return {
    isConnected,
    sendMessage,
    onMessage: webSocketService.onMessage.bind(webSocketService),
  };
};