import { io } from 'socket.io-client';
import BASE_URL from '../endpoints/endpoints';

// Singleton socket instance
let socket = null;
let listeners = new Map();

// Event types for data updates
export const SOCKET_EVENTS = {
  NEW_ORDER: 'new-order',
  NEW_TOPUP: 'new-topup',
  ORDER_STATUS_UPDATE: 'order-status-update',
  NEW_SHOP_ORDER: 'new-shop-order',
  DATA_REFRESH: 'data-refresh',
  TRANSACTION_UPDATE: 'transaction-update',
};

// Initialize socket connection
export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(BASE_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    // console.log('[SocketService] Connected:', socket.id);
    const userId = localStorage.getItem('userId');
    if (userId) {
      socket.emit('register', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    // console.log('[SocketService] Disconnected:', reason);
  });

  // Listen for all data refresh events
  Object.values(SOCKET_EVENTS).forEach(event => {
    socket.on(event, (data) => {
      // console.log(`[SocketService] Received ${event}:`, data);
      notifyListeners(event, data);
    });
  });

  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Subscribe to socket events
export const subscribeToEvent = (event, callback) => {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(callback);

  // Return unsubscribe function
  return () => {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  };
};

// Subscribe to all data refresh events
export const subscribeToDataRefresh = (callback) => {
  const unsubscribers = Object.values(SOCKET_EVENTS).map(event => 
    subscribeToEvent(event, callback)
  );

  // Return function to unsubscribe from all
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

// Notify all listeners of an event
const notifyListeners = (event, data) => {
  const eventListeners = listeners.get(event);
  if (eventListeners) {
    eventListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[SocketService] Error in listener for ${event}:`, error);
      }
    });
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners.clear();
  }
};

export default {
  initSocket,
  getSocket,
  subscribeToEvent,
  subscribeToDataRefresh,
  disconnectSocket,
  SOCKET_EVENTS,
};
