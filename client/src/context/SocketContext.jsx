import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [presenceMap, setPresenceMap] = useState({});

  useEffect(() => {
    if (!token || !user) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    const newSocket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('presence:request_all');
    });

    newSocket.on('presence:sync', (map) => {
      setPresenceMap(map);
    });

    newSocket.on('presence:update', ({ userId, status, online }) => {
      setPresenceMap(prev => ({
        ...prev,
        [userId]: online ? status : 'offline'
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id]);

  const setPresenceStatus = (status) => {
    if (socket) {
      socket.emit('presence:set_status', status);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, presenceMap, setPresenceStatus }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
