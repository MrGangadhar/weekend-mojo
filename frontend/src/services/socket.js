import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: false,
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    initializeSocket();
  }
  return socket;
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinTripRoom = (tripId) => {
  if (socket && socket.connected) {
    socket.emit('join-trip', tripId);
  }
};

export const leaveTripRoom = (tripId) => {
  if (socket && socket.connected) {
    socket.emit('leave-trip', tripId);
  }
};

export const joinBusRoom = (busId) => {
  if (socket && socket.connected) {
    socket.emit('join-bus', busId);
  }
};

export const leaveBusRoom = (busId) => {
  if (socket && socket.connected) {
    socket.emit('leave-bus', busId);
  }
};

export const updateBusLocation = (data) => {
  if (socket && socket.connected) {
    socket.emit('bus-location-update', data);
  }
};