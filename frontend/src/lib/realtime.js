/**
 * Experimental: WebSocket Real-time Updates
 * Testing real-time notifications and live updates
 */

class RealtimeService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Connect to WebSocket server
   */
  connect(url, token) {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(`${url}?token=${token}`);

        this.socket.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.reconnectAttempts = 0;
          resolve(this.socket);
        };

        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.socket.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code);
          this.attemptReconnect(url, token);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect(url, token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(url, token);
    }, delay);
  }

  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    const { type, payload } = data;
    
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(payload));
    }

    // Also notify 'all' listeners
    if (this.listeners.has('all')) {
      this.listeners.get('all').forEach(callback => callback(data));
    }
  }

  /**
   * Subscribe to event type
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Send message to server
   */
  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default RealtimeService;
