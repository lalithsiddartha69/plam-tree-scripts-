/**
 * PALM GUARD IoT - WebSocket Service
 * Handles live telemetry and risk streaming from FastAPI backend with
 * auto-reconnect, heartbeat, and subscription dispatching.
 */

const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';

class WebSocketService {
  constructor(url = DEFAULT_WS_URL) {
    this.url = url;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.subscribers = new Map(); // eventType -> Set of callbacks
    this.statusListeners = new Set(); // state -> callbacks
    this.state = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'FALLBACK_POLLING'
    this.forcedClose = false;
  }

  updateState(newState) {
    this.state = newState;
    this.statusListeners.forEach((callback) => {
      try {
        callback(newState);
      } catch (err) {
        console.error('[WebSocket] Status listener error:', err);
      }
    });
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.state);
    return () => this.statusListeners.delete(callback);
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.forcedClose = false;
    this.updateState('CONNECTING');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected to Palm Guard Live Stream at', this.url);
        this.reconnectAttempts = 0;
        this.updateState('CONNECTED');
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.dispatch(message);
        } catch (err) {
          console.warn('[WebSocket] Malformed message received:', event.data);
        }
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Connection error:', error);
      };

      this.socket.onclose = (event) => {
        this.stopHeartbeat();
        if (!this.forcedClose) {
          console.warn(`[WebSocket] Closed (code: ${event.code}). Attempting reconnect...`);
          this.updateState('DISCONNECTED');
          this.scheduleReconnect();
        } else {
          this.updateState('DISCONNECTED');
        }
      };
    } catch (err) {
      console.error('[WebSocket] Failed to instantiate WebSocket:', err);
      this.updateState('DISCONNECTED');
      this.scheduleReconnect();
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() }));
      }
    }, 15000);
  }

  stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    if (this.reconnectAttempts >= 3) {
      // Suggest/signal fallback polling while background retries continue
      this.updateState('FALLBACK_POLLING');
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WebSocket] Max reconnect attempts reached. Waiting before next attempt.');
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts = 0;
        this.connect();
      }, 10000);
      return;
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      console.log(`[WebSocket] Reconnecting (Attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  disconnect() {
    this.forcedClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.updateState('DISCONNECTED');
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  dispatch(message) {
    const type = message.type || 'ALL';
    // Dispatch to specific listeners
    if (this.subscribers.has(type)) {
      this.subscribers.get(type).forEach((cb) => {
        try {
          cb(message.data || message);
        } catch (err) {
          console.error(`[WebSocket] Error in subscriber for ${type}:`, err);
        }
      });
    }
    // Also dispatch to wildcard listeners
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach((cb) => {
        try {
          cb(message);
        } catch (err) {
          console.error('[WebSocket] Error in wildcard subscriber:', err);
        }
      });
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }
}

export const wsService = new WebSocketService();
export default wsService;
