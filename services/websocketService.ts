import { env } from "@/config/config";

// services/websocketService.ts
export interface WebSocketMessage {
  type: 'exit_confirmation' | 'security_alert' | 'response';
  pending_id?: string;
  token?: string;
  message?: string;
  confirmed?: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];


  constructor(private baseUrl: string = env.WS_URL) { }

  private notifyConnectionStatus() {
    this.connectionHandlers.forEach(handler => handler(this.isConnected));
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }


  connect(token: string) {
    if (this.isConnected) return;

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('token', token);
      const wsUrl = url.toString();

      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = (error) => this.handleError(error);

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.attemptReconnect(token);
    }
  }

  private handleOpen() {
    console.log('WebSocket connected successfully');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyConnectionStatus(); // Notify about connection change
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('WebSocket message received:', data);

      // Notify all message handlers
      this.messageHandlers.forEach(handler => handler(data));

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.isConnected = false;
    this.ws = null;
    this.notifyConnectionStatus(); // Notify about connection change


    // Attempt reconnect if it wasn't a clean close
    if (!event.wasClean) {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.attemptReconnect(token);
      }
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts} in ${this.reconnectInterval}ms`);

    setTimeout(() => {
      this.connect(token);
    }, this.reconnectInterval);
  }

  sendMessage(message: WebSocketMessage) {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
    }
    this.isConnected = false;
    this.ws = null;
    this.reconnectAttempts = 0;
  }

  onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  getDebugInfo() {
    return {
      connected: this.isConnected,
      url: this.baseUrl,
      reconnectAttempts: this.reconnectAttempts,
      messageHandlers: this.messageHandlers.length,
      connectionHandlers: this.connectionHandlers.length
    };
  }

  static getDebugInfo() {
    return webSocketService.getDebugInfo();
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();