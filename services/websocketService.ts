import { env } from '../config/config';

// services/websocketService.ts
export interface WebSocketMessage {
  type: 'exit_confirmation' | 'security_alert' | 'response';
  pending_id?: string;
  token?: string;
  message?: string;
  confirmed?: boolean;
  plateNumber?: string; 
  vehicleName?: string; 
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Increased attempts
  private reconnectInterval = 5000; // 5 seconds as requested
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentToken: string | null = null;
  private shouldReconnect = false; // Flag to control reconnection

  constructor(private baseUrl: string = env.WS_URL) {}

  private notifyConnectionStatus() {
    this.connectionHandlers.forEach(handler => handler(this.isConnected));
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    // Immediately notify current status
    handler(this.isConnected);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  connect(token: string) {
    // Clear any existing reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // If already connected with the same token, don't reconnect
    if (this.isConnected && this.currentToken === token) {
      console.log('WebSocket already connected with same token');
      return;
    }

    // Disconnect existing connection if any
    if (this.ws) {
      this.shouldReconnect = false; // Prevent auto-reconnect during manual reconnect
      this.ws.close();
      this.ws = null;
    }

    this.currentToken = token;
    this.shouldReconnect = true;
    this.attemptConnection();
  }

  private attemptConnection() {
    if (!this.currentToken || !this.shouldReconnect) {
      console.log('No token or reconnection disabled');
      return;
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('token', this.currentToken);
      const wsUrl = url.toString();

      console.log(`WebSocket connection attempt ${this.reconnectAttempts + 1}:`, wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = (error) => this.handleError(error);

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private handleOpen() {
    console.log('WebSocket connected successfully');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Clear any pending reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.notifyConnectionStatus();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('WebSocket message received:', {
        type: data.type,
        pending_id: data.pending_id,
        token: data.token,
        message: data.message,
        confirmed: data.confirmed,
        plateNumber: data.plateNumber,
        vehicleName: data.vehicleName,
      }); 
      
      // Notify all message handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.isConnected = false;
    this.ws = null;
    this.notifyConnectionStatus();
    
    // Only attempt reconnect if it wasn't a clean close and we should reconnect
    if (!event.wasClean && this.shouldReconnect && this.currentToken) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.shouldReconnect = false;
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${this.reconnectInterval}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.attemptConnection();
    }, this.reconnectInterval);
  }

  sendMessage(message: WebSocketMessage): boolean {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected or ready');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  disconnect() {
    console.log('Disconnecting WebSocket');
    this.shouldReconnect = false;
    this.currentToken = null;
    
    // Clear reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
    }
    
    this.isConnected = false;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.notifyConnectionStatus();
  }

  onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Method to manually trigger reconnection
  reconnect() {
    if (this.currentToken) {
      console.log('Manual reconnection triggered');
      this.reconnectAttempts = 0;
      this.attemptConnection();
    }
  }

  // Reset reconnection attempts (useful for retry logic)
  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}

export const webSocketService = new WebSocketService();