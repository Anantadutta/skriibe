import { io } from 'socket.io-client';

let socketErrorLogged = false;

const getDummySocket = () => ({
  on: () => {},
  off: () => {},
  emit: () => {},
  disconnect: () => {},
  connected: false,
  id: null
});

export const createSocket = (options = {}) => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;

  if (!socketUrl) {
    if (!socketErrorLogged) {
      console.warn("Socket connection aborted: VITE_SOCKET_URL environment variable is missing.");
      socketErrorLogged = true;
    }
    return getDummySocket();
  }

  try {
    new URL(socketUrl);
  } catch (err) {
    if (!socketErrorLogged) {
      console.warn(`Socket connection aborted: Invalid VITE_SOCKET_URL provided ("${socketUrl}").`);
      socketErrorLogged = true;
    }
    return getDummySocket();
  }

  return io(socketUrl, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
    ...options
  });
};
